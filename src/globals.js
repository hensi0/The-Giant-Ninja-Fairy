// =======
// GLOBALS
// =======
/*

Evil, ugly (but "necessary") globals, which everyone can use.

*/

"use strict";

/* jshint browser: true, devel: true, globalstrict: true */

var g_canvas = document.getElementById("myCanvas");
var g_ctx = g_canvas.getContext("2d");

var g_oldCanvasStyle = g_canvas.style.display;
//g_canvas.style.display = "none";

// The "nominal interval" is the one that all of our time-based units are
// calibrated to e.g. a velocity unit is "pixels per nominal interval"
//

var NOMINAL_UPDATE_INTERVAL = 16.666;
var NOMINAL_GRAVITY = 0.42;
var TERMINAL_VELOCITY = 10.5;

//gold
var g_gold = 0;
var g_skills = [];

//audio
var g_mute = true;

//zoom in on screen to control camera movement
var g_CameraZoom = 1.4;

// Multiply by this to convert seconds into "nominals"
var SECS_TO_NOMINALS = 1000 / NOMINAL_UPDATE_INTERVAL;

// Prevent spacebar from scrolling page, esp. when console is open.
window.onkeydown = function(e) {
	if(e.keyCode == " ".charCodeAt(0) || e.keyCode == 38 || e.keyCode == 40) e.preventDefault();
}