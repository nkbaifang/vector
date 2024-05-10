define(require => {
    'use strict';

    const GLOBAL = require('global');
    const THREE = require('three');
    const Object = require('object');

    const _create_scene = () => {
        let _scene = new THREE.Scene();

        let _light = new THREE.AmbientLight(0xffffff, 0.7);
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
        _config: {},

        _objs: [],

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

            let _objs = [];
            let [r, g, b] = [0, 0, 0];

            let _step = 32;
            for ( let r = 0; r < 256; r += _step ) {
                for ( let g = 0; g < 256; g += _step ) {
                    for ( let b = 0; b < 256; b += _step ) {
                        let _c = `rgb(${r}, ${g}, ${b})`;
                        console.log("Color: " + _c);
                        _objs.push({
                            p: [r * 10, g * 10, b * 10],
                            color: _c,
                            mess: 10,
                            radius: 4,
                            v: [0, 0, 0]
                        });
                    }
                }
            }

            self._config.objs = _objs;

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

            self._draw();

            return self;
        },

        reset() {
            let self = this;
            let _config = self._config;

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

            self._renderer.render(self._scene, self._camera);
        },

        rotate(e) {
            let self = this;
            self._rotating = !!e;
        },
    };

    return _module;
});