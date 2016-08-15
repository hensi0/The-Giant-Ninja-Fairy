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
    this._scale = 0.05;
	this._isAlive = true;
	this.goFairy();
};
// This comes later on when Character has been implemented: 
Player.prototype = new Character();

// Keys
Character.prototype.KEY_LEFT   	= 'A'.charCodeAt(0); //Left key code
Character.prototype.KEY_RIGHT  	= 'D'.charCodeAt(0); //Right key code
Character.prototype.KEY_DOWN 	= 'S'.charCodeAt(0); //Down key code
Character.prototype.KEY_JUMP   	= 'W'.charCodeAt(0); //Jump key code
Character.prototype.KEY_SWAP1  	= 'Q'.charCodeAt(0); //Jump key code
Character.prototype.KEY_SWAP2  	= 'E'.charCodeAt(0); //Jump key code


// Initial, inheritable, default values
Player.prototype.form = 0;
Player.prototype.SwapCD = 0;



// Sounds (should be preloaded and initialized in constructor):
// Player.prototype.warpSound = new Audio(
//    "sounds/PlayerWarp.ogg");

//fairy variables
Player.prototype.hoverX = 0;
Player.prototype.hoverY = 0;
Player.prototype.hoverXvel = 0;
Player.prototype.hoverYvel = 0;
Player.prototype.maxHoverHeight = 300;
Player.prototype.hoverFuel = 0;

//temp
Player.prototype.groundHeight = 500;

Player.prototype.distToGround = function () {
        var temp = Math.abs(this.cy-this.groundHeight);
		if (temp != 0) return temp;
		else return 0.001;
};

Player.prototype.goFairy = function () {
        this.form = 0;
		this.hoverX = 0;
		this.hoverY = 0;
		var temp = 	(Math.random() >  0.5);
		if(temp) 	this.hoverXvel =  0.4;
		else  		this.hoverXvel = -0.4;
		temp = 	(Math.random() >  0.5);
		if(temp) 	this.hoverYvel =  0.4;
		else  		this.hoverYvel = -0.4;
		this.velX = 0;
		this.velY = 0;
};

Player.prototype.goGiant = function () {
        this.form = 1;
		this.hoverX = 0;
		this.hoverY = 0;
		this.velX = 0;
		this.velY = 0;
		this.cx = this.cx + this.hoverX;
		this.cy = this.cy + this.hoverY;
};

Player.prototype.goNinja = function () {
        this.form = 2;
		this.hoverX = 0;
		this.hoverY = 0;
		this.velX = 0;
		this.velY = 0;
		this.cx = this.cx + this.hoverX;
		this.cy = this.cy + this.hoverY;

};


Player.prototype.update = function (du) {
	if(this.hp <= 0) this.isAlive = false;
	if(!this.isAlive) return entityManager.KILL_ME_NOW;
	
	if(this.SwapCD > 0) this.SwapCD--;
	else{
		if (keys[this.KEY_SWAP1]) {
			this.SwapCD = 30;
			if(this.form == 0) this.goNinja();
			else if(this.form == 1) this.goFairy();
			else this.goGiant();
			//smoke cloud
		}
		if (keys[this.KEY_SWAP2]) {
			this.SwapCD = 30;
			if(this.form == 0) this.goGiant();
			else if(this.form == 1) this.goNinja();
			else this.goFairy();
			//smoke cloud
		}
	}
	
	
	if(this.form == 0){
		console.log("fairy unit update");
		this.fairyUpdate(du);
	}
	
	if(this.form == 1){
		console.log("giant unit update");
		this.giantUpdate(du);
	}
	
	if(this.form == 2){
		console.log("ninja unit update");
		this.ninjaUpdate(du);
	}
	
	
};

Player.prototype.render = function (ctx) {
        var origScale = this.sprite.scale;
        // pass my scale into the sprite, for drawing
        this.sprite.scale = this._scale;
        this.sprite.drawCentredAt(
    	ctx, this.cx + this.hoverX, this.cy + this.hoverY, this.rotation
    );
};

//===============================================
// ******************FAIRY***********************
//===============================================


Player.prototype.fairyUpdate = function (du) {
	
	var scaler = 1;
	if (keys[this.KEY_LEFT]) {
        this.velX = -1;
		scaler = 0.2;
    } else if (keys[this.KEY_RIGHT]) {
        this.velX = 1;
		scaler = 0.2;
    } else {
		this.velX = 0;
	}
	
	this.hoverX 	+=  scaler*this.hoverXvel;
	this.hoverXvel 	+= -scaler*this.hoverX*0.001;
	 
	if (keys[this.KEY_JUMP] && this.hoverFuel > 0) {
		this.hoverFuel--;
		var temp = (this.maxHoverHeight / this.distToGround())
		if(temp > 2) temp = 2;
		this.velY  = 1 - temp;
	} else {
		if (this.distToGround() > 65)this.velY =  1
		else { this.hoverFuel = 200; this.velY = 0;}
	}
	
	if (keys[this.KEY_SHOOT]) {
		this.shoot();
	}
	
	//hover-stuff
	this.hoverY += this.hoverYvel;
	this.hoverYvel += -this.hoverY*0.0005;
	
	
	//this.updateJump();
	this.cx += this.velX*du;
	this.cy += this.velY*du;	
};

//===============================================
// ******************GIANT***********************
//===============================================


Player.prototype.giantUpdate = function (du) {
	
	if (keys[this.KEY_LEFT]) {
        this.velX = -1;
    } else if (keys[this.KEY_RIGHT]) {
        this.velX = 1;
    }
	
	//this.updateJump();
	this.cx += this.velX*du;
	this.cy += this.velY*du;	
};


//===============================================
// ******************NINJA***********************
//===============================================


Player.prototype.ninjaUpdate = function (du) {
	
	if (keys[this.KEY_LEFT]) {
        this.velX = -2;
    } else if (keys[this.KEY_RIGHT]) {
        this.velX = 2;
    }
	
	if (keys[this.KEY_SHOOT]) {
		this.shoot();
	}
	
	
	//this.updateJump();
	this.cx += this.velX*du;
	this.cy += this.velY*du;	
};
