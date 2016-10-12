// ==========
// Player STUFF
// ==========

"use strict";

/* jshint browser: true, devel: true, globalstrict: true */

/*
0        1         2         3         4         5         6         7         8
12345678901234567890123456789012345678901234567890123456789012345678901234567890
*/


// A generic contructor which accepts an arbitrary descriptor object
function Player(descr) {

    // Common inherited setup logic from Entity
    this.setup(descr);

    //this.rememberResets();
    
    // Default sprite, if not otherwise specified
    this.sprite = g_sprites.marioTest;
	this._isAlive = true;
	
	
	this.animationsD =  makePlayerAnimationDruid(this._scale);
	this.animationsF =  makePlayerAnimationFairy(0.5*this._scale);
	this.animationsG =  makePlayerAnimationGoat(this._scale);
	this.animations = this.animationsD;
	this.animation = this.animations['idleRight'];
	this.goFairy();
};
// This comes later on when Character has been implemented: 
Player.prototype = new Character();

// Keys
Character.prototype.KEY_LEFT   	= 'A'.charCodeAt(0); //Left key code
Character.prototype.KEY_RIGHT  	= 'D'.charCodeAt(0); //Right key code
Character.prototype.KEY_DOWN 	= 'S'.charCodeAt(0); //Down key code
Character.prototype.KEY_JUMP   	= 'W'.charCodeAt(0); //Jump key code
Character.prototype.KEY_SWAP1  	= ' '.charCodeAt(0); //Swap-form key code
Character.prototype.KEY_SWAP2  	= 'E'.charCodeAt(0); //2ndary swap


// Initial, inheritable, default values
Player.prototype.form = 'fairy';
Player.prototype.SwapCD = 0;
Player.prototype.state = {jumping: true, canJump: false, pushing: false, 
							offGround: true, casting: false, 
							onGround: false, idle: false, 
							facingRight: true, inWater: false}
							
// Sounds (should be preloaded and initialized in constructor):
// Player.prototype.warpSound = new Audio(
//    "sounds/PlayerWarp.ogg");

//generic variables

Player.prototype.maxVelX = 3.9;
Player.prototype.maxVelY = 6.5;
Player.prototype.maxPushHeight = 120000000;  //fix
Player.prototype.tempMaxJumpHeight = 0;
Player.prototype.animationsG;
Player.prototype.animationsD;
Player.prototype.animationsF;

//fairy variables
Player.prototype.hoverX = 0;
Player.prototype.hoverY = 0;
Player.prototype.pHeight = 60;
Player.prototype.hoverXvel = 0;
Player.prototype.hoverYvel = 0;
Player.prototype.maxHoverHeight = 300;
Player.prototype.fairyHoverHeight = 25;
Player.prototype.hasRealeasedUp = true;
Player.prototype.blinkCharge = 0;

//Druid variables

Player.prototype.hasDoubleJumped = false;
Player.prototype.hasDruiddUp = false;

Character.prototype.reset = function () {
	var pos = entityManager._world[0].returnStartLocation();
    this.setPos(pos.x, pos.y);
};

Player.prototype.goFairy = function () {
        this.form = 'fairy';
		this.hoverX = 0;
		this.hoverY = 0;
		this.animations = this.animationsF;
		this.state['jumping'] = true;
		this.animation = this.animations['idleRight'];
		var temp = 	(Math.random() >  0.5);
		if(temp) 	this.hoverXvel =  0.4;
		else  		this.hoverXvel = -0.4;
		temp = 	(Math.random() >  0.5);
		if(temp) 	this.hoverYvel =  0.4;
		else  		this.hoverYvel = -0.4;
};

Player.prototype.goGoat = function () {
		//prevents transforming if blocks are in the way
		var cords = entityManager._world[0].getBlockCoords(this.cx , (this.cy - this.getSize().sizeY/2));
        if(!entityManager._world[0].isSafeToTransform(cords[0] -1, cords[1])) return;
		if(!entityManager._world[0].isSafeToTransform(cords[0] -2, cords[1])) return;
		this.form = 'goat';
		this.hoverX = 0;
		this.cy -= 38; 
		this.animations = this.animationsG;
		this.animation = this.animations['idleRight'];
		this.state['jumping'] = true;
		this.hoverY = 0;
		this.blinkCharge = 0;
		this.pHeight = 50;
		this.cx = this.cx + this.hoverX;
		this.cy = this.cy + this.hoverY;
};

