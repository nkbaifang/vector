define(require => {
    'use strict';
    
    const GLOBAL = require('global');
    const THREE = require('three');
    const Vector = require('vector');
    const Object = require('object');
    
    const _create_scene = () => {
        let _scene = new THREE.Scene();

        let _light = new THREE.AmbientLight(0xffffff, 0.3);
        _scene.add(_light);

        _light = new THREE.DirectionalLight(0xffffff, 1,0);
        _light.position.set(100, 0, 100);
        _scene.add(_light);

        return _scene;
    };
    
    const _create_camera = (angle = 75, aspect = 1.0, near = 0.1, far = 1000) => {
        let _camera = new THREE.PerspectiveCamera(angle, aspect, near, far);
        _camera.up.set(0, 0, 1);
        
        return _camera;
    };
    
    const _create_renderer = (canvas) => {
        let _renderer = new THREE.WebGLRenderer({
            canvas: canvas,
            antialias: true
        });
        _renderer.setClearColor(0x404040);
        _renderer.gammaInput = true;
        _renderer.gammaOutput = true;

        _renderer.shadowMap.enabled = true;
        _renderer.shadowMap.type = THREE.PCFShadowMap;
        
        return _renderer;
    };

    const _create_object = (params) => {
        let _geometry = new THREE.SphereGeometry(params.radius, 64, 64);
        let _material = new THREE.MeshStandardMaterial({
            color: params.color,
            wireframe: false,
            roughness: 0.1,
            metalness: 0.3
        });

        let _sphere = new THREE.Mesh(_geometry, _material);
        _sphere.position.set(...params.p);

        _sphere.object = Object.of(params);
        return _sphere;
    };

    const _create_objects = (a = []) => {
        return a.reduce((s, c) => [...s, _create_object(c)], []);
    };

    const _next_position = (o, interval) => {
        return o.p.add(o.v.scale(interval));
    };
    
    const _module = {
        
        _renderer: undefined,
        _camera: undefined,
        _scene: undefined,
        _aid: undefined,
        _config: {},
        
        _objs: [],
        
        _add_line(start, end, material) {
            let self = this;
            let geometry = new THREE.Geometry();
            geometry.vertices.push(start);
            geometry.vertices.push(end);
            let line = new THREE.Line(geometry, material);
            self._scene.add(line);
        },

        _step() {
            let self = this;
            let _config = self._config;

            self._objs.forEach(sphere => {

                let o = sphere.object;

                if ( _config.box ) {

                    let [xmin, xmax] = _config.box.x;
                    let [ymin, ymax] = _config.box.y;
                    let [zmin, zmax] = _config.box.z;

                    let [px, py, pz] = o.p.values;
                    let [vx, vy, vz] = o.v.values;

                    let _hit = false;

                    if ( (px >= xmax - o.radius && vx > 0)
                        || (px <= xmin + o.radius && vx < 0) ) {
                        o.v.apply([
                            -1, 0, 0,
                            0, 1, 0,
                            0, 0, 1
                        ]);
                        _hit = true;
                    }

                    if ( (py >= ymax - o.radius && vy > 0)
                        || (py <= ymin + o.radius && vy < 0) ) {
                        o.v.apply([
                            1, 0, 0,
                            0, -1, 0,
                            0, 0, 1
                        ]);
                        _hit = true;
                    }

                    if ( (pz >= zmax - o.radius && vz > 0)
                        || (pz <= zmin + o.radius && vz < 0) ) {
                        o.v.apply([
                            1, 0, 0,
                            0, 1, 0,
                            0, 0, -1
                        ]);
                        _hit = true;
                    }

                    if ( _hit && !_config.elastic ) {
                        o.v.apply([
                            0.9, 0, 0,
                            0, 0.9, 0,
                            0, 0, 0.9
                        ]);
                    }
                }
                
                let _others = self._objs.reduce((a, s) => s === sphere ? [...a] : [...a, s.object], []);

                if ( _config.gravity ) {
                    let _f = o.gravityTo(self._config.G, ..._others);
                    o.a = _f.scale(1.0 / o.mass);
                }

                _others.forEach(b => {

                    let _dp = o.p.add(b.p.negative());
                    let _dpl = _dp.length;
                    if ( _dpl <= o.radius + b.radius ) {

                        let _np1 = _next_position(o, _config.interval);
                        let _np2 = _next_position(b, _config.interval);
                        
                        if ( _np1.add(_np2.negative()).length < _dpl ) {

                            let _sd = _dpl * _dpl;
                            let _dv = o.v.add(b.v.negative());   // o.v - b.v

                            let _a = _dp.dot(_dv);

                            let _m = 2.0 / (o.mass + b.mass);

                            o.v.append(_dp.scale(-_m * b.mass * _a / _sd));
                            b.v.append(_dp.negative().scale(-_m * o.mass * _a / _sd));
                        }
                    }

                });
            });

            self._objs.forEach(sphere => {
                let o = sphere.object;
                o.move(_config.interval);
            });
        },
        
        _draw() {
            let self = this;
            self._objs.forEach(sphere => {
                let o = sphere.object;
                sphere.position.set(...o.p.values);
            });

            self._renderer.render(self._scene, self._camera);
        },
        
        init(config = {
            G: 5e+3,
            interval: 1,
            control: false,
            elastic: true,
            gravity: false
        }) {
            let self = this;
            self._config = config;
            let _canvas = config.canvas;
            
            let _scene = _create_scene();
            let _camera = _create_camera(config.camera.angle, _canvas.width / _canvas.height, config.camera.near, config.camera.far);
            let _renderer = _create_renderer(_canvas);
            
            self._camera = _camera;
            self._scene = _scene;
            self._renderer = _renderer;
            
            self.reset();
            
            if ( config.control ) {
                let [_sx, _sy] = [];
                
                let _mouse_move = (event) => {
                    
                    let _phi = (_sx - event.clientX) * Math.PI / _canvas.width;
                    let _theta = (_sy - event.clientY) * Math.PI / _canvas.height;
                    
                    //console.log(`moving: (${event.clientX}, ${event.clientY}), angle: (${_phi}, ${_theta})`);
                    
                    let _camera = self._camera;
                    
                    /*
                    let _spherical = new THREE.Spherical().setFromVector3(_camera.position);
                    _spherical.theta -= _theta;
                    _spherical.phi += _phi;
                    _camera.position.setFromSpherical(_spherical);
                    */
                    let _euler = new THREE.Euler(0, _theta, _phi, 'XYZ');
                    _camera.position.applyEuler(_euler);
                    _camera.lookAt(0, 0, 0);
                    _camera.updateProjectionMatrix();
                    self._renderer.render(self._scene, self._camera);
    
                    [_sx, _sy] = [event.clientX, event.clientY];
                };
    
                let _mouse_up = (event) => {
                    event.preventDefault();
                    
                    _canvas.removeEventListener('mousemove', _mouse_move, false);
                    _canvas.removeEventListener('mouseup', _mouse_up, false);
                    _canvas.removeEventListener('mouseout', _mouse_up, false);
                };
                
                let _mouse_down = (event) => {
                    event.preventDefault();
                    
                    [_sx, _sy] = [event.clientX, event.clientY];
                    
                    _canvas.addEventListener('mousemove', _mouse_move, false);
                    _canvas.addEventListener('mouseup', _mouse_up, false);
                    _canvas.addEventListener('mouseout', _mouse_up, false);
                };
                
                let _mouse_wheel = (event) => {
                    let _delta = event.wheelDelta / 10;
                    let _camera = self._camera;
                    let _spherical = new THREE.Spherical().setFromVector3(_camera.position);
                    _spherical.radius -= _delta;
                    if ( _spherical.radius < 0 ) {
                        _spherical.radius = 0;
                        return;
                    }
                    _camera.position.setFromSpherical(_spherical);
                    _camera.lookAt(0, 0, 0);
                    _camera.updateProjectionMatrix();
                    self._renderer.render(self._scene, self._camera);
                };
                
                _canvas.addEventListener('mousedown', _mouse_down, false);
                _canvas.addEventListener('mousewheel', _mouse_wheel, false);
            }
            
            return self;
        },

        reset() {
            let self = this;
            let _config = self._config;

            self.stop();
            self._theta = 0;
            self._camera.position.set(..._config.camera.p);
            self._camera.lookAt(0, 0, 0);

            self._renderer.clear();
            self._scene.remove(...self._objs);
            self._objs.length = 0;
            let _objs = _create_objects(self._config.objs);
            self._objs.push(..._objs);
            _objs.forEach(c => {
                self._scene.add(c);
            });

            if ( _config.box ) {
                let [xmin, xmax] = _config.box.x;
                let [ymin, ymax] = _config.box.y;
                let [zmin, zmax] = _config.box.z;

                let material = new THREE.LineBasicMaterial({ color: 0x222222 });

                let _v1 = new THREE.Vector3(xmax, ymin, zmax);
                let _v2 = new THREE.Vector3(xmax, ymax, zmax);
                let _v3 = new THREE.Vector3(xmin, ymax, zmax);
                let _v4 = new THREE.Vector3(xmin, ymin, zmax);
                let _v5 = new THREE.Vector3(xmax, ymin, zmin);
                let _v6 = new THREE.Vector3(xmax, ymax, zmin);
                let _v7 = new THREE.Vector3(xmin, ymax, zmin);
                let _v8 = new THREE.Vector3(xmin, ymin, zmin);

                self._add_line(_v1, _v2, material);
                self._add_line(_v3, _v4, material);
                self._add_line(_v5, _v6, material);
                self._add_line(_v7, _v8, material);
                self._add_line(_v1, _v5, material);
                self._add_line(_v2, _v6, material);
                self._add_line(_v3, _v7, material);
                self._add_line(_v4, _v8, material);
                self._add_line(_v1, _v4, material);
                self._add_line(_v2, _v3, material);
                self._add_line(_v5, _v8, material);
                self._add_line(_v7, _v6, material);
            }

            self._renderer.render(self._scene, self._camera);
        },
        
        start() {
            let self = this;
            if ( typeof self._aid !== 'undefined' ) {
                return;
            }
            
            let _animation_step = function () {
                self._aid = GLOBAL.requestAnimationFrame(_animation_step);
                self._step();
                self._draw();
            };
            
            self._aid = GLOBAL.requestAnimationFrame(_animation_step);
        },

        rotate(e) {
            let self = this;
            self._rotating = !!e;
        },
        
        stop() {
            let self = this;
            if ( typeof self._aid !== 'undefined' ) {
                GLOBAL.cancelAnimationFrame(self._aid);
                delete self._aid;
            }
        }
    };
    
    return _module;
});