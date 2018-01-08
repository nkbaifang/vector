define(require => {
    'use strict';
    
    const {Vector, Object} = require('2d');
    const GLOBAL = require('global');
    
    const _next_position = (o, interval) => {
        let _np = o.p.add(o.v.scale(interval));
        return _np;
    };
    
    const _create_objects = (a = []) => {
        let _result = [];
        a.forEach(c => {
            let o = new Object(c.p[0], c.p[1]);
            if ( c.v ) {
                o.v = new Vector(c.v[0], c.v[1]);
            }
            if ( c.a ) {
                o.a = new Vector(c.a[0], c.a[1]);
            }
            o.mass = c.mass;
            o.radius = c.radius;
            o.color = c.color;
    
            _result.push(o);
        });
        return _result;
    };
    
    const _module = {
        
        _width: undefined,
        _height: undefined,
        _ctx: undefined,
        _id: undefined,
        
        _gravity: false,
        
        _interval: undefined,
        _config: {},
        _objs: [],
        
        _clear() {
            let self = this;
            self._ctx.clearRect(0, 0, self._width, self._height);
        },
        
        _draw() {
            let self = this;
            
            self._clear();
            self._objs.forEach(o => {
                o.draw(self._ctx);
            });
        },
        
        _step() {
            let self = this;

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
                
                if ( self._gravity ) {
                    let _f = o.gravityTo(..._others);
                    o.a = _f.scale(1.0 / o.mass);
                }
                
                _others.forEach(b => {
                    
                    let _dp = o.p.add(b.p.minus());
                    
                    let _dpl = _dp.length;
                    if ( _dpl < o.radius + b.radius ) {
                        
                        let _np1 = _next_position(o, self._interval);
                        let _np2 = _next_position(b, self._interval);
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
                o.move(self._interval);
            });
        },
        
        init(params) {
            let self = this;
            self._config = params;
            self._gravity = !!self._config.gravity;
            
            let canvas = params.canvas;
            let _ctx = canvas.getContext("2d");
            _ctx.fillStyle = 'rgb(0, 0, 0)';
            
            self._interval = params.interval || 0.1;
            
            self._ctx = _ctx;
            self._width = canvas.width;
            self._height = canvas.height;
            
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
                self._id = GLOBAL.requestAnimationFrame(_animation_step);
            };
            
            self._id = GLOBAL.requestAnimationFrame(_animation_step);
        },
        
        stop() {
            let self = this;
            GLOBAL.cancelAnimationFrame(self._id);
        }
    };
    
    return _module;
});