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
function Bat(descr) {
	this.setup(descr)
    // Default sprite, if not otherwise specified
    this._scale = 1;
	this.animations = makeBatAnimation(this._scale*0.8);
	this.animation = this.animations['walkingRight'];
};

Bat.prototype = new Enemy();

// Initial, inheritable, default values
Bat.prototype.cx = 0;
Bat.prototype.cy = 0;
Bat.prototype.velX = -1;
Bat.prototype.velY = 1;
Bat.prototype.HP = 40;
Bat.prototype.maxhp = 40;
Bat.prototype.damagePlayerCD = 60;
Bat.prototype.initialized = false;
Bat.prototype.dirbuffer = 0;
Bat.prototype.angryCD = 0;
Bat.prototype._lastDir = "Right";
Bat.prototype.state = {
	jumping: false,
	offGround: false,
	onGround: true,
	angry: false,
	biting: false,
	inWater: false
};

Bat.prototype.update = function(du) {
	spatialManager.unregister(this);
	
	var margin = this.getSize().sizeX; //margin outside of viewport we want to update
	if(this.cx+this.getSize().sizeX/2 < g_viewPort.x-margin ||
	   this.cx-this.getSize().sizeX/2 > g_viewPort.x+g_canvas.width+margin) return;
	   
	
	var Player = entityManager._character[0];
	
	if(this.angryCD > 0) {this.angryCD -= du; this.configureRotation()}
	else this.state['angry'] = false;
	
	//check if this is inside the v

	this.updateProxBlocks(this.cx, this.cy, this.cx+this.velX*du, this.cy+this.velY*du);
    if(this._isDeadNow) return entityManager.KILL_ME_NOW;

	//Handles if Bat is in water
    if(this.state['angry']){
        this.maxVel = 2;
    }else {
        this.maxVel = 1;
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
	
	var vel = Math.sqrt((this.velX*this.velX) + (this.velY*this.velY));
	if(vel < this.maxVel){
		this.velX /= 0.96;
		this.velY /= 0.96;
	}
	if(vel > this.maxVel){
		this.velX *= 0.98;
		this.velY *= 0.98;
	}	
	
	/*
	var rotation = Math.atan((this.cy - this.shooter.cy)/(this.cx - this.shooter.cx));
		var temp = 1;
		if(this.cx <= this.shooter.cx) temp *= -1;
		this.velX = (3*this.velX + Math.abs(this.boomerangScaler)*40*temp*Math.cos(rotation))/4;
		this.velY = (3*this.velY + Math.abs(this.boomerangScaler)*40*temp*Math.sin(rotation))/4;
	*/

	
	
	
	
	//update status
	var dir;
	if(this.velX === 0) dir = this._lastDir || "Right";
	else{
		dir = (this.velX > 0 ? "Right" : "Left");
		if(this._lastDir !== dir){
			if(this.dirbuffer > 3){
				this._lastDir = dir;
				this.dirbuffer = 0;
			} else {
				this.dirbuffer++;
			}
		} else this.dirbuffer = 0;
	}
	
	this.handleAnimation(this._lastDir);

	this.animation.update(du);
		
    this.handleSpecificBatAction(du, dir);

	spatialManager.register(this);
};

Bat.prototype.handleAnimation = function (dir) {
	var lastStatus = this.status;
	if(this.velY !== 0 && !this.state['inWater'] && this.airDuration > 1) this.status = "inAir"+dir;
	//else if(this.state['angry']) this.status = "aiming"+ dir;
	else this.status = "walking"+dir;
	
	if(lastStatus !== this.status){
		this.animation = this.animations[this.status];
	}

	
};

Bat.prototype.configureRotation = function() {
	var vel = Math.sqrt((this.velX*this.velX) + (this.velY*this.velY));
	var player = entityManager._character[0];
	var dir;
	if(player.cx <= this.cx){ 
		dir = "Left";
		this.rotation = Math.atan((this.cy - player.cy)/(this.cx - player.cx)); 
		//angle of player to mouse
		this.velX = -vel*Math.cos(this.rotation);
		this.velY = -vel*Math.sin(this.rotation);
	}
	else {
		dir = "Right";
		this.rotation = Math.atan((this.cy - player.cy)/(this.cx - player.cx)); 
		//angle of player to mouse
		this.velX = vel*Math.cos(this.rotation);
		this.velY = vel*Math.sin(this.rotation);
	}
	this.rotation = 0;
	
	//this._lastDir = dir;
	return dir;
}

Bat.prototype.render = function (ctx) {
	this.animation.renderAt(ctx, this.cx, this.cy, this.rotation);
	this.drawHealthBar(ctx);
};

Bat.prototype.knockBack = function(x,y) {
	if(Math.abs(this.velX) > 0.4)
		this.velX *= 0.8;
	if(Math.abs(this.velY) > 0.4)
		this.velY *= 0.8;
	this.angryCD = 200;
	this.state['angry'] = true;
};

Bat.prototype.getSize = function(){
    var size = {sizeX:20*this._scale,sizeY:20*this._scale};
    return size;
};

Bat.prototype.handleSpecificBatAction = function(du, dir) {
	// To be implemented in subclasses.
	var player = entityManager._character[0];
	if(!player) return;
	var px = player.cx;
	var py = player.cy;
		if(Math.abs(px - this.cx) < 100  && Math.abs(py - this.cy) < 100){
			this.angryCD = 100;
			this.state['angry'] = true;
		}
};


Bat.prototype.handleCollision = function(hitEntity, axis) {
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

        // Bad fix to make Character decide what happens to it's subclasses (Bat, Zelda, Projectile)
        if(hitEntity instanceof Block) {
            var dir = 0; //direction of hit
            if(!hitEntity._isPassable) {
                standingOnSomething = standingOnSomething || bEdge;
                if(lEdge && this.velX < 0 && axis === "x") {
                    walkingIntoSomething = walkingIntoSomething || true;
					this.velX *= -1;
                }
                if(rEdge && this.velX > 0 && axis === "x") {
                    walkingIntoSomething = walkingIntoSomething || true;
					this.velX *= -1;
				}
                if(bEdge && this.velY > 0 && axis === "y") {
                    this.velY *= -1;
                    dir = 4;
                } 
                if(tEdge && this.velY < 0  && axis === "y"){// && this.velY < 0) {
                    this.velY *= -1;
                    dir = 1;
                    this.state['offGround'] = true;
                }
            }
            hitEntity.activate(this, dir);
         } else if (hitEntity instanceof Projectile && hitEntity.shooter instanceof Player){
			//hitEntity.hits.push(this);
			//this.takeHit(1);
			this.knockBack(hitEntity.cx, hitEntity.cy)
			//hitEntity.takeHit();
				
		} else if (hitEntity instanceof Player && hitEntity.state['dashing']){
			this.knockBack(this.cx, this.cy)
			this.takeHit(hitEntity.dashDmg);
			
		} else if (hitEntity instanceof Player && this.damagePlayerCD <= 0 && !hitEntity.state['dashing']){
			this.knockBack(this.cx, this.cy)
			hitEntity.takeHit(5);
			this.damagePlayerCD = 20;
		}
    return {standingOnSomething: standingOnSomething, walkingIntoSomething: walkingIntoSomething};
};
