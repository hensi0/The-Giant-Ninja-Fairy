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
    this._scale = 1;
	this.isAlive = true;
};
// This comes later on when Entity has been implemented: 
Character.prototype = new Entity();

Character.prototype.rememberResets = function () {
    // Remember my reset positions
    this.reset_cx = this.cx;
    this.reset_cy = this.cy;
    this.reset_rotation = this.rotation;
};

// Initial, inheritable, default values
Character.prototype.hp = 100;
Character.prototype.cx = 200;
Character.prototype.cy = 500;
Character.prototype.velX = 0;
Character.prototype.velY = 0;
Character.prototype.isAlive = true;


//collision blocks 
Character.prototype.proxBlocks = []; 

Character.prototype.findProxBlocks = function(prevX, prevY, nextX, nextY) {
    var collisionInfo = entityManager._world[0].collidesWith(this, prevX, prevY, nextX, nextY);
    this.proxBlocks = collisionInfo.blocks;
    //entityManager.setBoxCentres(this.proxBlocks, collisionInfo.coords);
}

Character.prototype.registerBlocks = function() {
    for(var b in this.proxBlocks) if(this.proxBlocks[b]) spatialManager.register(this.proxBlocks[b]);
}

Character.prototype.unregisterBlocks = function() {
    for(var b in this.proxBlocks) if(this.proxBlocks[b]) spatialManager.unregister(this.proxBlocks[b]);
}

Character.prototype.updateProxBlocks = function(prevX, prevY, nextX, nextY) {
    this.unregisterBlocks();
	if(this._isDeadNow) return;
    this.findProxBlocks(prevX, prevY, nextX, nextY);
    this.registerBlocks();
}


//=================
// COLLISION STUFFS
//=================

Character.prototype.putToGround = function(groundY) {
    this.state['jumping'] = false;
    this.state['offGround'] = false;
    this.state['onGround'] = true;
    this.velY = 0;
    this.cy = groundY - this.getSize().sizeY/2; // character centre coordinate on ground.

}

Character.prototype.takeHit = function() {
    console.log("OOOUCH");
}

Character.prototype.handlePartialCollision = function(charX,charY,axis,callback){
    var bEdge,lEdge,rEdge,tEdge;
    var standingOnSomething = false;
    var walkingIntoSomething = false;
    if(this.isColliding(charX, charY)) {
        var hitEntities = this.findHitEntities(charX, charY);
        for(var hit in hitEntities) {
            var hitEntity = hitEntities[hit];
            var collisionVars =  this.handleCollision(hitEntity, axis);
            standingOnSomething = standingOnSomething || collisionVars.standingOnSomething;
            walkingIntoSomething = walkingIntoSomething || collisionVars.walkingIntoSomething;           
        }
    }
    if(axis === "x") return walkingIntoSomething;
    if(axis === "y") return standingOnSomething;
}

// Sounds (should be preloaded and initialized in constructor):
// Character.prototype.warpSound = new Audio(
//    "sounds/CharacterWarp.ogg");

/*
Character.prototype.jump = function () {
	if()
};

Character.prototype.updateJump = function() {

};

*/

Character.prototype.takeDamage = function (dmg) {
	
};

Character.prototype.reset = function () {
    this.setPos(this.reset_cx, this.reset_cy);
};


Character.prototype.update = function (du) {
	if(this.hp <= 0) this.isAlive = false;
	if(!this.isAlive) return entityManager.KILL_ME_NOW;
	
	console.log("std unit update");
	
};

Character.prototype.render = function (ctx) {
        var origScale = this.sprite.scale;
        // pass my scale into the sprite, for drawing
        this.sprite.scale = this._scale;
        this.sprite.drawCentredAt(
    	ctx, this.cx, this.cy, this.rotation
    );
};
