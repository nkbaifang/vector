
define(require => {
	'use strict';

	/**
	 * Matrix class
	 */
	class Matrix {

		/**
		 * Construct a new matrix object.
		 *
		 * @param rows  Number of rows
		 * @param cols  Number of columns
		 * @param array  An array contains the matrix data. Array length must be <code>rows</code> times <code>cols</code>.
		 */
		constructor(rows = 0, cols = 0, array = []) {
			let self = this;
			if ( rows < 0 || cols < 0 || array.length !== rows * cols ) {
				throw new Error('Illegal arguments.');
			}

			self._rows = rows;
			self._cols = cols;
			self._values = Array.from(array);
		}

		/**
		 * Create a square matrix with data.
		 *
		 * @param array  An array contains the matrix data, and the length must be a square number.
		 * @returns {Matrix}
		 */
		static square(array = []) {
			let _rows = Math.floor(Math.sqrt(array.length));
			if ( _rows * _rows !== array.length ) {
				throw new Error('Illegal arguments.');
			}
			return new Matrix(_rows, _rows, array);
		}

		/**
		 * Create a matrix which items are all zero.
		 *
		 * @param rows
		 * @param cols
		 * @returns {Matrix}
		 */
		static zero(rows, cols) {
			if ( rows < 0 || cols < 0 ) {
				throw new Error('Illegal arguments.');
			}
			return new Matrix(rows, cols, Array.from({length: rows * cols}, () => 0));
		}

		/**
		 * Create a identity matrix.
		 *
		 * @param n
		 * @returns {Matrix}
		 */
		static identity(n) {
			if ( n < 0  ) {
				throw new Error('Illegal arguments.');
			}
			
			return new Matrix(n, n, Array.from({length: n * n}, (x, i) => Math.floor(i / n) == i % n ? 1 : 0));
		}

		/**
		 * Rows of this matrix.
		 *
		 * @returns {Number}
		 */
		get rows() {
			return this._rows;
		}

		/**
		 * Columns of this matrix.
		 *
		 * @returns {Number}
		 */
		get cols() {
			return this._cols;
		}

		/**
		 * Return the array contains all the items of this matrix.
		 *
		 * @returns {Array}
		 */
		get values() {
			let self = this;
			let _result = [];
			
			let _index = 0;
			while ( _index < self._values.length ) {
				_result.push(self._values.slice(_index, _index + self._cols));
				_index += self._cols;
			}
			return _result;
		}

		/**
		 * Return the item value.
		 *
		 * @param i
		 * @param j
		 * @returns {Number}
		 */
		getValue(i, j) {
			let self = this;
			if ( j < 0 || j >= self._cols || i < 0 || i >= self._rows ) {
				throw new Error('Index out of bound: (' + i + ', ' + j + ')');
			}
			return self._values[i * self._cols + j];
		}

		/**
		 * Change the item value.
		 *
		 * @param i
		 * @param j
		 * @param n {Number}
		 */
		setValue(i, j, n) {
			let self = this;
			if ( j < 0 || j >= self._cols || i < 0 || i >= self._rows ) {
				throw new Error('Index out of bound: (' + i + ', ' + j + ')');
			}
			if ( typeof n !== 'number' ) {
				throw new Error('Invalid value type: ' + typeof n);
			}
			self._values[i * self._cols + j] = n;
		}

		/**
		 * Get one row of this matrix.
		 *
		 * @param n
		 * @returns {Number[]}
		 */
		row(n) {
			let self = this;
			if ( n < 0 || n >= self._rows ) {
				throw new Error('Index out of bound: row=' + n);
			}
			return self._values.slice(n, n + self._cols);
		}

		/**
		 * Get one column of this matrix.
		 *
		 * @param n
		 * @returns {Number[]}
		 */
		col(n) {
			let self = this;
			if ( n < 0 || n >= self._cols ) {
				throw new Error('Index out of bound: col=' + n);
			}
			return self._values.filter((x, i) => i % self._cols === n);
		}

		scale(s) {
			let self = this;
			let _array = Array.from(self._values, x => x * s);
			return new Matrix(self.rows, self.cols, _array);
		}

		/**
		 * Multiply this matrix with another. This function does not change this matrix, and it just returns the result.
		 *
		 * @param m
		 * @param multiplication  Multiplication function.
		 * @returns {Matrix}
		 */
		multiply(m, multiplication = (a, b) => a * b) {
			let self = this;
			if ( self.cols !== m.rows ) {
				throw new Error('Illegal matrix row: ' + m.rows);
			}
			
			let a = [];
			
			let i = 0;
			while ( i < self.rows ) {
				
				let n = self.cols;
				let j = 0;
				while ( j < m.cols ) {
					
					let p = 0;
					let r = 0;
					while ( r < n ) {
						p += multiplication(self.getValue(i, r), m.getValue(r, j)); // self.getValue(i, r) * m.getValue(r, j);
						r++;
					}
					a.push(p);
					
					j++;
				}
				
				i++;
			}
			
			return new Matrix(self.rows, m.cols, a);
		}
	}
	
	return Matrix;
});