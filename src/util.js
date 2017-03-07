// util.js
//
// A module of utility functions, with no private elements to hide.
// An easy case; just return an object containing the public stuff.

"use strict";


var util = {


resetSpatialManager: function(){
	spatialManager._nextSpatialID = 1;
	spatialManager._entities = [];
},

resetEntityManager: function(){
	entityManager._character = [];
	entityManager._bullets = [];
	entityManager._particles = [];
	entityManager._world = [];
	entityManager._collisionBlocks = [];
	entityManager._enemies = [];
	entityManager._objects = [];
	entityManager._level = 1;
	entityManager.deferredSetup();

	g_score.reset();
},


// RANGES
// ======

clampRange: function(value, lowBound, highBound) {
    if (value < lowBound) {
	value = lowBound;
    } else if (value > highBound) {
	value = highBound;
    }
    return value;
},

wrapRange: function(value, lowBound, highBound) {
    while (value < lowBound) {
	value += (highBound - lowBound);
    }
    while (value > highBound) {
	value -= (highBound - lowBound);
    }
    return value;
},

isBetween: function(value, lowBound, highBound) {
    if (value < lowBound) { return false; }
    if (value > highBound) { return false; }
    return true;
},


// RANDOMNESS
// ==========

randRange: function(min, max) {
    return (min + Math.random() * (max - min));
},


// MISC
// ====

square: function(x) {
    return x*x;
},

printTwoDimentionalArray: function(x) {
    for(var i = 0; i < x.length ; i++){
		var string = "";
		
		for(var j = 0; j < x[0].length ; j++){
			var string = string + x[i][j];
		}
		console.log(string);
	}
},

// DISTANCES
// =========

distSq: function(x1, y1, x2, y2) {
    return this.square(x2-x1) + this.square(y2-y1);
},

wrappedDistSq: function(x1, y1, x2, y2, xWrap, yWrap) {
    var dx = Math.abs(x2-x1),
	dy = Math.abs(y2-y1);
    if (dx > xWrap/2) {
	dx = xWrap - dx;
    };
    if (dy > yWrap/2) {
	dy = yWrap - dy;
    }
    return this.square(dx) + this.square(dy);
},


// CANVAS OPS
// ==========

clearCanvas: function (ctx) {
    var prevfillStyle = ctx.fillStyle;
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.fillStyle = prevfillStyle;
},

strokeCircle: function (ctx, x, y, r) {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.stroke();
},

fillCircle: function (ctx, x, y, r) {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
},

fillBox: function (ctx, x, y, w, h, style) {
    var oldStyle = ctx.fillStyle;
    ctx.fillStyle = style;
    ctx.fillRect(x, y, w, h);
    ctx.fillStyle = oldStyle;
},

//=======
// AUDIO
//=======

play: function (audio) {
    audio.pause();
    audio.currentTime = 0;
    if (!g_mute) try {audio.play(); } catch(err) {}
},

playLoop: function (audio, sVol) {
	if(g_mute) return;
    backgroundMusic.pause();
    backgroundMusic = audio;
	backgroundMusic.volume = sVol;
    backgroundMusic.currentTime = 0;
    if (!g_isMuted) {
        try {
            backgroundMusic.addEventListener('timeupdate', function(){
				var buffer = 0.40
                if(this.currentTime > this.duration - buffer){
                    this.currentTime = 0
                    this.play();
                }
				backgroundMusic.volume = Math.min(0.5, backgroundMusic.volume + 0.06);
				backgroundMusic2.volume = Math.max(0, backgroundMusic2.volume - 0.06);
				if(backgroundMusic2.volume === 0) backgroundMusic2.pause();
				}, false);
            backgroundMusic.play();
        } catch(err) {}
    };
},

crossfadeLoop: function (audio) {
	if(g_mute) return;
	var time = backgroundMusic.currentTime;
    backgroundMusic2 = backgroundMusic.cloneNode();
	backgroundMusic2.volume =  0.5;
	backgroundMusic2.currentTime = time + 0.24;
	backgroundMusic2.play();
	
	this.playLoop(audio, 0.04);
},

drawHUD: function (ctx, x, y) {
	var P = entityManager._character[0];
	var hp = Math.max(0,P.HP / P.maxhp);
	var mana = Math.max(0, P.mana / P.maxMana); 
	var s = g_canvas.width/10;
	var t = g_canvas.height/10;
	g_sprites.charIcons.drawAt(ctx, x - 4.77*s, y - 4.53*t);	
	g_sprites.HUD.drawBarsAt(ctx,x- 4.1*s,y - 5*t, 296, hp*187,40);
	g_sprites.HUD.drawBarsAt(ctx,x- 4.1*s,y - 4.6*t, 353, mana*183,40);
	g_sprites.HUD.drawAt(ctx, x - 5*s, y - 5*t, 0);
	ctx.font = "30px Comic Sans MS";
	ctx.fillStyle = "yellow";
	ctx.textAlign = "left";
	ctx.fillText("" + g_gold,x- 3.5*s, y - 3.7*t)
	
}
};