Player.prototype.goDruid = function () {
        this.form = 'druid';
		this.hoverX = 0;
		this.hoverY = 0;
		this.animations = this.animationsD;
		this.animation = this.animations['idleRight'];
		this.blinkCharge = 0;
		this.pHeight = 30;
		this.state['jumping'] = true;
		this.cx = this.cx + this.hoverX;
		this.cy = this.cy + this.hoverY;

};

Player.prototype.handleJump = function () {
    if((!this.state['canJump'] || this.state['jumping']) && !this.state['inWater']) return;
    else if(this.state['inWater']) {
        this.velY = -1; 
        this.tempMaxJumpHeight = this.cy - 1;
        this.state['jumping'] = true;
    } else {
    	this.state['jumping'] = true;
        if(this.form === 'druid'){
			this.velY = -6;
			this.tempMaxJumpHeight = this.cy - this.maxPushHeight; 
		} else if(this.form === 'goat'){
			this.velY = -4;
			this.tempMaxJumpHeight = this.cy - 0.6*this.maxPushHeight; 
		} else if(this.form === 'fairy'){
			this.velY = -5;
			this.tempMaxJumpHeight = this.cy - 0.8*this.maxPushHeight; 
		} 
    }
};

Player.prototype.update = function (du) {
	
	if(this.cx === undefined) this.cx = 100;
	if(this.cy === undefined) this.cy = 300;
	
	if(this.hp <= 0) this.isAlive = false;
	if(!this.isAlive) return entityManager.KILL_ME_NOW;
	
	spatialManager.unregister(this);
	
	
	//update blocks in proximity
    this.updateProxBlocks(this.cx, this.cy, 
						  this.cx+this.velX*du, this.cy + this.velY*du);
	
	if(keys[this.KEY_JUMP]) this.handleJump();
	
	// Update speed/location and handle jumps/collisions
    this.updateVelocity(du);

	if(this.SwapCD > 0) this.SwapCD--;
	else{
		if (keys[this.KEY_SWAP1]) {
			this.SwapCD = 30;
			if(this.form === 'goat'){
				this.goDruid();
			}else if(this.form === 'druid'){ 
				this.goFairy();
			}else {
				this.goGoat();
			}
			//smoke cloud
		}
		/* Maybe use later, gameplay seems more fun with swap only going one way
		if (keys[this.KEY_SWAP2]) {
			this.SwapCD = 30;
			if(this.form === 'fairy') this.goGoat();
			else if(this.form === 'goat') this.goDruid();
			else this.goFairy();
			//smoke cloud
		}
		*/
	}
	
	var prevX = this.cx;
	var prevY = this.cy;
	var nextX = this.cx + this.velX*du;
	var nextY = this.cy + this.velY*du;
	var bEdge;
	
	//check left/right collisions first and then top/bottom
    if(this.handlePartialCollision(nextX,prevY,"x")) this.velX = 0;
	bEdge = this.handlePartialCollision(prevX,nextY,"y");
	
	
	this.state['canJump'] = (!this.state['jumping'] && !keys[this.KEY_JUMP]);
	
	if(this.form === 'fairy'){
		
		this.fairyUpdate(du);
	
	} else if(this.form === 'goat'){
		
		this.giantUpdate(du);
	
	} else if(this.form === 'druid'){
		
		this.druidUpdate(du);
	}
	
	this.updateLocation(du);
	
    this.updateJump(bEdge);


	this.updateStatus();
	
	spatialManager.register(this);
	
};

/*
Player.prototype.render = function (ctx) {
	g_ctx.globalAlpha = Math.abs((40-this.blinkCharge)/40);
    var origScale = this.sprite.scale;
        // pass my scale into the sprite, for drawing
    this.sprite.scale = this._scale * (this.pHeight/60);
	this.sprite.drawCentredAt(
    	ctx, this.cx + this.hoverX, this.cy + this.hoverY, this.rotation
	);
	g_ctx.globalAlpha = 1;
};
*/

