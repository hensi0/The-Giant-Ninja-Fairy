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
	this.animationsF =  makePlayerAnimationFairy(this._scale*0.5);
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
							offGround: true, casting: false, hasJumped: false, 
							onGround: false, idle: false, flying: false, 
							facingRight: true, inWater: false, fairyFire: false,
							spawning: true}
							
// Sounds (should be preloaded and initialized in constructor):
// Player.prototype.warpSound = new Audio(
//    "sounds/PlayerWarp.ogg");

//generic variables
Player.prototype.hp = 100;
Player.prototype.maxhp = 100;
Player.prototype.maxVelX = 3.9;
Player.prototype.maxVelY = 6.5;
Player.prototype.maxPushHeight = 120; 
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
Player.prototype.plasmaTimer = 1;
Player.prototype.teleportCD = 1;

//Druid variables

Player.prototype.hasDoubleJumped = false;
Player.prototype.hasDruiddUp = false;

Character.prototype.reset = function () {
	this.hp = this.maxhp;
	var pos = entityManager._world[0].returnStartLocation();
    this.setPos(pos.x, pos.y);
};

//to be used when spawning/swithcing forms
Player.prototype.resetStates = function () {
       this.state = {jumping: true, canJump: false, pushing: false, 
							offGround: true, casting: false, hasJumped: false,
							onGround: false, idle: false, flying: false, 
							facingRight: true, inWater: false, fairyFire: false,
							spawning: true }
};


Player.prototype.goFairy = function () {
        this.form = 'fairy';
		this.hoverX = 0;
		this.hoverY = 0;
		this.animations = this.animationsF;
		this.state['spawning'] = true;
		this.updateStatus();
		var temp = 	(Math.random() >  0.5);
		if(temp) 	this.hoverXvel =  0.4;
		else  		this.hoverXvel = -0.4;
		temp = 	(Math.random() >  0.5);
		if(temp) 	this.hoverYvel =  0.4;
		else  		this.hoverYvel = -0.4;
		this.resetStates();
};

Player.prototype.goGoat = function () {
		//prevents transforming if blocks are in the way
		var cords = entityManager._world[0].getBlockCoords(this.cx , (this.cy - this.getSize().sizeY/2));
        if(!entityManager._world[0].isSafeToTransform(cords[0] -1, cords[1])) return;
		this.form = 'goat';
		this.hoverX = 0;
		this.cy -= 0.36*this.getSize().sizeY; 
		this.animations = this.animationsG;
		this.animation = this.animations['idleRight'];
		this.hoverY = 0;
		this.blinkCharge = 0;
		this.pHeight = 50;
		this.cx = this.cx + this.hoverX;
		this.cy = this.cy + this.hoverY;
		this.resetStates();
};

Player.prototype.goDruid = function () {
        this.form = 'druid';
		this.hoverX = 0;
		this.hoverY = 0;
		this.animations = this.animationsD;
		this.animation = this.animations['idleRight'];
		this.blinkCharge = 0;
		this.pHeight = 30;
		this.cx = this.cx + this.hoverX;
		this.cy = this.cy + this.hoverY;
		this.resetStates();
};

//what happens the first frame when jumping from ground
Player.prototype.handleJump = function () {
	//console.log(!this.state['canJump'] + " " + this.state['jumping'] + " " + !this.state['inWater']);
	if(this.form === 'fairy'){ this.state['canJump'] = true; this.state['flying'] = true;}
    if((!this.state['canJump'] || this.state['jumping']) && !this.state['inWater']) return;
    else if(this.state['inWater']) {
        this.velY = -1; 
        this.tempMaxJumpHeight = this.cy - 1;
        this.state['jumping'] = true;
    } else {
    	this.state['jumping'] = true;
        this.state['hasJumped'] = false;
		if(this.form === 'druid'){
			this.velY = -6;
			this.tempMaxJumpHeight = this.cy - this.maxPushHeight; 
		} else if(this.form === 'goat'){
			this.velY = -4;
			this.tempMaxJumpHeight = this.cy - 0.6*this.maxPushHeight; 
		} else if(this.form === 'fairy'){
			this.velY = -3;
			this.tempMaxJumpHeight = 0; 
			this.fly();
		} 
    }
	
};
//fairy specific jump interactions
Player.prototype.fly = function () {
    this.state['canJump'] = true;
	this.state['flying'] = true;
	this.velY -= 0.05*(this.velY + 2.5);

};
//change forms
Player.prototype.swap = function (bool) {
			if(this.SwapCD > 0) return;
			this.SwapCD = 45;
			if(this.form === 'goat'){
				if(bool) 	this.goDruid();
				else 		this.goFairy();
			}else if(this.form === 'druid'){ 
				if(bool)	this.goFairy();
				else		this.goGoat();
			}else {
				if(bool)	this.goGoat();
				else		this.goDruid();
			}
			//smoke cloud
};

