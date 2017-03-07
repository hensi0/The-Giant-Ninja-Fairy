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
	
	
	this.animationsD =  makePlayerAnimationDruid(this._scale*0.5);
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
							spawning: true, holdingWall: false, dashing: false}
							
// Sounds (should be preloaded and initialized in constructor):
// Player.prototype.warpSound = new Audio(
//    "sounds/PlayerWarp.ogg");

//generic variables
Player.prototype.HP = 100;
Player.prototype.maxhp = 100;
Player.prototype.mana = 100;
Player.prototype.maxMana = 100;
Player.prototype.maxVelX = 3.9;
Player.prototype.maxVelY = 6.5;
Player.prototype.maxPushHeight = 120; 
Player.prototype.tempMaxJumpHeight = 0;
Player.prototype.oneXPerMouseStuff = true;
Player.prototype.jumpStateBuffer = 0;
Player.prototype.holdStateBuffer = 0;
Player.prototype.FoWrot = 0;
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
Player.prototype.lastWallGrabX = 0;
Player.prototype.maxboomerangs = 1;
Player.prototype.boomerangs = 1;
Player.prototype.dashCD = 1;
Player.prototype.dashDmg = 20;

Character.prototype.reset = function () {
	//this.HP = this.maxhp;
	var pos = entityManager._world[0].returnStartLocation();
    this.setPos(pos.x, pos.y);
	this._isDeadNow = false;
	this.boomerangs = this.maxboomerangs;
	//this.isAlive = true;
};

//to be used when spawning/swithcing forms
Player.prototype.resetStates = function () {
       this.state = {jumping: true, canJump: false, pushing: false, 
							offGround: true, casting: false, hasJumped: false,
							onGround: false, idle: false, flying: false, 
							facingRight: true, inWater: false, fairyFire: false,
							spawning: true, holdingWall: false, dashing: false}
};

Player.prototype.checkForUpgrades = function () {
       if(checkForUps("dashDmg")) this.dashDmg = 35;
	   if(checkForUps("dashDmg2"))  this.dashDmg = 50;
	   if(checkForUps("additionalBoomerang"))  this.maxboomerangs = 2;
	   if(checkForUps("additionalBoomerang2"))  this.maxboomerangs = 3;
	   if(checkForUps("moreHP"))  this.maxhp = 130;
	   if(checkForUps("moreHP2"))  this.maxhp = 160;
	   if(checkForUps("moreHP3"))  this.maxhp = 200;
	   this.HP = this.maxhp;
};


Player.prototype.goFairy = function () {
        this.form = 'fairy';
		this.hoverX = 0;
		this.hoverY = 0;
		this.animations = this.animationsF;
		this.state['spawning'] = true;
		this.updateStatus();
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
		this.boomerangs = this.maxboomerangs;
		this.animations = this.animationsD;
		this.animation = this.animations['idleRight'];
		this.blinkCharge = 0;
		this.pHeight = 30;
		this.cx = this.cx + this.hoverX;
		this.cy = this.cy + this.hoverY;
		this.resetStates();
		this.updateStatus();
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
			this.velY = -2;
			this.tempMaxJumpHeight = this.cy - this.maxPushHeight;
			if(checkForUps("druidMaxJump")) this.tempMaxJumpHeight -= 20; 
			util.play(g_audio.jump);
		} else if(this.form === 'goat'){
			this.velY = -2;
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
			/*
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
			*/
			
			if(this.form === 'druid'){ 
				this.goFairy();
			}else {
				this.cy -= this.getSize().sizeY/1.5;
				this.goDruid();
			}
			//smoke cloud
};

