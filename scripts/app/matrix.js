
define(() => {

    /**
     * Matrix class
     */
    class Matrix {

        /**
         * Construct a new matrix object.
         *
         * @param {Number} rows
         *      Row count
         *
         * @param {Number} cols
         *      Column count
         *
         * @param {Array} array
         *      An array contains the matrix data. Array length must be <code>rows</code> times <code>cols</code>.
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
         * @param {Array} array
         *      An array contains the matrix data, and the length must be a square number.
         *
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
         * @param {Number} rows
         *      Number of rows.
         *
         * @param {Number} cols
         *      Number of columns.
         *
         * @param {*} zero
         *      Zero element. Default value is numerical zero.
         *
         * @returns {Matrix}
         */
        static zero(rows, cols, zero = 0) {
            if ( rows < 0 || cols < 0 ) {
                throw new Error('Illegal arguments.');
            }
            return new Matrix(rows, cols, Array.from({length: rows * cols}, () => zero));
        }
        
        /**
         * Create a identity matrix.
         *
         * @param {Number} n
         *      Both row and column count.
         *
         * @param {*} one
         *      Identity element. Default value is numerical one.
         *
         * @param {*} zero
         *      Zero element. Default value is numerical zero.
         *
         * @returns {Matrix}
         */
        static identity(n, one = 1, zero = 0) {
            if ( n < 0  ) {
                throw new Error('Illegal arguments.');
            }
            
            return new Matrix(n, n, Array.from({length: n * n}, (x, i) => Math.floor(i / n) === i % n ? one : zero));
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
         * @param {Number} i
         *      Row index
         *
         * @param {Number} j
         *      Column index
         *
         * @returns {*}
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
         * @param {Number} i
         *      Row index
         *
         * @param {Number} j
         *      Column index
         *
         * @param {*} n New value
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
         * @param {Number} n
         *      Row index
         *
         * @returns {Array}
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
         * @param {Number} n
         *      Column index
         *
         * @returns {Array}
         */
        col(n) {
            let self = this;
            if ( n < 0 || n >= self._cols ) {
                throw new Error('Index out of bound: col=' + n);
            }
            return self._values.filter((x, i) => i % self._cols === n);
        }
        
        /**
         * Multiply this matrix with a scalar, and return the result.
         *
         * @param {Number} s Scalar number
         * @param {Function} multiply Multiplication function. Default is numerical multiplication.
         * @returns {Matrix}
         */
        scale(s, multiply = (a, b) => a * b) {
            let self = this;
            let _array = Array.from(self._values, x => multiply(s, x));
            return new Matrix(self.rows, self.cols, _array);
        }
    
        /**
         * Add this matrix with another one, and return the result.
         *
         * @param {Matrix} m
         *      Another matrix.
         *
         * @param {Function} add
         *      Addition function. Default is numerical addition.
         *
         * @returns {Matrix}
         */
        add(m, add = (a, b) => a + b) {
            let self = this;
            if ( self.rows !== m.rows && self.cols !== m.cols ) {
                throw new Error('Cannot add two matrices in different size.');
            }
            
            let _array = self._values.map((n, i) => add(n, m._values[i]));
            return new Matrix(self.rows, self.cols, _array);
        }
    
        /**
         * Add another matrix to this.
         *
         * @param {Matrix} m
         *      Another matrix.
         *
         * @param {Function} add
         *      Addition function. Default is numerical addition.
         *
         * @returns {Matrix}
         */
        append(m, add = (a, b) => a + b) {
            let self = this;
            if ( self.rows !== m.rows && self.cols !== m.cols ) {
                throw new Error('Cannot add two matrices in different size.');
            }
            self._values.forEach((n, i, a) => {
                a[i] = add(n, m._values[i]);
            });
            return self;
        }
    
        /**
         * Multiply this matrix with another. This function does not change this matrix, and it just returns the result.
         *
         * @param {Matrix} m
         *      Another matrix.
         *
         * @param {Function} multiply
         *      Multiplication function. Default is numerical multiplication.
         *
         * @param {Function} add
         *      Addition function. Default is numerical addition.
         *
         * @param {*} zero
         *      Zero element. Default value is numerical zero.
         *
         * @returns {Matrix}
         */
        multiply(m, multiply = (a, b) => a * b, add = (a, b) => a + b, zero = 0) {
            let self = this;
            if ( self.cols !== m.rows ) {
                throw new Error('Illegal matrix row: ' + m.rows);
            }
            
            let a = [];
            
            for ( let i = 0; i < self.rows; i++ ) {
                
                let n = self.cols;
                for ( let j = 0; j < m.cols; j++ ) {
                    
                    let p = zero;
                    for ( let k = 0; k < n; k++ ) {
                        let x = multiply(self.getValue(i, k), m.getValue(k, j));
                        p = add(p, x);
                    }
                    a.push(p);
                }
            }
            
            return new Matrix(self.rows, m.cols, a);
        }
        
        /**
         * Return the transpose matrix.
         *
         * @returns {Matrix}
         */
        transpose() {
            let self = this;
            
            let _array = Array.from(self._values);
            
            self._values.forEach((n, i) => {
                let _i = Math.floor(i / self._cols);
                let _j = i % self._cols;
                
                // [i * self._cols + j]
                _array[_j * self._rows + _i] = n;
            });
            
            return new Matrix(self._cols, self._rows, _array);
        }
    }
    
    return Matrix;
});