Player.prototype.render = function (ctx) {
    if(this.form === 'fairy') this.animation.renderAt(ctx, this.cx + this.hoverX, this.cy + this.hoverY - this.fairyHoverHeight, this.rotation);
	else this.animation.renderAt(ctx, this.cx, this.cy, this.rotation);
};

Player.prototype.updateLocation = function(du) {
    var lvlLength = entityManager._world[0].blocks[13].length*(g_canvas.height/14);
	var halfWidth = this.getSize().sizeX/2;
    this.cx += this.velX*du;
	this.cx = Math.min(this.cx, lvlLength-halfWidth);
	this.cx = Math.max(this.cx, halfWidth);
    this.cy += this.velY*du;
};

Player.prototype.updateJump = function(bEdge) {
    // If colliding with bottom edge, stop 'jumping'.	
	if(bEdge) { 
        this.state['jumping'] = false;
        this.state['pushing'] = false;
        this.state['offGround'] = false;
        if(!(keys[this.KEY_LEFT] || keys[this.KEY_RIGHT])) this.velX = 0;
    }else{
		this.state['jumping'] = true;
	}
	
    // Set offGround to true so that we can't keep pushing while in air.
    if(this.cy <= this.tempMaxJumpHeight) {
        this.state['offGround'] = true;
    }
};

//===============================================
// ******************FAIRY***********************
//===============================================


Player.prototype.fairyUpdate = function (du) {
	/*
	var scaler = 1;
	if (keys[this.KEY_LEFT]) {
        //this.velX = -2;
		scaler = 0.2;
    } else if (keys[this.KEY_RIGHT]) {
        //this.velX = 2;
		scaler = 0.2;
    } else {
		//this.velX = 0;
	}
	
	this.hoverX 	+=  scaler*this.hoverXvel;
	this.hoverXvel 	+= -scaler*this.hoverX*0.001;
	
	//hover-stuff
	this.hoverY += this.hoverYvel;
	this.hoverYvel += -this.hoverY*0.0005;
	
	/*
	if (keys[this.KEY_JUMP]) {
		if (this.isJumping){ 
			this.velY = 0.4
		}else {
			if(this.blinkCharge > 40){
				this.cy -= 180;
				this.isJumping = true;
				this.hasDoubleJumped = false;
				this.blinkCharge = 0;
			} else this.blinkCharge++;
		}
	} else this.blinkCharge = 0;
	
	if (this.isJumping){
		if ((this.cy - ((this.groundHeight - 3*this.pHeight) - 40)) > 0) {
			this.cy = (this.groundHeight - 3*this.pHeight) - 40;
			this.velY = 0;
			this.isJumping = false;
			
		} else {
			this.velY += 0.05;
			this.isJumping = true;			
		}
		
	} 		
	
	
	if (keys[this.KEY_SHOOT]) {
		this.shoot();
	}
	
	
	
	
	//this.updateJump();
	this.cx += this.velX*du;
	this.cy += this.velY*du;
	*/
};

//===============================================
// ******************GIANT***********************
//===============================================


Player.prototype.giantUpdate = function (du) {
	/*
	if (keys[this.KEY_LEFT]) {
        this.velX = -1.6;
    } else if (keys[this.KEY_RIGHT]) {
        this.velX = 1.6;
    } else this.velX = 0;
	
	
	if( this.isJumping ) {
		
		this.velY += 0.4;
		
	} else if (keys[this.KEY_JUMP] && this.hasRealeasedUp) {
		this.isJumping = true;
		this.hasDoubleJumped = false;
		this.velY = -6;
		this.hasRealeasedUp = false;
	} else if (!keys[this.KEY_JUMP]) 
		this.hasRealeasedUp = true;
		
	if ((this.cy - (this.groundHeight - 1.1*this.pHeight)) > 0) {
		this.cy = this.groundHeight - 1.1*this.pHeight;
		this.velY = 0;
		this.isJumping = false;
	}
	
	
	//this.updateJump();
	this.cx += this.velX*du;
	this.cy += this.velY*du;	
	*/
};


//===============================================
// ******************Druid***********************
//===============================================


