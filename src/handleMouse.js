// ==============
// MOUSE HANDLING
// ==============

"use strict";

/* jshint browser: true, devel: true, globalstrict: true */

/*
0        1         2         3         4         5         6         7         8
12345678901234567890123456789012345678901234567890123456789012345678901234567890
*/

var g_mouseX = 0,
    g_mouseY = 0;

function handleMouse(evt) {
    
    g_mouseX = evt.clientX - g_canvas.offsetLeft;
    g_mouseY = evt.clientY - g_canvas.offsetTop;
    
    // If no button is being pressed, then bail
    var button = evt.buttons === undefined ? evt.which : evt.buttons;
    if (!button) return;
	if(button === 1) entityManager._character[0].LMB();
	if(button === 2) entityManager._character[0].RMB();
	if(button === 4) entityManager._character[0].swap(true);
}

function stopZeShootin() {
	entityManager._character[0].stopZeShootin();
  //entityManager._gun[entityManager._selectedGun].stopShooting();
};

var g_mouseLocked = false;

// pointer lock object forking for cross browser

g_canvas.requestPointerLock = g_canvas.requestPointerLock ||
                            g_canvas.mozRequestPointerLock;

document.exitPointerLock = document.exitPointerLock ||
                           document.mozExitPointerLock;

g_canvas.onclick = function() {
  canvas.requestPointerLock();
};

// pointer lock event listeners

// Hook pointer lock state change events for different browsers
document.addEventListener('pointerlockchange', lockChangeAlert, false);
document.addEventListener('mozpointerlockchange', lockChangeAlert, false);

function lockChangeAlert() {
  if (document.pointerLockElement === g_canvas ||
      document.mozPointerLockElement === g_canvas) {
    g_mouseLocked = true;
	g_isUpdatePaused = false;
    document.addEventListener("mousemove", updatePosition, false);
  } else {
	g_isUpdatePaused = true;
	//g_canvas.style.display = "none";
    g_mouseLocked = true;
    document.removeEventListener("mousemove", updatePosition, false);
  }
};

var g_mouseX2 = g_canvas.width/2;
var g_mouseY2 = g_canvas.height/2;

function updatePosition(e) {
  var RADIUS = 4;
  
  g_mouseX2 += e.movementX*0.9;
  g_mouseY2 += e.movementY*0.9;
  
  if (g_mouseX2 > g_canvas.width + RADIUS) {
    g_mouseX2 = g_canvas.width + RADIUS;
  }
  if (g_mouseY2 > g_canvas.height + RADIUS) {
    g_mouseY2 = g_canvas.height + RADIUS;
  }  
  if (g_mouseX2 < -RADIUS) {
    g_mouseX2 = -RADIUS;
  }
  if (g_mouseY2 < -RADIUS) {
    g_mouseY2 = -RADIUS;
  }
};


// Handle "down" and "move" events the same way.
window.addEventListener("mousedown", handleMouse);
window.addEventListener("mousemove", handleMouse);
document.addEventListener('mouseup', stopZeShootin, false);

