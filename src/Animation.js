// ===============
// ANIMATION STUFF
// ===============

"use strict";

/* jshint browser: true, devel: true, globalstrict: true */


// Construct an animation from a sprite sheet
function Animation (image, frameY, frameWidth, frameHeight, numFrames, interval, scale) {
	this.image = image;
    this.sprites = this.loadSprites(frameY,frameWidth,frameHeight,numFrames,scale);
    this.numFrames = numFrames;
    this.interval = (interval/1000)*60; // The input interval should be in milliseconds
    this.frameTimeLeft = this.interval;
    this.direction = Math.sign(scale);
}

// A signal to let the character know that now would be a good time to transition into another animation!
Animation.prototype.TRANSITION_OPPORTUNITY = 1; //nice to have this truthy!
// The current frame of animation
Animation.prototype.frameNum = 0;
Animation.prototype.updateFrameNum = function(du){
	var finishedCycle = false
	while(this.frameTimeLeft <=0){
		this.frameNum = (this.frameNum+1);
		if(this.frameNum >= this.numFrames){
			this.frameNum = 0;
			finishedCycle = true;
		}
		this.frameTimeLeft += this.interval;
	}
	this.frameTimeLeft -= du;
	return finishedCycle;
}

Animation.prototype.update = function (du) {
	// returns a constant that can be used to time transitions
	if(this.updateFrameNum(du)) return this.TRANSITION_OPPORTUNITY;
};

// reset animation
Animation.prototype.reset = function(){
	this.frameNum = 0;
	this.frameTimeLeft = this.interval;
}

Animation.prototype.renderAt = function(ctx,cx,cy,rot){
	if (rot === undefined) rot = 0;
	var frame = this.sprites[this.frameNum];
	frame.drawCentredAt(ctx,cx,cy,rot);
};

Animation.prototype.loadSprites = function(y,w,h,n,s){
	var sprites = []
	for (var i = 0; i < n; i++) {
		var sprite = new Sprite(this.image);
		sprite.sx = i*w;
		sprite.sy = y;
		sprite.width = w;
		sprite.height = h;
		sprite.scale = s;
		sprite.drawAt = function(ctx,x,y){
			ctx.drawImage(this.image, this.sx, this.sy, this.width, this.height, x, y, this.width, this.height);
		};
		sprites.push(sprite);
	};
	return sprites;
};