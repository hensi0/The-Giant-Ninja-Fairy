// ==========
// Character STUFF
// ==========

"use strict";

/* jshint browser: true, devel: true, globalstrict: true */

/*
0        1         2         3         4         5         6         7         8
12345678901234567890123456789012345678901234567890123456789012345678901234567890
*/


// A generic contructor which accepts an arbitrary descriptor object
function Character(descr) {

    // Common inherited setup logic from Entity
    this.setup(descr);

    //this.rememberResets();
    
    // Default sprite, if not otherwise specified
    this.sprite = g_sprites.marioTest;
    this._scale = 0.03;
	this._isAlive = true;
};
// This comes later on when Entity has been implemented: 
Character.prototype = new Entity();

Character.prototype.rememberResets = function () {
    // Remember my reset positions
    this.reset_cx = this.cx;
    this.reset_cy = this.cy;
    this.reset_rotation = this.rotation;
};

// Keys
Character.prototype.KEY_LEFT   = 37; //Left-arrow key code
Character.prototype.KEY_RIGHT  = 39; //Right-arrow key code
Character.prototype.KEY_PLUMMET = 38; //Down-arrow key code
Character.prototype.KEY_JUMP   = ' '.charCodeAt(0);
Character.prototype.KEY_JAB = 'Z'.charCodeAt(0); // Implement method for this?
Character.prototype.KEY_SHOOT  = 'X'.charCodeAt(0);

// Initial, inheritable, default values
Character.prototype.cx = 200;
Character.prototype.cy = 200;
Character.prototype.velX = 0;
Character.prototype.velY = 0;
Character.prototype.startingHeight = 200;
Character.prototype.jumpHeight = 30;
Character.prototype.jumping = false;

// Sounds (should be preloaded and initialized in constructor):
// Character.prototype.warpSound = new Audio(
//    "sounds/CharacterWarp.ogg");


Character.prototype.jump = function () {
	this.jumping = true;
};

Character.prototype.updateJump = function() {
	if(this.cy >= this.startingHeight) {
		this.jumping = false;
		return;
	}else if(this.cy  <= this.startingHeight - this.jumpHeight) {
		this.cy -= 5;
	} else {
		this.cy += 5;
	}
};

Character.prototype.shoot = function () {
    if (keys[this.KEY_FIRE]) {
    
        var dX = +Math.sin(this.rotation);
        var dY = -Math.cos(this.rotation);
        var launchDist = this.getRadius() * 1.2;
        
        var relVel = this.launchVel;
        var relVelX = dX * relVel;
        var relVelY = dY * relVel;

        entityManager.fireBullet(
           this.cx + dX * launchDist, this.cy + dY * launchDist,
           this.velX + relVelX, this.velY + relVelY,
           this.rotation);
           
    }
};

Character.prototype.takeDamage = function () {

};

Character.prototype.reset = function () {
    this.setPos(this.reset_cx, this.reset_cy);
};


Character.prototype.update = function (du) {
	// if(!this._isAlive) return entityManager.KILL_ME_NOW;

    // Perhaps do this in substeps?
	if (keys[this.KEY_LEFT]) {
        this.cx -= 5;
    }
	if (keys[this.KEY_RIGHT]) {
        this.cx += 5;
    }
	if (keys[this.KEY_JUMP]) {
		this.jump();
	}
	if (keys[this.KEY_SHOOT]) {
		this.shoot();
	}

	this.updateJump();
	this.cx += this.velX*du;
	this.cy += this.velY*du;
};

Character.prototype.render = function (ctx) {
        console.log("Am rendering character");
        var origScale = this.sprite.scale;
        // pass my scale into the sprite, for drawing
        this.sprite.scale = this._scale;
        this.sprite.drawWrappedCentredAt(
    	ctx, this.cx, this.cy, this.rotation
    );
};
