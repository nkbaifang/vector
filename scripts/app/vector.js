define(require => {
	'use strict';

	const Matrix = require('matrix');

	/**
	 * Vector class
	 */
	class Vector {

		/**
		 * Construct a new Vector object.
		 *
		 * @args Array|Number
		 */
		constructor(...args) {
			this._dim = Array.from(args.length > 1 ? args : args[0]);
		}

		/**
		 * Verify demensions of vectors.
		 *
		 * @param vs Vectors
		 * @private
		 */
		static _assert(...vs) {
			if ( vs.length <= 1 ) {
				return;
			}
			let [_first, ..._others] = vs;
			let _b = _others.every((v) => v.dim === _first.dim);
			if ( !_b ) {
				throw new Error('vectors in different dimensions');
			}
		}

		/**
		 * Create a zero vector of n dimensions.
		 *
		 * @param Number
		 * @returns {Vector}
		 */
		static zero(n) {
			return new Vector(Array.from({length: n}, () => 0));
		}

		/**
		 * Create a new vector by length and direction.
		 *
		 * @param len
		 * @param v
		 * @returns {Vector}
		 */
		static of(len, v) {
			let _s = len / v.length;
			return new Vector(Array.from(v._dim, x => x * _s));
		}

		/**
		 * The dimension of this vector.
		 *
		 * @returns {Number}
		 */
		get dim() {
			return this._dim.length;
		}

		/**
		 * The length of this vector.
		 *
		 * @returns {Number}
		 */
		get length() {
			return Math.sqrt(this._dim.reduce((s, v) => s + v * v, 0));
		}

		/**
		 *
		 * @returns {String}
		 */
		toString() {
			return '<' + this._dim.join(',') + '>';
		}

		/**
		 * Create a copy of this vector.
		 *
		 * @returns {Vector}
		 */
		copy() {
			let self = this;

			return new Vector(self._dim);
		}

		/**
		 * Check if this vector is a zero vector.
		 *
		 * @returns {Boolean}
		 */
		isZero() {
			return this._dim.every(n => n === 0);
		}

		/**
		 * Return the addition of this and other vectors. This function does not change this vector,
		 * it just returns a new Vector.
		 *
		 * @param vs
		 * @returns {Vector}
		 */
		add(...vs) {
			let self = this;
			let _av = [...vs, self];
			Vector._assert(..._av);

			let _t = _av.reduce((a, v) => [...a, ...v._dim], []);
			let _r = _t.reduce((r, a, i) => {
				r[i % r.length] += a;
				return r;
			}, Array.from({length: self.dim}, () => 0));
			return new Vector(_r);
		}

		/**
		 * Add other vectors to this vector.
		 *
		 * @param vs
		 * @returns {Vector} this
		 */
		append(...vs) {
			let self = this;
			Vector._assert(...vs);

			let len = self._dim.length;
			let _a = vs.reduce((a, v) => [...a, ...v._dim], []);
			_a.forEach((a, i) => {
				self._dim[i % len] += a;
			});
			return self;
		}

		/**
		 * Reverse this vector.
		 *
		 * @returns {Vector}
		 */
		reverse() {
			let self = this;
			self._dim.forEach((n, i, a) => {
				a[i] = -n;
			});
			return self;
		}

		/**
		 * Return the components of this vector.
		 *
		 * @returns {Number[]}
		 */
		get values() {
			return Array.from(this._dim, x => x);
		}

		/**
		 * Return the negative vector.
		 *
		 * @returns {Vector}
		 */
		minus() {
			return new Vector(Array.from(this._dim, x => -x));
		}

		/**
		 * Multiply this vector with a scalar. This function does not change this vector, it just returns a new vector.
		 *
		 * @param s
		 * @returns {Vector}
		 */
		scale(s) {
			return new Vector(Array.from(this._dim, x => x * s));
		}

		/**
		 * Return dot product of this vector and another one.
		 *
		 * @param v
		 */
		dot(v) {
			Vector._assert(this, v);
			return this._dim.reduce((s, x, i) => s + x * v._dim[i], 0);
		}

		/**
		 *
		 * @param Array|Matrix m
		 * @returns Vector this
		 */
		change(m) {
			let self = this;
			if ( self.dim * self.dim !== m.length ) {
				throw new Error("Invalid parameters.");
			}

			let m1 = new Matrix(1, self.dim, self._dim);
			let m2 = (m instanceof Matrix) ? m : Matrix.square(m);
			let m3 = m1.multiply(m2);
			self._dim = m3.row(0);
			return self;
		}
	}

	return Vector;

});