//standard update routine for the player
Player.prototype.update = function (du) {
	
	if(this.cx === undefined) this.cx = 100;
	if(this.cy === undefined) this.cy = 300;
	
	if(this.HP <= 0) this.isAlive = false;
	if(!this.isAlive && false){
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
			if(this._isDeadNow){
				g_MenuScreenOn = true;
				g_menu.buttonTranslator("mainMenu")
			}
			else this.swap(true);
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
    if(this.handlePartialCollision(nextX,prevY,"x")){
		this.velX = 0;
		if(this.form === 'druid'){
			var coords;
			var temp = entityManager._world[0].blockDim
			if(this.state['facingRight']) coords = entityManager._world[0].getBlockCoords(this.cx + temp, this.cy + temp/2.3);
			else coords = entityManager._world[0].getBlockCoords(this.cx - temp, this.cy + temp/2.3);
			var bricktest1 = entityManager._world[0].blocks[coords[0]][coords[1]];
			if(this.state['facingRight']) coords = entityManager._world[0].getBlockCoords(this.cx + temp, this.cy - temp/2.3);
			else coords = entityManager._world[0].getBlockCoords(this.cx - temp, this.cy - temp/2.3);
			var bricktest2 = entityManager._world[0].blocks[coords[0]][coords[1]];
			
			if(bricktest1 && bricktest2)
				if(this.state['jumping'] && this.cx !== this.lastWallGrabX
													&& (keys[this.KEY_LEFT] || keys[this.KEY_RIGHT])){
					this.state['holdingWall'] = true;
					this.velY = 0;
					this.state['dashing'] = false;
					if(this.holdStateBuffer === 0)util.play(g_audio.jump);
					this.holdStateBuffer++;
					if(this.state['facingRight']){ 
						this.velX = 1;
						this.cx = bricktest2.cx - temp/2 - this.getSize().sizeX/2 - 1;
					} else {
						this.velX = -1;
						this.cx = bricktest2.cx + temp/2 + this.getSize().sizeX/2 + 1;
					}
					
					this.tempMaxJumpHeight = this.cy - 0.6*this.maxPushHeight;
					this.state['offGround'] = false;
				}
		}		
	} else { this.state['holdingWall'] = false; this.holdStateBuffer = 0;}
	
	bEdge = this.handlePartialCollision(prevX,nextY,"y");
	
	if(this.teleportCD > 0) this.teleportCD -= du;
	if(this.dashCD > 0) this.dashCD -= du;
	
	this.state['canJump'] = (!this.state['jumping'] && !keys[this.KEY_JUMP]) || this.state['flying'] || this.state['holdingWall'];
	
	if(this._isDeadNow) {this.velX = 0; this.velY = Math.max(0, this.velY)}
	if(this.state['fairyFire'] && this.state['jumping']){ this.shootZePlasmaBalls(du); this.updateLocation(du*0.18); } 
	else if(this.state['holdingWall'])	this.updateLocation(0);
	else 								this.updateLocation(du);

    this.updateJump(bEdge);

	this.updateStatus();
	
	if(this.form === 'druid'){ 
		if(this.mana <= this.maxMana) this.mana += du*0.9;
	} else if(checkForUps("LessEnergy"))this.mana -= du*0.45;
	else this.mana -= du*0.65;
	
	if (this.mana <= 0) {
		this.cy -= this.getSize().sizeY/1.5; 
		this.goDruid(); 
		this.SwapCD = 45;
	}  
	
	var flySpeedScaler = 1;
	if(this.form === 'fairy' && this.status.substring(0,5) === "inAir") 
		flySpeedScaler = 1 - Math.max( -1 , this.velY/7);
	
	
	if(this.animation.update(du*flySpeedScaler) === 1) 
		{if(this.status.substring(0,3) === "dyin") this.status = "deadRight"; this.state['spawning'] = false; this.state['dashing'] = false; this.updateStatus();}

	spatialManager.register(this);
	
};


Character.prototype.takeHit = function(dmg) {
	if(this._isDeadNow) return;
	if(!dmg) dmg = 1;
	this.HP -= dmg;
	if(this.HP <= 0){
		this._isDeadNow = true;
		this.goDruid();
	}
	// skoppa burt frá spikes
}


//bassic rendering handled by the animation.js
Player.prototype.render = function (ctx) {
	var addOn = 0;
	if(checkForUps("visionRange2")) addOn = 6;
	else if(checkForUps("visionRange")) addOn = 3;
	
    g_sprites.FoW.scale = 11 + addOn; //add camera zoom
	this.FoWrot += 0.04;
	var mouseX = this.cx + 0.5*(g_mouseX2 - g_canvas.width/2);
	var mouseY = this.cy + 0.5*(g_mouseY2 - g_canvas.height/2)
	util.fillCircle(ctx, mouseX, mouseY, 1);
	
	g_sprites.FoW.drawCentredAt(ctx, this.cx, this.cy, this.FoWrot);
	g_sprites.FoW.scale = 11 + (addOn/2); //add camera zoom
	g_sprites.FoW.drawCentredAt(ctx, mouseX, mouseY, -this.FoWrot);
	this.animation.renderAt(ctx, this.cx, this.cy, this.rotation);
	
};


//LMB functioning while in fairy form
Player.prototype.shootZePlasmaBalls = function (du) {
    if(this.plasmaTimer <= 0){ 
		var vMod = 4;
		if(checkForUps("bombSpeed")) vMod = 6;
		var aMod = Math.PI/20 - Math.random()*(Math.PI/10) 
		if(checkForUps("bombAcc")) aMod /= 2;
		var velx = vMod*Math.cos(this.rotation + aMod);
		var vely = vMod*Math.sin(this.rotation + aMod);
		var temp = 1;
		if(g_mouseX2 <= g_canvas.width/2) temp *= -1;
		if(checkForUps("BBchance") && Math.random() < 0.1)
			entityManager.fireBullet(this.cx + 2*temp*velx, this.cy - 5 + temp*vely, temp*velx, temp*vely, 4.5, 0, this, 'bomb');
		else
			entityManager.fireBullet(this.cx + 2*temp*velx, this.cy - 5 + temp*vely, temp*velx, temp*vely, 3, 0, this, 'bomb');
		if(Math.random() < 0.2) 		util.play(g_audio.shooting1);
		else if(Math.random() < 0.25) 	util.play(g_audio.shooting2);
		else if(Math.random() < 0.33) 	util.play(g_audio.shooting3);
		else if(Math.random() < 0.5) 	util.play(g_audio.shooting4);
		else 							util.play(g_audio.shooting5);
		
		this.plasmaTimer = 10;
	}else this.plasmaTimer -= du;	
};

//LMB functioning while in druid form
Player.prototype.shootZeBoomerang = function () {
		this.configureRotation();
		var vMod = 25;
		if(checkForUps("boomerangSpeed")) vMod = 35;
		var aMod = 0;//Math.PI/20 - Math.random()*(Math.PI/10) 
		var velx = vMod*Math.cos(this.rotation + aMod);
		var vely = vMod*Math.sin(this.rotation + aMod);
		var temp = 1;
		if(g_mouseX2 <= g_canvas.width/2) temp *= -1;
		entityManager.fireBullet(this.cx , this.cy - 5 + temp*vely, temp*velx, temp*vely, 6, 0, this, 'boomerang', 400);
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
		this.jumpStateBuffer = 0;
		if(!(keys[this.KEY_LEFT] || keys[this.KEY_RIGHT])) this.velX = 0;
    }else{
		this.state['jumping'] = true;
		this.jumpStateBuffer++;
	}
	
    // Set offGround to true so that we can't keep pushing while in air.
    if(this.cy <= this.tempMaxJumpHeight) {
        this.state['offGround'] = true;
		//keys[this.KEY_JUMP] = false;
    }
};

