define(require => {
	'use strict';

	const Matrix = require('matrix');
	
	const _assert = (...vs) => {
        if ( vs.length <= 1 ) {
            return;
        }
        let [_first, ..._others] = vs;
        let _b = _others.every((v) => v.dim === _first.dim);
        if ( !_b ) {
            throw new Error('vectors in different dimensions');
        }
	};

	/**
	 * Vector class
	 */
	class Vector {
        
        /**
         * Construct a new Vector object. The constructor function can be invoked in two forms.<br/>
         *      &nbsp;&nbsp;&nbsp;<code>new Vector(3, 4, 5)</code><br/>
         * or<br/>
         *      &nbsp;&nbsp;&nbsp;<code>new Vector([3, 4, 5])</code><br/>
         *
         * @param {Array|Number} args
         *      Vector components
         */
		constructor(...args) {
			this._dim = Array.from(args.length > 1 ? args : args[0]);
		}

		/**
		 * Create a zero vector of n dimensions.
		 *
		 * @param {Number} n
		 *      Dimension of new vector.
		 *
		 * @returns {Vector}
		 */
		static zero(n) {
			return new Vector(Array.from({length: n}, () => 0));
		}

		/**
		 * Create a new vector by length and direction.
		 *
		 * @param {Number} len
		 *      Length of new vector.
		 *
		 * @param {Vector} v
		 *      Direction of new vector.
		 *
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
		 * The direction of this vector.
		 */
		get dir() {
			let self = this;
			return Vector.of(self.length, self);
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
		 * @param {Vector} vs
		 *      Other vectors
		 *
		 * @returns {Vector}
		 */
		add(...vs) {
			let self = this;
			let _av = [...vs, self];
			_assert(..._av);

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
		 * @param {Vector} vs
		 *      Other vectors
		 *
		 * @returns {Vector} this
		 */
		append(...vs) {
			let self = this;
			_assert(...vs);

			let len = self._dim.length;
			let _a = vs.reduce((a, v) => [...a, ...v._dim], []);
			_a.forEach((a, i) => {
				self._dim[i % len] += a;
			});
			return self;
		}

		/**
		 * Expand this vector to a higher dimension by adding extra components. This function does not change this
		 * vector, it just returns a new vector.
		 *
		 * @param {Number} ns
		 *      Additional components
		 *
		 * @returns {Vector}
		 */
		expand(...ns) {
			let self = this;
			let _dim = [...self._dim, ...ns];
			return new Vector(_dim);
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
		 * @returns {Array}
		 */
		get values() {
			return Array.from(this._dim, x => x);
		}

		/**
		 * Set the components of this vector.
		 *
		 * @param {Number} values
		 */
		set(...values) {
			let self = this;
			self._dim = Array.from(values);
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
		 * @param {Number} s
		 *
		 * @returns {Vector}
		 */
		scale(s) {
			return new Vector(Array.from(this._dim, x => x * s));
		}

		/**
		 * Return dot product of this vector and another one.
		 *
		 * @param {Vector} v
		 */
		dot(v) {
			_assert(this, v);
			return this._dim.reduce((s, x, i) => s + x * v._dim[i], 0);
		}

		/**
		 * Change this vector by multipling another matrix.
		 *
		 * @param {Array|Matrix} m
		 *      Square matrix
		 *
		 * @returns {Vector} this
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
        
        /**
         * Create a matrix.
         *
         * @param {Boolean} column
         *      Whether the result is a column vector.
         *
         * @returns {Matrix}
         */
		matrix(column = false) {
			let self = this;
			let [_rows, _cols] = [column ? self.dim : 1, column ? 1 : self.dim];
			return new Matrix(_rows, _cols, self._dim);
		}
	}

	return Vector;

});