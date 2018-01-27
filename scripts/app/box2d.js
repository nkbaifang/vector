define(require => {
    'use strict';

    const GLOBAL = require('global');
    const Vector = require('vector');
    const Object = require('object');
    const Matrix = require('matrix');
    
    const ROUND = 2 * Math.PI;
    
    const _create_objects = (a = []) => {
        return a.reduce((s, c) => [...s, Object.of(c)], []);
    };

    const _next_position = (o, interval) => {
        return o.p.add(o.v.scale(interval));
    };
    
    const _module = {
        
        _ctx: undefined,
        _aid: undefined,

        _config: {},
        _tm: undefined,
        _objs: [],
        
        _clear() {
            let self = this;
            let _canvas = self._config.canvas.dom;
            self._ctx.fillStyle = self._config.canvas.background;
            self._ctx.clearRect(0, 0, _canvas.width, _canvas.height);
            self._ctx.fillRect(0, 0, _canvas.width, _canvas.height);
        },
        
        _step() {
            let self = this;
            let _config = self._config;

            self._objs.forEach(o => {
                
                if ( _config.box ) {
                    
                    let [xmin, xmax] = _config.box.x;
                    let [ymin, ymax] = _config.box.y;
                    
                    let [px, py] = o.p.values;
                    let [vx, vy] = o.v.values;
    
                    if ( (px >= xmax - o.radius && vx > 0)
                        || (px <= xmin + o.radius && vx < 0) ) {
                        o.v.apply([
                            -1, 0,
                            0, 1
                        ]);
                    }
    
                    if ( (py >= ymax - o.radius && vy > 0)
                        || (py <= ymin + o.radius && vy < 0) ) {
                        o.v.apply([
                            1, 0,
                            0, -1
                        ]);
                    }
                }
                
                let _others = self._objs.filter(a => a !== o);
                
                if ( _config.gravity ) {
                    let _f = o.gravityTo(self._config.G, ..._others);
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
            let _ctx = self._ctx;
            self._clear();
            self._objs.forEach(o => {
                _ctx.fillStyle = o.color;
                _ctx.beginPath();
                let [x, y] = o.p.values;
                let _radius = o.radius;
                
                if ( self._tm ) {
                    let _p = o.p.expand(1).apply(self._tm);
                    [x, y] = _p.values;
                    _radius = Math.ceil(_radius * self._tm.getValue(0, 0));
                    if ( _radius < 1 ) {
                        _radius = 1;
                    }
                    //console.log(`object: p=(${x}, ${y}), r=${_radius}`);
                }
                
                _ctx.arc(x, y, _radius, 0, ROUND);
                _ctx.closePath();
                _ctx.fill();
            });
        },
        
        init(config = {
            canvas: {},
            G: 5e+3,
            interval: 1,
            gravity: false
        }) {
            let self = this;
            self._config = config;
            
            if ( self._config.transform ) {
                self._tm = new Matrix(3, 2, self._config.transform);
            }
            
            let _canvas = config.canvas.dom;
            
            self._ctx = _canvas.getContext('2d');
            
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
            
            let _animation_step = () => {
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