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
function ranger(descr) {
	this.setup(descr)
    // Default sprite, if not otherwise specified
    this._scale = 1;
	this.animations = makeRangerAnimation(0.44*this._scale);
	this.animation = this.animations['walkingRight'];
};

ranger.prototype = new Enemy();

// Initial, inheritable, default values
ranger.prototype.cx = 0;
ranger.prototype.cy = 0;
ranger.prototype.velX = -1;
ranger.prototype.velY = 1;
ranger.prototype.HP = 40;
ranger.prototype.maxhp = 40;
ranger.prototype.damagePlayerCD = 60;
ranger.prototype.initialized = false;
ranger.prototype.airDuration = 0;
ranger.prototype.angryCD = 0;
ranger.prototype.arrowCD = 80;
ranger.prototype._lastDir = "Right";
ranger.prototype.state = {
	jumping: false,
	offGround: false,
	onGround: true,
	angry: false,
	biting: false,
	inWater: false
};

ranger.prototype.update = function(du) {
	spatialManager.unregister(this);
	//check if this is inside the viewport
	var margin = this.getSize().sizeX; //margin outside of viewport we want to update
	if(this.cx+this.getSize().sizeX/2 < g_viewPort.x-margin ||
	   this.cx-this.getSize().sizeX/2 > g_viewPort.x+g_canvas.width+margin) return;
	var margin = this.getSize().sizeY; //margin outside of viewport we want to update
	if(this.cy+this.getSize().sizeY/2 < g_viewPort.y-margin ||
	   this.cy-this.getSize().sizeY/2 > g_viewPort.y+g_canvas.height+margin) return;

	this.updateProxBlocks(this.cx, this.cy, this.cx+this.velX*du, this.cy+this.velY*du);
    if(this._isDeadNow) return entityManager.KILL_ME_NOW;

	//Handles if ranger is in water
    if(this.state['inWater']){
        this.maxVelX = 2.3;
        this.maxVelY = 1.1;
    }else {
        this.maxVelX = 1.9;
        this.maxVelY = 4.5;
    }
	
	var nextX = this.cx+this.velX*du;
    var nextY = this.cy+this.velY*du;
	var prevX = this.cx;
    var prevY = this.cy;
	
    this.state['inWater'] = false;
	
	if(this.damagePlayerCD > 0) this.damagePlayerCD -= du;
	
	//check left/right collisions first and then top/bottomx
    var walkingIntoSomething = this.handlePartialCollision(nextX,prevY,"x");
	var standingOnSomething = this.handlePartialCollision(prevX,nextY,"y");
	// update location
    if(!this.state['angry']) this.cx += this.velX*du;
    this.cy += this.velY*du;
	
	if(this.velY !== 0) this.airDuration++;
	else this.airDuration = 0;
	// Fall down
	if(!standingOnSomething && this.velY < TERMINAL_VELOCITY && !this.state['inWater']){
		this.velY += NOMINAL_GRAVITY*du;
	}
	
	if(this.state['inWater'] && standingOnSomething) this.velY = -1;
	// Turn around
	
	if(walkingIntoSomething){
		this.velX *= -1;
	}
	
	var dir;
	if(this.velX === 0 || this.state['angry']) dir = this._lastDir || "Right";
	else{
		dir = (this.velX > 0 ? "Right" : "Left");
		this._lastDir = dir;
	}
	
	this.handleAnimation(dir);
	//update status
	
	if(this.animation.update(du) === 1 && this.state['angry'] && this.airDuration === 0) this.shootZeArrow();;
	
    this.handleSpecificRangerAction(du, dir);

	spatialManager.register(this);
};


ranger.prototype.handleAnimation = function (dir) {
	var lastStatus = this.status;
	if(this.velY !== 0 && !this.state['inWater'] && this.airDuration > 1) this.status = "inAir"+dir;
	else if(this.state['angry']) this.status = "aiming"+ dir;
	else this.status = "walking"+dir;
	
	if(lastStatus !== this.status){
		this.animation = this.animations[this.status];
	}

	
};

ranger.prototype.shootZeArrow = function () {
	var dir = this.configureRotation();
	var vMod = 18;
	var aMod = Math.PI/30 - Math.random()*(Math.PI/15) 
	if(dir === "Left") {
		this._lastDir = "Left";
		var velx = -vMod*Math.cos(this.rotation + aMod);
		var vely = -vMod*Math.sin(this.rotation + aMod);
	} else {
		this._lastDir = "Right";
		var velx = vMod*Math.cos(this.rotation + aMod);
		var vely = vMod*Math.sin(this.rotation + aMod);
	}
	
	entityManager.fireBullet(this.cx + 2*velx, this.cy - 10 + vely, velx, vely -2, 3, 0, this, 'arrow');
};

//for states where you are fireing in a specific directions
 


ranger.prototype.render = function (ctx) {
	if(!this.state['angry'] || this.airDuration > 1) this.animation.renderAt(ctx, this.cx, this.cy, 0);
	else{
		var dir = this._lastDir;
		this.animations["feet"+dir].renderAt(ctx, this.cx, this.cy, 0);
		this.configureRotation();
		this.animation.renderAt(ctx, this.cx, this.cy, this.rotation);
	}
		
	this.drawHealthBar(ctx);
};

ranger.prototype.knockBack = function(x,y) {
	this.velY = -2;
	this.angryCD = 150;
	this.state['angry'] = true;
};

ranger.prototype.getSize = function(){
    var size = {sizeX:20*this._scale,sizeY:40*this._scale};
    return size;
};

ranger.prototype.handleSpecificRangerAction = function(du, dir) {
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
	
	if(Math.abs(px - this.cx) > 400 || Math.abs(py - this.cy) > 220 )this.angryCD--;
	if(this.angryCD < 0) this.state['angry'] = false;
	
	if(this.state['angry']){
		this.configureRotation();

	}	
};


ranger.prototype.handleCollision = function(hitEntity, axis) {
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

        // Bad fix to make Character decide what happens to it's subclasses (ranger, Zelda, Projectile)
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
        } else if (hitEntity instanceof Projectile && hitEntity.shooter instanceof Player){
			hitEntity.hits.push(this);
			//this.takeHit(1);
			this.knockBack(hitEntity.cx, hitEntity.cy)
			hitEntity.takeHit();
				
		} else if (hitEntity instanceof Player && this.damagePlayerCD <= 0 && hitEntity.state['dashing']){
			this.knockBack(this.cx, this.cy)
			this.takeHit(100);
			this.damagePlayerCD = 60;
		}
    return {standingOnSomething: standingOnSomething, walkingIntoSomething: walkingIntoSomething};
};
