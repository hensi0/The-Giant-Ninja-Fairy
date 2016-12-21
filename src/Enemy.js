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
function Enemy(descr) {
	this.setup(descr)
    // Default sprite, if not otherwise specified
    this._scale = 2.5;
	if(typeof makeEnemyAnimation == 'function') {
		this.animations = makeEnemyAnimation(this._scale);
		this.animation = this.animations['walkingRight'];
	}
};

// This comes later on when Entity has been implemented: 
Enemy.prototype = new Character();

// Initial, inheritable, default values
Enemy.prototype.cx = 500;
Enemy.prototype.cy = 483;
Enemy.prototype.velX = -1;
Enemy.prototype.velY = 1;
Enemy.prototype.HP = 1;
Enemy.prototype.initialized = false;
Enemy.prototype._lastDir = "Right";
Enemy.prototype.state = {
jumping: false,
offGround: false,
onGround: true,
inWater: false
};

Enemy.prototype.update = function(du) {
	spatialManager.unregister(this);
	
	//check if this is inside the viewport
	var margin = this.getSize().sizeX; //margin outside of viewport we want to update
	if(this.cx+this.getSize().sizeX/1.5 < g_viewPort.x-margin ||
	   this.cx-this.getSize().sizeX/1.5 > g_viewPort.x+g_canvas.width+margin) return;
	   
	

	this.updateProxBlocks(this.cx, this.cy, this.cx+this.velX*du, this.cy+this.velY*du);
    if(this._isDeadNow) return entityManager.KILL_ME_NOW;

	//Handles if enemy is in water
    if(this.state['inWater']){
        this.maxVelX = 2.3;
        this.maxVelY = 1.1;
    }else {
        this.maxVelX = 3.9;
        this.maxVelY = 6.5;
    }
	
	var nextX = this.cx+this.velX*du;
    var nextY = this.cy+this.velY*du;
	var prevX = this.cx;
    var prevY = this.cy;
	
    this.state['inWater'] = false;
	
	//check left/right collisions first and then top/bottomx
    var walkingIntoSomething = this.handlePartialCollision(nextX,prevY,"x");
	var standingOnSomething = this.handlePartialCollision(prevX,nextY,"y");
	// update location
    this.cx += this.velX*du;
    this.cy += this.velY*du;
	
	// Fall down
	if(!standingOnSomething && this.velY < TERMINAL_VELOCITY && !this.state['inWater']){
		this.velY += NOMINAL_GRAVITY*du;
	}
	
	if(this.state['inWater'] && standingOnSomething) this.velY = -1;
	// Turn around
	if(walkingIntoSomething){
		this.velX *= -1;
	}
	
	if(this.cy > g_canvas.height){
        this._isDeadNow = true;
    }
	
	//update status
	var dir;
	if(this.velX === 0) dir = this._lastDir || "Right";
	else{
		dir = (this.velX > 0 ? "Right" : "Left");
		this._lastDir = dir;
	}
	if(this.velY !== 0 && !this.state['inWater']) this.status = "inAir"+dir;
	else if(this.state.inWater) this.status = "swimming"+dir;
	else this.status = "walking"+dir;
	
	this.animation = this.animations[this.status];
	
	this.animation.update(du);
	
		
    this.handleSpecificEnemyAction(du);

	spatialManager.register(this);
}



Enemy.prototype.getSize = function(){
    var size = {sizeX:10*this._scale,sizeY:15*this._scale};
    return size;
}

Enemy.prototype.handleSpecificEnemyAction = function(du) {
	// To be implemented in subclasses.
}


Enemy.prototype.handleCollision = function(hitEntity, axis) {
    var bEdge,lEdge,rEdge,tEdge;
    var standingOnSomething = false;
    var walkingIntoSomething = false;


        // Lots of vars for type of collision: top, bottom, same column, same row, going by zelda center coordinate, left coordinate, right, etc.
        var charCoords = entityManager._world[0].getBlockCoords(this.cx, this.cy); //This is going by char's center, which is her lower half. Upper half needs to be in i, j-1.
        var charCoordsLeft = entityManager._world[0].getBlockCoords(this.cx-this.getSize().sizeX/2, this.cy); //This is going by char's bottom left corner
        var charCoordsRight = entityManager._world[0].getBlockCoords(this.cx+this.getSize().sizeX/2, this.cy); //This is going by char's bottom right corner
        var hitCoords = (hitEntity instanceof Block ? [hitEntity.i, hitEntity.j] : entityManager._world[0].getBlockCoords(hitEntity.cx+this.getSize().sizeX/2, hitEntity.cy));

        var charAbove = (hitCoords[0] > charCoords[0]); // char block coordinates lower because y-axis points down.
        var charBelow = (hitCoords[0] < charCoords[0]);
        var charToLeft = (hitCoords[1] > charCoords[1]); // char column coords must be lower.
        var charToRight = (hitCoords[1] < charCoords[1]);
        var sameCol = (hitCoords[1] == charCoordsLeft[1] || hitCoords[1] == charCoordsRight[1]);
        var sameRow = (hitCoords[0] == charCoords[0] || hitCoords[0] == charCoords[0]-1) || this.state['jumping'];

        lEdge = charToRight && sameRow;
        rEdge = charToLeft && sameRow;
        tEdge = charBelow && sameCol;
        bEdge = charAbove && sameCol;

        // Bad fix to make Character decide what happens to it's subclasses (Enemy, Zelda, Projectile)
        if(hitEntity instanceof Block) {
            var dir = 0; //direction of hit
            if(!hitEntity._isPassable) {
                standingOnSomething = standingOnSomething || bEdge;
                if(lEdge && this.velX < 0 && axis === "x") {
                    walkingIntoSomething = walkingIntoSomething || true;
                }
                if(rEdge && this.velX > 0 && axis === "x") {
                    walkingIntoSomething = walkingIntoSomething || true;
                }
                if(bEdge && this.velY > 0 && axis === "y") {
                    this.tempMaxJumpHeight = this.cy - this.maxPushHeight; 
                    var groundY = entityManager._world[0].getLocation((hitEntity.i), (hitEntity.j))[1] // block top y coordinate
                    this.putToGround(groundY);
                    dir = 4;
                } 
                if(tEdge && this.velY < 0  && axis === "y"){// && this.velY < 0) {
                    this.velY *= -1;
                    dir = 1;
                    this.state['offGround'] = true;
                }
            }
            hitEntity.activate(this, dir);
        }
    return {standingOnSomething: standingOnSomething, walkingIntoSomething: walkingIntoSomething};
}