Player.prototype.druidUpdate = function (du) {
	/*
	if (keys[this.KEY_LEFT]) {
        this.velX = -2.4;
    } else if (keys[this.KEY_RIGHT]) {
        this.velX = 2.4;
    } else this.velX = 0;
	
	if( this.isJumping ) {
		
		this.velY += 0.1;
		if(!keys[this.KEY_JUMP]) this.hasDruiddUp = true;
		if(!this.hasDoubleJumped && keys[this.KEY_JUMP] && this.velY > -2 && this.hasDruiddUp){
			this.velY = -3;
			this.hasDoubleJumped = true;
		}
		
	} else if (keys[this.KEY_JUMP] && this.hasRealeasedUp) {
		this.isJumping = true;
		this.hasRealeasedUp = false;
		this.velY = -5;
		this.hasDruiddUp = false;
	} else if (keys[this.KEY_JUMP])
		this.hasRealeasedUp = true;
		
	if ((this.cy - (this.groundHeight - 1.2*this.pHeight)) > 0) {
		this.cy = this.groundHeight - 1.2*this.pHeight;
		this.velY = 0;
		this.isJumping = false;
		this.hasDoubleJumped = false;
	}			
	
	if (keys[this.KEY_SHOOT]) {
		this.shoot();
	}
	
	//this.updateJump();
	this.cx += this.velX*du;
	this.cy += this.velY*du;
	*/
};
//=============================
//===========collsion logic====
//=============================



Player.prototype.handleCollision = function(hitEntity, axis) {
    var bEdge,lEdge,rEdge,tEdge;
    var standingOnSomething;
    var walkingIntoSomething;

		// Lots of vars for type of collision: top, bottom, same column, same row, going by Player center coordinate, left coordinate, right, etc.
        var charCoords = entityManager._world[0].getBlockCoords(this.cx, (this.cy + this.getSize().sizeY/2) - 5); //This is going by char's center, which is it's lower half. Upper half needs to be in i, j-1.
        var charCoordsLeft = entityManager._world[0].getBlockCoords(this.cx-this.getSize().sizeX/2, this.cy); //This is going by char's bottom left corner
        var charCoordsRight = entityManager._world[0].getBlockCoords(this.cx+this.getSize().sizeX/2, this.cy); //This is going by char's bottom right corner
        var hitCoords = (hitEntity instanceof Block ? [hitEntity.i, hitEntity.j] : entityManager._world[0].getBlockCoords(hitEntity.cx, hitEntity.cy));

        var charAbove = (hitCoords[0] > charCoords[0]); // char block coordinates lower because y-axis points down.
        var charBelow = (hitCoords[0] < charCoords[0]);
        var charToLeft = (hitCoords[1] > charCoords[1]); // char column coords must be lower.
        var charToRight = (hitCoords[1] < charCoords[1]);
        var sameCol = (hitCoords[1] == charCoordsLeft[1] || hitCoords[1] == charCoordsRight[1]);
		var sameRow
		if(this.form === 'goat')  
			sameRow = (hitCoords[0] == charCoords[0] || hitCoords[0] == charCoords[0]-1 || hitCoords[0] == charCoords[0]-2) || this.state['jumping'];
		else sameRow = (hitCoords[0] == charCoords[0] || hitCoords[0] == charCoords[0]-1) || this.state['jumping'];
 

        lEdge = charToRight && sameRow;
        rEdge = charToLeft && sameRow;
        tEdge = charBelow && sameCol;
        bEdge = charAbove && sameCol;
		
		
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
					this.velY = Math.max(this.velY,5);
                    dir = 1;
                    this.state['offGround'] = true;
                }
            }
            hitEntity.activate(this, dir);

        /*
		}else if(hitEntity instanceof Enemy) {
			// check to see if we jumped on his head
            if(bEdge) {
                util.play(g_audio.boop);
                hitEntity.takeHit();
                this.velY = -4;
                if(hitEntity instanceof Shooter) g_score.add(100);
                else g_score.add(50);
            } else {
				// if not it hurts
                this.takeHit();
            }
        */
		}
		
    

    return {standingOnSomething: standingOnSomething, walkingIntoSomething: walkingIntoSomething};
}

