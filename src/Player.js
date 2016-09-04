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
	
	this.cx = 10;
	this.cy = 10;
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
Player.prototype.pHeight = 60;
Player.prototype.hoverXvel = 0;
Player.prototype.hoverYvel = 0;
Player.prototype.maxHoverHeight = 300;
Player.prototype.hasRealeasedUp = true;
Player.prototype.isJumping = false;
Player.prototype.blinkCharge = 0;

//ninja variables

Player.prototype.hasDoubleJumped = false;
Player.prototype.hasNinjadUp = false;


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
		this.pHeight = 20;
		this.isJumping = true;
		var temp = 	(Math.random() >  0.5);
		if(temp) 	this.hoverXvel =  0.4;
		else  		this.hoverXvel = -0.4;
		temp = 	(Math.random() >  0.5);
		if(temp) 	this.hoverYvel =  0.4;
		else  		this.hoverYvel = -0.4;
};

Player.prototype.goGiant = function () {
        this.form = 1;
		this.hoverX = 0;
		this.isJumping = true;
		this.hoverY = 0;
		this.blinkCharge = 0;
		this.pHeight = 100;
		this.cx = this.cx + this.hoverX;
		this.cy = this.cy + this.hoverY;
};

Player.prototype.goNinja = function () {
        this.form = 2;
		this.hoverX = 0;
		this.hoverY = 0;
		this.blinkCharge = 0;
		this.pHeight = 60;
		this.isJumping = true;
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
			if(this.form === 0) this.goNinja();
			else if(this.form === 1) this.goFairy();
			else this.goGiant();
			//smoke cloud
		}
		if (keys[this.KEY_SWAP2]) {
			this.SwapCD = 30;
			if(this.form === 0) this.goGiant();
			else if(this.form === 1) this.goNinja();
			else this.goFairy();
			//smoke cloud
		}
	}
	
	
	if(this.form === 0){
		
		this.fairyUpdate(du);
	
	} else if(this.form === 1){
		
		this.giantUpdate(du);
	
	} else if(this.form === 2){
		
		this.ninjaUpdate(du);
	}
	
	
};

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

//===============================================
// ******************FAIRY***********************
//===============================================


Player.prototype.fairyUpdate = function (du) {
	
	var scaler = 1;
	if (keys[this.KEY_LEFT]) {
        this.velX = -2;
		scaler = 0.2;
    } else if (keys[this.KEY_RIGHT]) {
        this.velX = 2;
		scaler = 0.2;
    } else {
		this.velX = 0;
	}
	
	this.hoverX 	+=  scaler*this.hoverXvel;
	this.hoverXvel 	+= -scaler*this.hoverX*0.001;
	 
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
};


//===============================================
// ******************NINJA***********************
//===============================================


Player.prototype.ninjaUpdate = function (du) {
	
	if (keys[this.KEY_LEFT]) {
        this.velX = -2.4;
    } else if (keys[this.KEY_RIGHT]) {
        this.velX = 2.4;
    } else this.velX = 0;
	
	if( this.isJumping ) {
		
		this.velY += 0.1;
		if(!keys[this.KEY_JUMP]) this.hasNinjadUp = true;
		if(!this.hasDoubleJumped && keys[this.KEY_JUMP] && this.velY > -2 && this.hasNinjadUp){
			this.velY = -3;
			this.hasDoubleJumped = true;
		}
		
	} else if (keys[this.KEY_JUMP] && this.hasRealeasedUp) {
		this.isJumping = true;
		this.hasRealeasedUp = false;
		this.velY = -5;
		this.hasNinjadUp = false;
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
};