//on realease of the LMB toggles the shooting state for fairy
Player.prototype.stopZeShootin = function () {
	//interupt shootin
	this.state['fairyFire'] = false;
	this.plasmaTimer = 1;
	this.oneXPerMouseStuff = true;
};

//LMB handling for player
Player.prototype.LMB = function (bool) {
	if(this._isDeadNow) return;
	//left mouse Button has been pressed
	if(this.form === 'fairy') this.state['fairyFire'] = true;
	if(this.form === 'druid' && this.oneXPerMouseStuff && this.boomerangs > 0){
		this.oneXPerMouseStuff = false;
		this.shootZeBoomerang();
		this.boomerangs--;
	}
};

//RMB handling for the player
Player.prototype.RMB = function (bool) {
	if(this._isDeadNow) return;
	//right mouse button
	if(!g_mouseLocked) return;
	if(this.form === 'fairy' && !this.state['spawning'] && this.teleportCD <= 0) this.teleport();
	if(this.form === 'druid' && !this.state['spawning'] && this.dashCD <= 0) this.dash();
	
};

//Special ability in fairy form
Player.prototype.teleport = function () {
	var vMod = 1;
	this.configureRotation();
	var velx = vMod*Math.cos(this.rotation);
	var vely = vMod*Math.sin(this.rotation);
	var temp = 1;
	var LS = 400;
	if(checkForUps("blinkRange")) LS = 600;
	if(g_mouseX2 <= g_canvas.width/2) temp *= -1;
		entityManager.fireBullet(this.cx, this.cy -1, temp*velx, temp*vely, 10, 0, this, 'detector', LS);
	this.rotation = 0;
	this.state['spawning'] = true;
	this.velY = 0;
	this.velX = 0;
	this.teleportCD = 120;
	if(checkForUps("blinkCD"))  this.teleportCD = 90;
	if(checkForUps("blinkCD2")) this.teleportCD = 60;

};