//standard update routine for the player
Player.prototype.update = function (du) {
	
	if(this.cx === undefined) this.cx = 100;
	if(this.cy === undefined) this.cy = 300;
	
	if(this.hp <= 0) this.isAlive = false;
	if(!this.isAlive){
		entityManager.enterLevel(1);
		
	}
	spatialManager.unregister(this);
	
	
	//update blocks in proximity
    this.updateProxBlocks(this.cx, this.cy, 
						  this.cx+this.velX*du, this.cy + this.velY*du);
	
	if(keys[this.KEY_JUMP] && !this.state['fairyFire']) this.handleJump();
	
	// Update speed/location and handle jumps/collisions
    if(this.state['fairyFire']) this.updateVelocity(du*0.4); 
	else 						this.updateVelocity(du);
	if(this.SwapCD > 0)this.SwapCD--;
	if (keys[this.KEY_SWAP1]) {
			this.swap(true);
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
	
	
	var prevX = this.cx;
	var prevY = this.cy;
	var nextX = this.cx + this.velX*du;
	var nextY = this.cy + this.velY*du;
	var bEdge;
	
	//check left/right collisions first and then top/bottom
    if(this.handlePartialCollision(nextX,prevY,"x")) this.velX = 0;
	bEdge = this.handlePartialCollision(prevX,nextY,"y");
	if(this.teleportCD > 0) this.teleportCD -= du;
	
	this.state['canJump'] = (!this.state['jumping'] && !keys[this.KEY_JUMP]) || this.state['flying'];
	
	if(this.state['fairyFire'] && this.state['jumping']){ this.shootZePlasmaBalls(du); this.updateLocation(du*0.18); } 
	else 						this.updateLocation(du);
	
    this.updateJump(bEdge);


	this.updateStatus();
	if(this.animation.update(du) === 1) {this.state['spawning'] = false; this.updateStatus();}

	spatialManager.register(this);
	
};

//bassic rendering handled by the animation.js
Player.prototype.render = function (ctx) {
    this.animation.renderAt(ctx, this.cx, this.cy, this.rotation);
};

//LMB functioning while in fairy form
Player.prototype.shootZePlasmaBalls = function (du) {
    if(this.plasmaTimer <= 0){ 
		var vMod = 5;
		var aMod = Math.PI/20 - Math.random()*(Math.PI/10) 
		var velx = vMod*Math.cos(this.rotation + aMod);
		var vely = vMod*Math.sin(this.rotation + aMod);
		var temp = 1;
		if(g_mouseX2 <= g_canvas.width/2) temp *= -1;
		entityManager.fireBullet(this.cx + 2*temp*velx, this.cy - 5 + temp*vely, temp*velx, temp*vely, 3, 0, this, 'bomb');
		this.plasmaTimer = 10;
	}else this.plasmaTimer -= du;	
};

//LMB functioning while in druid form
Player.prototype.shootZeBoomerang = function () {
		this.configureRotation();
		var vMod = 40;
		var aMod = Math.PI/20 - Math.random()*(Math.PI/10) 
		var velx = vMod*Math.cos(this.rotation + aMod);
		var vely = vMod*Math.sin(this.rotation + aMod);
		var temp = 1;
		if(g_mouseX2 <= g_canvas.width/2) temp *= -1;
		entityManager.fireBullet(this.cx + 2*temp*velx, this.cy - 5 + temp*vely, temp*velx, temp*vely, 10, 0, this, 'boomerang', 1000);
		this.rotation = 0;
};


//movement and out of bounds restrictions
Player.prototype.updateLocation = function(du) {
    var lvlLength = entityManager._world[0].blocks[13].length*(g_canvas.height/14);
	var halfWidth = this.getSize().sizeX/2;
    this.cx += this.velX*du;
	this.cx = Math.min(this.cx, lvlLength-halfWidth);
	this.cx = Math.max(this.cx, halfWidth);
    this.cy += this.velY*du;
};

//inAir movement
Player.prototype.updateJump = function(bEdge) {
    // If colliding with bottom edge, stop 'jumping'.	
	if(bEdge) { 
		this.state['fairyFire'] = false;
		this.state['flying'] = false;
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

//on realease of the LMB toggles the shotting state for fairy
Player.prototype.stopZeShootin = function () {
	//interupt shootin
	this.state['fairyFire'] = false;
	this.plasmaTimer = 1;
};

//LMB handling for player
Player.prototype.LMB = function (bool) {
	//left mouse Button has been pressed
	if(this.form === 'fairy') this.state['fairyFire'] = true;
	if(this.form === 'druid') this.shootZeBoomerang();
};

//RMB handling for the player
Player.prototype.RMB = function (bool) {
	//right mouse button
	if(this.form === 'fairy' && !this.state['spawning'] && this.teleportCD <= 0) this.teleport();
};

//Special ability in fairy form
Player.prototype.teleport = function () {
	var vMod = 50;
	this.configureRotation();
	var velx = vMod*Math.cos(this.rotation);
	var vely = vMod*Math.sin(this.rotation);
	var temp = 1;
	if(g_mouseX2 <= g_canvas.width/2) temp *= -1;
		entityManager.fireBullet(this.cx, this.cy, temp*velx, temp*vely, 10, 0, this, 'detector', 16);
	this.rotation = 0;
	this.state['spawning'] = true;
	this.velY = 0;
	this.velX = 0;
	this.teleportCD = 100;
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
                    this.velY *= -0.8;
					//this.velY = Math.max(this.velY,5);
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

//for states where you are fireing in a specific directions
Player.prototype.configureRotation = function() {
	var dir;
	if(g_mouseX2 < g_canvas.width/2){ 
		dir = "Left";
		this.rotation = Math.atan((g_canvas.height/2 - g_mouseY2)/(g_canvas.width/2 - g_mouseX2)); 
		//angle of player to mouse
	}
	else {
		dir = "Right";
		this.rotation = Math.atan((g_canvas.height/2 - g_mouseY2)/(g_canvas.width/2 - g_mouseX2)); 
		//angle of player to mouse
	}
	return dir;
}

//for picking wich animation to play
Player.prototype.updateStatus = function() {
	
	// figure out our status
    var nextStatus = this.status;
	var dir;
	
	if(this.state['fairyFire']){
		dir = this.configureRotation();
		nextStatus = "shooting"+dir;
		if(nextStatus!==this.status){
			this.status = nextStatus;
			this.animation = this.animations[this.status];
		}  
		return;
	} else this.rotation = 0; 
	
    var wasMovingRight = (this.velX >= 0);
    var wasMovingLeft = (this.velX < 0);
	
    
	if(this.velX === 0) dir = (this.state['facingRight'] ? "Right" : "Left");
	
	else{
		dir = (this.velX > 0 ? "Right" : "Left");
		this.state['facingRight'] = (dir==="Right");
	}
    
	var atMaxVel = (Math.abs(this.velX)>=(this.maxVelX*0.9))
    if(this.state['jumping'] && !this.state['spawning']) nextStatus = "inAir"+dir;
    else if(this.velX === 0 && !this.state['jumping'] && !this.state['spawning']) nextStatus = "idle"+(wasMovingLeft?"Left":dir);
    else if(!this.state['jumping'] && !this.state['spawning']) nextStatus = "walking"+dir;
	else nextStatus = "spawning"+dir;
	
    // Update animation
    if(nextStatus!==this.status){
        this.status = nextStatus;
        this.animation = this.animations[this.status];
    }    
}

// acceleration stuff
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
	if(!this.state['pushing']) this.state['pushing'] = keys[this.KEY_JUMP] && this.state['canJump'] && this.state['jumping'] && !this.state['fairyFire'];
	// if we're already pushing we can keep pushing by these constraints:
	else  if(!this.state['flying']) this.state['pushing'] = keys[this.KEY_JUMP] && !this.state['offGround'] && !this.state['fairyFire'];
	else this.state['pushing'] = keys[this.KEY_JUMP] && !this.state['fairyFire'];
    
    // To be able to change direction in midair:
    if((movingRight && wasMovingLeft && !this.state['inWater']) || (movingLeft && wasMovingRight && !this.state['inWater'])) this.velX = 0;
	
	//a scaling variant to allow larger forms more max speed
	var Xscaler = (0.5 + (this.getSize().sizeY/100))*this.maxVelX;
    // Increase speed to the right:
    if(movingRight && this.velX < Xscaler || this.velX <  - Xscaler) {
        this.velX += NOMINAL_FORCE*du;
    } 

    // Increase speed to the left:
    if(movingLeft && this.velX > - Xscaler || this.velX >  Xscaler) {
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
    if(this.state['jumping'] && !this.state['pushing'] && this.velY < (this.getSize().sizeY/60)*TERMINAL_VELOCITY) {
        if(!this.state['inWater'])
				this.velY += (this.getSize().sizeY/110)*NOMINAL_GRAVITY*du;
        else this.velY += (NOMINAL_GRAVITY*du)/10;
    }else if(this.state['jumping'] && this.state['pushing']){
		this.state['hasJumped'] = false;
		if(this.form === 'druid') this.velY = -6;
		else if(this.form === 'goat') this.velY = -4;
		else if(this.form === 'fairy') this.fly();
	}else if(!this.state['jumping']){
        this.velY = 0;
    }
}

// affects collision box
Player.prototype.getSize = function(){
	//alternating hitboxes between forms just the hight for now to 
	//prevent a lot of collission headache regarding changing form mid-air
	var sX = (g_canvas.height / 768); //scale to match height with scaling blocksize
    var size = 							{sizeX:20*this._scale,sizeY:18*this._scale};
	if(this.form === 'goat') 	size = 	{sizeX:20*this._scale,sizeY:64*this._scale};
	if(this.form === 'druid') 	size = 	{sizeX:20*this._scale,sizeY:40*this._scale};
    return size;
}

