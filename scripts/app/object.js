
define(require => {
    'use strict';
    
    const Vector = require('vector');
    
    class Object {
        
        constructor(...ps) {
            let self = this;
            self._p = new Vector(...ps);
            self._v = Vector.zero(ps.length);
            self._a = Vector.zero(ps.length);
            self._mass = 0;
            self._radius = 0;
            self._color = 'rgb(0, 0, 0)';
            self._fixed = false;
        }
        
        static of(params = {
            mass: 0,
            radius: 0,
            color: 'rgb(0, 0, 0)',
            fixed: false,
            p: []
        }) {
            let obj = new Object(...params.p);
            if ( params.v ) {
                obj.v = new Vector(params.v);
            }
            if ( params.a ) {
                obj.a = new Vector(params.a);
            }
            obj.mass = params.mass;
            obj.color = params.color;
            obj.radius = params.radius;
            obj.fixed = params.fixed;
            return obj;
        }
        
        get p() {
            return this._p;
        }
        
        set p(p) {
            let self = this;
            if ( p.dim !== self._p.dim ) {
                throw new Error('Different dimension: p');
            }
            
            self._p.set(...p.values);
        }
        
        get v() {
            return this._v;
        }
        
        set v(v) {
            let self = this;
            if ( v.dim !== self._v.dim ) {
                throw new Error('Different dimension: v');
            }
            
            self._v.set(...v.values);
        }
        
        get a() {
            return this._a;
        }
        
        set a(a) {
            let self = this;
            if ( a.dim !== self._a.dim ) {
                throw new Error('Different dimension: a');
            }
            
            self._a.set(...a.values);
        }
        
        get mass() {
            return this._mass;
        }
        
        set mass(m) {
            this._mass = m;
        }
        
        get radius() {
            return this._radius;
        }
        
        set radius(r) {
            this._radius = r;
        }
        
        get color() {
            return this._color;
        }
        
        set color(c) {
            this._color = c;
        }
        
        get fixed() {
            return this._fixed;
        }
        
        set fixed(f) {
            let self = this;
            self._fixed = !!f;
            if ( self._fixed ) {
                let _dim = self.v.dim;
                self._v = Vector.zero(_dim);
            }
        }
        
        gravityTo(g, ...others) {
            let self = this;
            return others.reduce((v, o) => {
                let _d = o.p.add(self.p.negative());
                let _dl = _d.length;
                let _f = g * self.mass * o.mass / (_dl * _dl);
                v.append(Vector.of(_f, _d));
                return v;
            }, Vector.zero(self.p.dim));
        }
    
        move(t = 1) {
            let self = this;
            if ( !self.fixed ) {
                self.v.append(self.a.scale(t));
                self.p.append(self.v.scale(t));
            }
            return self;
        }
    
        toString() {
            return JSON.stringify(this, (k, v) => {
                if ( v instanceof Vector ) {
                    return v.toString();
                }
                return v;
            });
        }
        
    }
    
    return Object;
});