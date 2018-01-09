define(require => {
    'use strict';

	const GLOBAL = require('global');
    const Vector = require('vector');
    const {Object} = require('2d');

    const _create_object = (params) => {
	    let _object = new Object(...params.p);
	    _object.mass = params.mass;
	    _object.radius = params.radius;
	    _object.color = params.color;

	    if ( params.v ) {
		    _object.v = new Vector(...params.v);
	    }

	    if ( params.a ) {
		    _object.a = new Vector(...params.a);
	    }

	    return _object;
    };
    
    const _create_objects = (a = []) => {
        let _result = [];
        a.forEach(c => {
	        let _obj = _create_object(c);
    
            _result.push(_obj);
        });
        return _result;
    };

	const _next_position = (o, interval) => {
		return o.p.add(o.v.scale(interval));
	};
    
    const _module = {
        
        _width: undefined,
        _height: undefined,
        _ctx: undefined,
        _aid: undefined,

        _config: {},
        _objs: [],

	    _gravity_to(one, ...others) {
            let self = this;
            const G = self._config.G;
		    let _v = others.reduce((v, o) => {
			    let _d = o.p.add(one.p.minus());
			    let _dl = _d.length;
			    let _f = G * one.mass * o.mass / (_dl * _dl);
			    v.append(Vector.of(_f, _d));
			    return v;
		    }, Vector.zero(2));

		    return _v;
	    },
        
        _clear() {
            let self = this;
            self._ctx.clearRect(0, 0, self._width, self._height);
        },
        
        _step() {
            let self = this;
            let _config = self._config;

            self._objs.forEach(o => {
                
                let [px, py] = o.p.values;
                let [vx, vy] = o.v.values;
                
                if ( (py >= self._height - o.radius && vy > 0)
                    || (py <= o.radius && vy < 0) ) {
                    o.v.change([
                        1, 0,
                        0, -1
                    ]);
                }
                
                if ( (px >= self._width - o.radius && vx > 0)
                    || (px <= o.radius && vx < 0) ) {
                    o.v.change([
                        -1, 0,
                        0, 1
                    ]);
                }
                
                let _others = self._objs.filter(a => a !== o);
                
                if ( _config.gravity ) {
                    let _f = self._gravity_to(o, ..._others);
                //    let _f = o.gravityTo(..._others);
                    o.a = _f.scale(1.0 / o.mass);
                }
                
                _others.forEach(b => {
                    
                    let _dp = o.p.add(b.p.minus());
                    
                    let _dpl = _dp.length;
                    if ( _dpl < o.radius + b.radius ) {
                        
                        let _np1 = _next_position(o, _config.interval);
                        let _np2 = _next_position(b, _config.interval);
                        if ( _np1.add(_np2.minus()).length < _dpl ) {
                            
                            let _sd = _dpl * _dpl;
                            let _dv = o.v.add(b.v.minus());   // o.v - b.v
                            
                            let _a = _dp.dot(_dv);
                            
                            let _m = 2.0 / (o.mass + b.mass);
                            
                            o.v.append(_dp.scale(-_m * b.mass * _a / _sd));
                            b.v.append(_dp.minus().scale(-_m * o.mass * _a / _sd));
                        }
                    }
                    
                });
            });
            
            self._objs.forEach(o => {
                o.move(_config.interval);
            });
        },

	    _draw() {
		    let self = this;

		    self._clear();
		    self._objs.forEach(o => {
			    o.draw(self._ctx);
		    });
	    },
        
        init(config = {
            G: 5e+3,
            interval: 1,
            gravity: false
        }) {
            let self = this;
            self._config = config;
            
            let _canvas = config.canvas;
            let _ctx = _canvas.getContext("2d");
            _ctx.fillStyle = 'rgb(0, 0, 0)';
            
            self._ctx = _ctx;
            self._width = _canvas.width;
            self._height = _canvas.height;
            
            self.reset();
            
            return self;
        },
        
        reset() {
            let self = this;
            self._clear();
            self._objs.length = 0;
            let _objs = _create_objects(self._config.objs);
            self._objs.push(..._objs);
            self._draw();
        },
        
        start() {
            let self = this;
            
            let _animation_step = function () {
                self._step();
                self._draw();
                self._aid = GLOBAL.requestAnimationFrame(_animation_step);
            };
            
            self._aid = GLOBAL.requestAnimationFrame(_animation_step);
        },
        
        stop() {
            let self = this;
            GLOBAL.cancelAnimationFrame(self._aid);
        }
    };
    
    return _module;
});