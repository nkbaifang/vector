
define(require => {
    'use strict';
    
    const GLOBAL = require('global');
    const Vector = require('vector');
    const Object = require('object');
    
    const _template = {
        mass: 1,
        radius: 2,
        p: [10, 10],
        a: [0, 1],
        v: [4, 0]
    };
    
    const _module = {
    
        _ctx: undefined,
        _aid: undefined,
    
        _config: {},
        _time: 0,
        _objs: [],
        
        _draw_object(o) {
            let self = this;
            
            console.log(`object: ${o}`);
            
            let _ctx = self._ctx;
            _ctx.fillStyle = o.color;
            _ctx.beginPath();
            let [x, y] = o.p.values;
    
            _ctx.arc(x, y, o.radius, 0, Math.PI * 2);
            _ctx.closePath();
            _ctx.fill();
        },
    
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
            
            let [_d, _m] = self._objs;
            
            _d.move(_config.interval);
            
            let _p0 = new Vector(..._template.p);
            let _v0 = new Vector(..._template.v);
            
            let _p = _p0.add(_v0.scale(self._time)).add(_m.a.scale(0.5 * self._time * self._time));   // p = p0 + v0*t + 0.5 * a * t^2
            
            _m.p.set(..._p.values);
            
            self._time++;
        },
    
        _draw() {
            let self = this;
         //   self._clear();
            
            self._objs.forEach(o => {
                self._draw_object(o);
            });
        },
    
        init(config = {
            canvas: {},
            G: 5e+3,
            interval: 1
        }) {
            let self = this;
            self._config = config;
        
            let _canvas = config.canvas.dom;
            self._ctx = _canvas.getContext('2d');
        
            self.reset();
        
            return self;
        },
    
        reset() {
            let self = this;
            self._time = 0;
            self._clear();
            self._objs.length = 0;
            
            let _d = Object.of(_template);
            _d.color = 'rgb(255, 0, 0)';
            let _m = Object.of(_template);
            _m.color = 'rgb(0, 255, 0)';
            _m.p.set(200, 10);
            self._objs.push(_d);
            self._objs.push(_m);
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