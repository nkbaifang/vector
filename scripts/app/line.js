define(require => {
    'use strict';

    const Matrix = require('matrix');
    const Vector = require('vector');

    class Line {

        constructor(a, b, c) {
            let self = this;
            let a2 = a * a;
            let b2 = b * b;
            let _lamda = 1 / (b2 + a2);
            let _alpha = (b2 - a2) * _lamda;
            let _beta = -2 * a * b * _lamda;
            let _tau1 = -2 * a * c  * _lamda;
            let _tau2 = -2 * b * c  * _lamda;
            self._rotate = new Matrix(2, 2, [_alpha, _beta, _beta, -_alpha]);
            self._shift = new Matrix(2, 1, [_tau1, _tau2]);
        }

        symmetry(x, y) {
            let self = this;
            let c = new Matrix(2, 1, [x, y]);
            let s = self._rotate.multiply(c).add(self._shift);
            return s.col(0);
        }

    }

    return Line;
});