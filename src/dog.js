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
function Dog(descr) {
	this.setup(descr)
    // Default sprite, if not otherwise specified
    this._scale = 1;
	this.animations = makeDogAnimation(this._scale);
	this.animation = this.animations['walkingRight'];
};

Dog.prototype = new Enemy();

// Initial, inheritable, default values
Dog.prototype.cx = 0;
Dog.prototype.cy = 0;
Dog.prototype.velX = -1;
Dog.prototype.velY = 1;
Dog.prototype.airCounter = 0;
Dog.prototype.hp = 40;
Dog.prototype.damagePlayerCD = 60;
Dog.prototype.initialized = false;
Dog.prototype.angryCD = 0;
Dog.prototype._lastDir = "Right";
Dog.prototype.state = {
	jumping: false,
	offGround: false,
	onGround: true,
	angry: false,
	biting: false,
	inWater: false
};

Dog.prototype.update = function(du) {
	spatialManager.unregister(this);
	//check if this is inside the viewport
	var margin = this.getSize().sizeX; //margin outside of viewport we want to update
	if(this.cx+this.getSize().sizeX/2 < g_viewPort.x-margin ||
	   this.cx-this.getSize().sizeX/2 > g_viewPort.x+g_canvas.width+margin) return;
	   
	

	this.updateProxBlocks(this.cx, this.cy, this.cx+this.velX*du, this.cy+this.velY*du);
    if(this._isDeadNow) return entityManager.KILL_ME_NOW;

	//Handles if Dog is in water
    if(this.state['inWater']){
        this.maxVelX = 2.3;
        this.maxVelY = 1.1;
    }else {
        this.maxVelX = 3.9;
        this.maxVelY = 6.5;
    }
	if(this.damagePlayerCD > 0) this.damagePlayerCD -= du;
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
	
	if(this.state['angry']){
		this.cx += this.velX*du*1.4;
	}
	
	if(this.state['biting']){
		this.cx += this.velX*du*2;
	}
	
	// Fall down
	if(!standingOnSomething && this.velY < TERMINAL_VELOCITY && !this.state['inWater']){
		this.velY += NOMINAL_GRAVITY*du;
	}
	
	if(this.state['inWater'] && standingOnSomething) this.velY = -1;
	// Turn around
	if(walkingIntoSomething){
		this.velX *= -1;
	}
	
	
	//update status
	var dir;
	if(this.velX === 0) dir = this._lastDir || "Right";
	else{
		dir = (this.velX > 0 ? "Right" : "Left");
		this._lastDir = dir;
	}
	if(this.velY !== 0 && !this.state['inWater'] && this.airCounter > 1) this.status = "inAir"+dir;
	else if(this.state.inWater) this.status = "swimming"+dir;
	else this.status = "walking"+dir;
	
	if(this.velY !== 0) this.airCounter++;
	else this.airCounter = 0;
		
	this.animation = this.animations[this.status];
	
	this.animation.update(du);
	
	if(this.angryCD < 0) this.state['angry'] = false;
	else this.angryCD--;
		
    this.handleSpecificDogAction(du, dir);

	spatialManager.register(this);
};

Dog.prototype.render = function (ctx) {
	this.animation.renderAt(ctx, this.cx, this.cy, this.rotation);
};

Dog.prototype.knockBack = function(x,y) {
	this.velY = -2;
	this.angryCD = 150;
	this.state['angry'] = true;
};

Dog.prototype.getSize = function(){
    var size = {sizeX:35*this._scale,sizeY:20*this._scale};
    return size;
};

Dog.prototype.handleSpecificDogAction = function(du, dir) {
	// To be implemented in subclasses.
	var player = entityManager._character[0];
	if(!player) return;
	var px = player.cx;
	var py = player.cy;
	if(dir === "Left"){
		if(px < this.cx && (px + 400) > this.cx && Math.abs(py - this.cy) < 220){
			this.angryCD = 150;
			this.state['angry'] = true;
		}
	} else {
		if(px > this.cx && (px - 400) < this.cx && Math.abs(py - this.cy) < 220){
			this.state['angry'] = true;
			this.angryCD = 150;
		}
	}
	if(this.state['angry']){
		if(dir === "Left"){
			if(px < this.cx && (px + 120) > this.cx && Math.abs(py - this.cy) < 100 && !this.state['biting']){
				this.velY = -5;
				this.state['biting'] = true;
			}
		} else {
			if(px > this.cx && (px - 120) < this.cx && Math.abs(py - this.cy) < 100 && !this.state['biting']){
				this.velY = -5;
				this.state['biting'] = true;
			}
		}
	}	
};


Dog.prototype.handleCollision = function(hitEntity, axis) {
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

        // Bad fix to make Character decide what happens to it's subclasses (Dog, Zelda, Projectile)
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
					this.state['biting'] = false;
                    dir = 4;
                } 
                if(tEdge && this.velY < 0  && axis === "y"){// && this.velY < 0) {
                    this.velY *= -1;
                    dir = 1;
                    this.state['offGround'] = true;
                }
            }
            hitEntity.activate(this, dir);
        } else if (hitEntity instanceof Projectile){
			this.takeHit(hitEntity.radius);
			this.knockBack(hitEntity.cx, hitEntity.cy)
			hitEntity.takeHit();
		} else if (hitEntity instanceof Player && this.state['biting'] && this.damagePlayerCD <= 0){
			hitEntity.knockBack(this.cx, this.cy)
			hitEntity.takeHit(15);
			this.damagePlayerCD = 60;
		}
    return {standingOnSomething: standingOnSomething, walkingIntoSomething: walkingIntoSomething};
};
