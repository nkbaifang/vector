
define(require => {
	'use strict';
	
	let Vector = require('vector');
	
	class Point3D {
		
		constructor(x = 0, y = 0, z = 0) {
			let self = this;
			self._p = new Vector(x, y, z);
			self._v = new Vector(0, 0, 0);
			self._a = new Vector(0, 0, 0);
		}
		
		get p() {
			return this._p;
		}
		
		set p(p) {
			this._p = p;
		}
		
		get v() {
			return this._v;
		}
		
		set v(v) {
			this._v = v;
		}
		
		get a() {
			return this._a;
		}
		
		set a(a) {
			this._a = a;
		}
		
		move(t = 1) {
			let self = this;
			let _v0 = self.v.copy();
			self.v.append(self.a.scale(t)); // equivalent: v = v0 + a * t
			self.p.append(_v0.scale(t).add(self.a.scale(0.5 * t * t)));   // equivalent: s = v0 * t + 0.5 * a * t^2
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
	
	class Sphere3D extends Point3D {
		
		constructor(x, y, z, r = 1) {
			super(x, y, z);
			this._radius = r;
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
	}
	
	class Object3D extends Sphere3D {
		
		constructor(x, y, z, m = 1, c = 'rgb(0, 0, 0)' ) {
			super(x, y, z);
			this._mass = m;
			this.color = c;
			this._fixed = false;
		}
		
		get fixed() {
			return !!this._fixed;
		}
		
		set fixed(f) {
			this._fixed = !!f;
		}
		
		get mass() {
			return this._mass;
		}
		
		set mass(m) {
			this._mass = m;
		}
		
		move(...args) {
			let self = this;
			if ( self.fixed ) {
				return;
			}
			super.move.apply(self, args);
		}
		
		get momentum() {
			return this.v.scale(this.mass);
		}
		
		get energy() {
			return 0.5 * this.mass * this.v.dot(this.v);
		}
	}
	
	return {
		Point: Point3D,
		Sphere: Sphere3D,
		Object: Object3D
	};
});