//Special ability in fairy form
Player.prototype.dash = function () {
	var vMod = 15;
	if(checkForUps("dashSpeed")) vMod = 30;
	this.configureRotation();
	var velx = vMod*Math.cos(this.rotation);
	var vely = vMod*Math.sin(this.rotation);
	var temp = 1;
	if(g_mouseX2 <= g_canvas.width/2) temp *= -1;
	if(!this.state['jumping']) vely = temp*Math.min(-2 , vely*temp);
	
		entityManager.fireBullet(this.cx, this.cy, temp*velx, temp*vely, this._scale, 0, this, 'detector', 30);
	//this.rotation = 0;
	//this.state['dashing'] = true;
	this.velY = 0;
	this.velX = 0;
	this.dashCD = 100;
	if(checkForUps("dashCD1")) this.dashCD = 80;
	this.state['dashing'] = true;
	this.state['jumping'] = true;
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
					if(this.form === 'druid')util.play(g_audio.jump);
					this.lastWallGrabX = 0;
					this.state['dashing'] = false;
                    dir = 4;
                } 
                if(tEdge && this.velY < 0  && axis === "y"){// && this.velY < 0) {
                    this.velY *= -0.01;
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
			this.animation.reset();
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
    if(!this.state['spawning'] && this.state['holdingWall'] && this.holdStateBuffer > 1) 
		if(this.holdStateBuffer < 15) nextStatus = "holdingWall"+dir;
		else nextStatus = "holdingWall2"+dir;
	else if(this.jumpStateBuffer > 1 && !this.state['spawning']){if(this.state['dashing']) nextStatus = "dashing"+dir; else nextStatus = "inAir"+dir;}
    else if(this.velX === 0 && !(this.jumpStateBuffer > 1) && !this.state['spawning']) nextStatus = "idle"+(wasMovingLeft?"Left":dir);
    else if(!(this.jumpStateBuffer > 1) && !this.state['spawning']) nextStatus = "walking"+dir;
	else nextStatus = "spawning"+dir;
	if(nextStatus === "inAir"+dir && this.form === 'druid'){	
		if(this.velY >= 0) 	nextStatus += "Down";
		else 			 	nextStatus += "Up";
	}
	if(this._isDeadNow)
		if(this.status.substring(0,3) !== "dead")
			nextStatus = "dead" + dir;
		else nextStatus = "dyin" + dir;
		
    // Update animation
    if(nextStatus!==this.status){
		if(this.status)
			if(nextStatus.substring(0,3) !== this.status.substring(0,3))
				this.animation.reset();
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
		if(this.form === 'druid'){	this.velY = -3.4 ; this.lastWallGrabX = this.cx;}
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
	var size = 							{sizeX:20*this._scale,sizeY:18*this._scale};
	if(this.form === 'goat') 	size = 	{sizeX:20*this._scale,sizeY:64*this._scale};
	if(this.form === 'druid') 	size = 	{sizeX:20*this._scale,sizeY:40*this._scale};
    return size;
}

