
define(require => {
	'use strict';
	
	let Vector = require('vector');
	
	const ROUND = 2 * Math.PI;
	const G = 5e+3;
	
	class Vector2D extends Vector {
		
		constructor(x = 0, y = 0) {
			super(x, y);
		}
		
		get x() {
			return this._dim[0];
		}
		
		get y() {
			return this._dim[1];
		}
	}
	
	class Point2D {
		
		constructor([x = 0, y = 0] = [], [vx = 0, vy = 0] = [], [ax = 0, ay = 0] = []) {
			let self = this;
			self._p = new Vector2D(x, y);
			self._v = new Vector2D(vx, vy);
			self._a = new Vector2D(ax, ay);
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
			self.p.append(_v0.scale(t).add(self._a.scale(0.5 * t * t)));   // equivalent: s = v0 * t + 0.5 * a * t^2
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
		
		draw(ctx) {
			let self = this;
			ctx.beginPath();
			let [x, y] = self.p.values;
			ctx.arc(x, y, 1, 0, ROUND);
			ctx.closePath();
			ctx.fill();
		}
	}
	
	class Circle2D extends Point2D {
		
		constructor(x, y, r = 1, c = 'rgb(0, 0, 0)') {
			super([x, y]);
			this._radius = r;
			this._color = c;
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
		
		draw(ctx) {
			let self = this;
			ctx.fillStyle = self.color;
			ctx.beginPath();
			let [x, y] = self.p.values;
			ctx.arc(x, y, self.radius, 0, ROUND);
			ctx.closePath();
			ctx.fill();
		}
	}
	
	class Object2D extends Circle2D {
		
		constructor(x, y, m = 1, c = 'rgb(0, 0, 0)' ) {
			super(x, y);
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
		
		gravityTo(...objs) {
			let self = this;
			
			let _v = objs.reduce((v, o) => {
				let _d = o.p.add(self.p.minus());
				let _dl = _d.length;
				let _f = G * self.mass * o.mass / (_dl * _dl);
				v.append(Vector.of(_f, _d));
				return v;
			}, Vector.zero(2));
			
			return _v;
		}
	}
	
	return {
		Point: Point2D,
		Vector: Vector2D,
		Circle: Circle2D,
		Object: Object2D
	};
});