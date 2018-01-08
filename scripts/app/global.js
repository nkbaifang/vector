
define((require, exports, module) => {
	
	window.requestAnimationFrame = window.requestAnimationFrame ||
		window.webkitRequestAnimationFrame ||
		window.mozRequestAnimationFrame ||
		window.msRequestAnimationFrame ||
		window.oRequestAnimationFrame ||
		function (callback) {
			return setTimeout(callback, Math.floor(1000 / 60));
		};
	
	window.cancelAnimationFrame = window.cancelAnimationFrame ||
		window.webkitCancelAnimationFrame ||
		window.mozCancelAnimationFrame ||
		window.msCancelAnimationFrame ||
		window.oCancelAnimationFrame ||
		function (...args) {
			clearTimeout(...args);
		};
	
	return window;
});