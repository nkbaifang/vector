define((require, exports, module) => {
    'use strict';
    
    const THREE = require('three');
    const GLOBAL = require('global');

    const {Vector, Object} = require('3d');
    
    const _create_scene = () => {
        let _scene = new THREE.Scene();

	    let _light = new THREE.AmbientLight(0xffffff, 0.3);
	    _scene.add(_light);

	    _light = new THREE.DirectionalLight(0xffffff, 1,0);
	    _light.position.set(100, 0, 100);
	    _scene.add(_light);

        return _scene;
    };
    
    const _create_camera = (angle = 75, aspect = 1.0) => {
        let _camera = new THREE.PerspectiveCamera(angle, aspect, 0.5, 1000);
        //let _camera = new THREE.OrthographicCamera(_FRUSTUM * aspect / -2, _FRUSTUM * aspect / 2, _FRUSTUM / -2, _FRUSTUM / 2, 10, 1000);
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
	    //_renderer.shadowMap.type = THREE.PCFSoftShadowMap;
	    _renderer.shadowMap.type = THREE.PCFShadowMap;
        
        return _renderer;
    };

    const _create_sphere = (params) => {
        let _geometry = new THREE.SphereGeometry(params.radius, 64, 64);
        let _material = new THREE.MeshStandardMaterial({
            color: params.color,
            wireframe: false,
            roughness: 0.1,
            metalness: 0.3
        });
        let _sphere = new THREE.Mesh(_geometry, _material);
        let [px, py, pz] = params.p;
        _sphere.position.set(px, py, pz);
        let _object = new Object(px, py, pz);
        _object.mass = params.mass;
		_object.color = params.color;

        if ( params.v ) {
	        let [vx, vy, vz] = params.v;
	        _object.v = new Vector(vx, vy, vz);
        }
		
		if ( params.a ) {
			let [ax, ay, az] = params.a;
			_object.a = new Vector(ax, ay, az);
		}

        _sphere.object = _object;
        return _sphere;
    };

	const _next_position = (o, interval) => {
		let _np = o.p.add(o.v.scale(interval));
		return _np;
	};

    const _DELTA_THETA = Math.PI / 180;
    
    const _module = {
        
        _renderer: undefined,
        _camera: undefined,
        _scene: undefined,
        _aid: undefined,
        _config: {},

        _rotating: false,
        
        _objs: [],

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

		            if ( (px >= xmax - o.radius && vx > 0)
			            || (px <= xmin + o.radius && vx < 0) ) {
						console.log(`x: before : color=${o.color}, o.v=${o.v}`);
			            o.v.change([
				            -1, 0, 0,
				            0, 1, 0,
				            0, 0, 1
			            ]);
						console.log(`z: after : color=${o.color}, o.v=${o.v}`);
		            }

		            if ( (py >= ymax - o.radius && vy > 0)
			            || (py <= ymin + o.radius && vy < 0) ) {
						console.log(`y: before : color=${o.color}, o.v=${o.v}`);
			            o.v.change([
				            1, 0, 0,
				            0, -1, 0,
				            0, 0, 1
			            ]);
						console.log(`y: after : color=${o.color}, o.v=${o.v}`);
		            }

		            if ( (pz >= zmax - o.radius && vz > 0)
			            || (pz <= zmin + o.radius && vz < 0) ) {
						console.log(`z: before : color=${o.color}, o.v=${o.v}`);
			            o.v.change([
				            1, 0, 0,
				            0, 1, 0,
				            0, 0, -1
			            ]);
						console.log(`z: after : color=${o.color}, o.v=${o.v}`);
		            }
	            }

	            let _others = self._objs.reduce((a, s) => {
	                if ( s !== sphere ) {
	                    a.push(s.object);
		            }
		            return a;
	            }, []);

	            if ( _config.gravity ) {
		            let _f = o.gravityTo(..._others);
		            o.a = _f.scale(1.0 / o.mass);
	            }

	            _others.forEach(b => {

		            let _dp = o.p.add(b.p.minus());
		            let _dpl = _dp.length;
		            if ( _dpl < o.radius + b.radius ) {

			            let _np1 = _next_position(o, _config.interval);
			            let _np2 = _next_position(b, _config.interval);
						
			            if ( _np1.add(_np2.minus()).length < _dpl ) {

							console.log('before: o.v=' + o.v + ', b.v=' + b.v);

				            let _sd = _dpl * _dpl;
				            let _dv = o.v.add(b.v.minus());   // o.v - b.v

				            let _a = _dp.dot(_dv);

				            let _m = 2.0 / (o.mass + b.mass);

				            o.v.append(_dp.scale(-_m * b.mass * _a / _sd));
				            b.v.append(_dp.minus().scale(-_m * o.mass * _a / _sd));
							console.log('after: o.v=' + o.v + ', b.v=' + b.v);
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
        
        init(config) {
            let self = this;
            self._config = config;
            let _canvas = config.canvas;
            
            let _scene = _create_scene();
            
            let _camera = _create_camera(config.camera.angle, _canvas.width / _canvas.height);
            
            let _renderer = _create_renderer(_canvas);
            
            self._camera = _camera;
            self._scene = _scene;
            self._renderer = _renderer;
            
            self.reset();
            
            return self;
        },

        reset() {
            let self = this;

            self.stop();
            self._theta = 0;
	        self._camera.position.set(...self._config.camera.p);
	        self._camera.lookAt(0, 0, 0);

	        self._renderer.clear();
	        self._scene.remove(...self._objs);
	        self._objs.length = 0;
	        let _objs = self._config.objs || [];
	        _objs.forEach(c => {
		        let _sphere = _create_sphere(c);
		        self._objs.push(_sphere);
		        self._scene.add(_sphere);
	        });
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