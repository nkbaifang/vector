define(require => {
    'use strict';
    
    const GLOBAL = require('global');
    const Matrix = require('matrix');
    const Vector = require('vector');
    const Line = require('line');

    const ROUND = 2 * Math.PI;

    const _module = {

        init(config={
            canvas: {},
            line: undefined
        }) {
            let self = this;
            self._config = config;
            self._line = new Line(...config.line);
            let _canvas = self._canvas = config.canvas.dom;

            let [w, h] = [_canvas.width / 2, _canvas.height / 2]
            self._tm = new Matrix(3, 2, [
                1, 0,
                0, -1,
                -w, h
            ]);
            self._rm = new Matrix(3, 2, [
                1, 0,
                0, -1,
                w, h
            ]);
            self._canvas = _canvas;

            let _mouse_move = (event) => {
                let rect = event.target.getBoundingClientRect();
                let [x, y] = [event.x - rect.left, event.clientY - rect.top];
                
                let mouse = new Vector(x, y, 1);
                let p = mouse.apply(self._tm)

                let s = self._line.symmetry(...p.values)

                let k = new Vector(s[0], s[1], 1).apply(self._rm);
                [x, y] = k.values;

                let _ctx = self._canvas.getContext('2d');
                _ctx.fillStyle = 'red';
                _ctx.beginPath();
                _ctx.arc(x, y, 2, 0, ROUND);
                _ctx.closePath();
                _ctx.fill();
            };

            _canvas.addEventListener('mousemove', _mouse_move, false);
        },

        clear() {
            self = this;
            let ctx = self._canvas.getContext('2d');
            ctx.clearRect(0, 0, self._canvas.width, self._canvas.height);
        }

    };

    return _module;
});