Player.prototype.updateStatus = function() {
	//will play a bigger part when I manage to fool my friend into finishing one of the sprite-sheets
	
    var wasMovingRight = (this.velX >= 0);
    var wasMovingLeft = (this.velX < 0);

    // figure out our status
    var nextStatus = this.status;
	var dir;
	if(this.velX === 0) dir = (this.state['facingRight'] ? "Right" : "Left");
	else{
		dir = (this.velX > 0 ? "Right" : "Left");
		this.state['facingRight'] = (dir==="Right");
	}
    var atMaxVel = (Math.abs(this.velX)>=(this.maxVelX*0.9))
    if(this.state['jumping']) nextStatus = "inAir"+dir;
    else if(this.state['casting']) nextStatus = "magic" + dir;
    else if(this.velX === 0 && !this.state['jumping']) nextStatus = "idle"+(wasMovingLeft?"Left":dir);
    else if(atMaxVel && !this.state['jumping'] && !this.state['inWater']) nextStatus = "running"+dir;
    else if(!this.state['jumping']) nextStatus = "walking"+dir;

    // Update animation
    if(nextStatus!==this.status){
        this.status = nextStatus;
        this.animation = this.animations["idleRight"];
    }    
}

Player.prototype.updateVelocity = function(du) {
    var NOMINAL_FORCE = +0.15;

    var wasMovingRight = (this.velX > 0);
    var wasMovingLeft = (this.velX < 0);
    var movingRight = keys[this.KEY_RIGHT];
    var movingLeft = keys[this.KEY_LEFT];
    
    // Check if the Player is still in range of the ground
    // to be able to push of it (=> jump higher)
    if(this.state['jumping'] && !keys[this.KEY_JUMP]) {
        this.state['offGround'] = true;
    }

    // We can keep 'pushing' off ground to manage a higher jump so long as we're
    // not too high in the air, i.e. 'offGround'.
	// We can only start "pushing" if we can jump:
	if(!this.state['pushing']) this.state['pushing'] = keys[this.KEY_JUMP] && this.state['canJump'] && this.state['jumping'];
	// if we're already pushing we can keep pushing by these constraints:
	else  this.state['pushing'] = keys[this.KEY_JUMP] && !this.state['offGround'];
    
    // To be able to change direction in midair:
    if((movingRight && wasMovingLeft && !this.state['inWater']) || (movingLeft && wasMovingRight && !this.state['inWater'])) this.velX = 0;

    // Increase speed to the right:
    if(movingRight && this.velX < this.maxVelX || this.velX <  - this.maxVelX) {
        this.velX += NOMINAL_FORCE*du;
    } 

    // Increase speed to the left:
    if(movingLeft && this.velX > - this.maxVelX || this.velX >  this.maxVelX) {
        this.velX -= NOMINAL_FORCE*du;
    }

    // Velocity is zero if we're not moving anywhere or floating in air:
    if(!this.state['jumping'] && !(movingRight || movingLeft)) {
        this.velX = 0;
    }
	if(this.state['jumping'] && !(movingRight || movingLeft)) {
        this.velX *= 0.98;
    }
	


    // Start accelerating down as soon as we've "stopped state['pushing']"
    if(this.state['jumping'] && !this.state['pushing'] && this.velY < TERMINAL_VELOCITY) {
        if(!this.state['inWater'])this.velY += NOMINAL_GRAVITY*du;
        else this.velY += (NOMINAL_GRAVITY*du)/10;
    }else if(this.state['jumping'] && this.state['pushing']){
		
		if(this.form === 'druid') this.velY = -6;
		else if(this.form === 'goat') this.velY = -4;
		else if(this.form === 'fairy') this.velY = -5;
	}else if(!this.state['jumping']){
        this.velY = 0;
    }
}

Player.prototype.getSize = function(){
	//alternating hitboxes between forms just the hight for now to 
	//prevent a lot of collission headache regarding changing form mid-air
    var size = {sizeX:20*this._scale,sizeY:18*this._scale};
	if(this.form === 'goat') size = {sizeX:20*this._scale,sizeY:96*this._scale};
	if(this.form === 'druid') size = {sizeX:20*this._scale,sizeY:64*this._scale};
    return size;
}

