// ==========
// PROJECTILE
// ==========

"use strict";

/* jshint browser: true, devel: true, globalstrict: true */

/*
0        1         2         3         4         5         6         7         8
12345678901234567890123456789012345678901234567890123456789012345678901234567890
*/


// A generic contructor which accepts an arbitrary descriptor object
function Projectile(descr) {
    // Common inherited setup logic from Entity
    this.setup(descr);
    /*
	if(this.shooter instanceof Zelda) {
	   if(this.velX > 0)this.animation = makeZeldaSpellAnimation(this.radius/2);
	   else this.animation = makeZeldaSpellAnimation(-this.radius/2);
    }else if(this.shooter instanceof Enemy) {
       if(this.velX > 0)this.animation = makeEnemySpellAnimation(this.radius/2);
       else this.animation = makeEnemySpellAnimation(-this.radius/2);
   }
   */
   
	if(this.type === 'detector'){
		var sprite = 'blank';
		this.renderStyle = 'sprite';
		if(this.shooter.form === 'druid') this.etherial = true;
	}
	if(this.type === 'arrow') { 
		var sprite = new Sprite(g_images.dawg);
		this.renderStyle = 'sprite';
		this.dmg = 15;
		sprite.sx = 0 
		sprite.sy = 254;
		sprite.width = 100;
		sprite.height = 70;
		sprite.scale = 1;
		sprite.drawAt = function(ctx,x,y){
			ctx.drawImage(this.image, this.sx, this.sy, this.width, this.height, x, y, this.width*this.scale, this.height*this.scale);
		};
		this.rotation = Math.random()*3.14;
		this.radius = 5;
	}
	
	if(this.type === 'bomb'){
		var sprite = new Sprite(g_images.pixie);
			sprite.sx = 0 + Math.floor(Math.random()*8)*20;
			sprite.sy = 414;
			sprite.width = 20;
			sprite.height = 20;
			sprite.scale = 1;
			sprite.drawAt = function(ctx,x,y){
				ctx.drawImage(this.image, this.sx, this.sy, this.width, this.height, x, y, this.width*this.scale, this.height*this.scale);
			};
		this.renderStyle = 'sprite';
		this.rotation = Math.random()*3.14;
		this.dmg = 5;
		if(checkForUps("bombDmg")) this.dmg = 8;
		if(this.radius === 4.5)      this.dmg = 20;
	}
	if(this.type === 'boomerang'){
		this.animations = makeBoomerangAnimation(1);
		this.animation = this.animations['boomerang'];
		this.rendertype = 'animation';
		this.dmg = 1.6;
		if(checkForUps("boomerangDmg")) this.dmg *= 1.3;
		
	}
   
	this.sprite = sprite || this.sprite;
	if(this.type !== 'boomerang')this.HP = 1;
	else this.HP = 1000;
	if(!this.lifeSpan) this.lifeSpan = (3500 / NOMINAL_UPDATE_INTERVAL);
	this.startinglifeSpan = this.lifeSpan;
}

Projectile.prototype = new Character(); // Lol remember to change name of Character class... turns out it's useful for more things than just a character.

// Initial, inheritable, default values
Projectile.prototype.friendly = false;  //override if Mario made it 
Projectile.prototype.radius = 3;        //override in constructor for specific r
Projectile.prototype.rotation = 0;
Projectile.prototype.etherial = false;
Projectile.prototype.cx = 200;
Projectile.prototype.cy = 200;
Projectile.prototype.velX = 1;
Projectile.prototype.velY = 1;
Projectile.prototype.color;
Projectile.prototype.alpha = 0.7;
Projectile.prototype.boomerangScaler = 1;
Projectile.prototype.renderStyle;
Projectile.prototype.startinglifeSpan;
Projectile.prototype.hits = [];
//

// Convert times from milliseconds to "nominal" time units.
Projectile.prototype.lifeSpan;

Projectile.prototype.update = function (du) {
		
    // Unregister
    spatialManager.unregister(this);
	
    this.updateProxBlocks(this.cx, this.cy, this.cx+this.velX*du, this.cy+this.velY*du);
    if(this.lifeSpan < 0) this._isDeadNow = true;
	this.lifeSpan -= du;
	
	if(this.type !== 'boomerang' && this.type !== 'arrow') this.rotation += 0.08;
	
	if(this._isDeadNow){
		this.hits = [];	
		if(this.type === 'detector'){
			if(this.shooter instanceof Player){
				if(this.shooter.form === 'fairy' && (this.lifeSpan < (this.startinglifeSpan - 3))){ 
					if(checkForUps("blinkBombs")){
						entityManager.fireBullet(this.shooter.cx , this.shooter.cy, + 4, +4, 3, 0, this.shooter, 'bomb');
						entityManager.fireBullet(this.shooter.cx , this.shooter.cy, - 4, +4, 3, 0, this.shooter, 'bomb');
						entityManager.fireBullet(this.shooter.cx , this.shooter.cy, + 4, -4, 3, 0, this.shooter, 'bomb');
						entityManager.fireBullet(this.shooter.cx , this.shooter.cy, - 4, -4, 3, 0, this.shooter, 'bomb');
					}
					entityManager.generateParticle(this.shooter.cx, this.shooter.cy, 0.5*this.radius, 0, 0 , 'flash', false);
					this.shooter.cx = this.cx - 0.5*this.velX; 
					this.shooter.cy = this.cy - 0.5*this.velY;
					entityManager.generateParticle(this.shooter.cx, this.shooter.cy, 0.5*this.radius, 0, 0 , 'flash', false);
					util.play(g_audio.blink);
					if(checkForUps("blinkBombs2")){
						entityManager.fireBullet(this.shooter.cx , this.shooter.cy, + 4, +4, 3, 0, this.shooter, 'bomb');
						entityManager.fireBullet(this.shooter.cx , this.shooter.cy, - 4, +4, 3, 0, this.shooter, 'bomb');
						entityManager.fireBullet(this.shooter.cx , this.shooter.cy, + 4, -4, 3, 0, this.shooter, 'bomb');
						entityManager.fireBullet(this.shooter.cx , this.shooter.cy, - 4, -4, 3, 0, this.shooter, 'bomb');
					}
				}
			}
			if(this.shooter.form === 'fairy') return;
		}														//x,	y,		radius,			angle,	  avgVel, type, shouldFade?
		if(this.type === 'bomb'){ entityManager.generateParticle(this.cx + 0.5*this.velX, this.cy + 0.5*this.velY, this.radius, this.rotation, 0 , 'bomb', false);
									util.play(g_audio.bomb);}
		
		return entityManager.KILL_ME_NOW;
	}
	
	if(this.animation) this.animation.update(du);
	
	if(this.type === 'detector' && this.shooter.form === 'druid'){
		//this.shooter.cx = this.cx - 0.5*this.velX;
		//this.shooter.cy = this.cy - 0.5*this.velY;
		this.shooter.velX =  Math.max(-3,Math.min(3,this.velX*0.15*du));
		
		this.shooter.velY = Math.max(-3,Math.min(3,this.velY*0.15*du));
	}
	
	if(this.type === 'arrow') {this.velY += 0.1; this.configureRotation();}
/*
	this.animation.update(du);
	
    // select random colour
	var randIndex = Math.floor(Math.random()*this.particleColors.length);
	var randColour = this.particleColors[randIndex];

	// select random alpha
	var particleDir = Math.random()*Math.PI*2;
	
	//generateParticle
	entityManager.generateParticle(this.cx, this.cy, particleDir, 1, 0.7, this.radius*2, randColour);
*/
	if(this.alpha < (1-(du/50)))
		this.alpha += du/50;
	if(Math.abs(this.velX) < 20 && Math.abs(this.velY) < 20 && this.type === 'bomb')
	{ 
		this.velX *= Math.pow(1.03, du);
		this.velY *= Math.pow(1.03, du);
		this.radius += 0.015*du;
	}
	if(this.type === 'boomerang' && this.boomerangScaler > -1) this.boomerangScaler -= 0.02*du;

	if(this.type === 'boomerang' && this.boomerangScaler < 0){
		var rotation = Math.atan((this.cy - this.shooter.cy)/(this.cx - this.shooter.cx));
		var temp = 1;
		if(this.cx <= this.shooter.cx) temp *= -1;
		this.velX = (3*this.velX + Math.abs(this.boomerangScaler)*40*temp*Math.cos(rotation))/4;
		this.velY = (3*this.velY + Math.abs(this.boomerangScaler)*40*temp*Math.sin(rotation))/4;
	}
	
	var nextX = this.cx + this.velX*0.2*du*this.boomerangScaler;
    var nextY = this.cy + this.velY*0.2*du*this.boomerangScaler;

	
    this.handlePartialCollision(nextX,this.cy,"x")
	

    this.cx += this.velX *0.2* du *this.boomerangScaler;
    this.cy += this.velY *0.2* du *this.boomerangScaler;

    // (Re-)Register
    spatialManager.register(this);
	if(this.type === 'detector' && this.shooter.form === 'fairy' ){ this.update(du); return entityManager.KILL_ME_NOW;}
};

Projectile.prototype.getPos = function () {
    return {posX: this.cx-1, posY: this.cy-1};
};

Projectile.prototype.getSize = function () {
    return {sizeX: 2*this.radius, sizeY: 2*this.radius};
};

Projectile.prototype.firstHit = function (enem) {
    for(var i = 0; i < this.hits.length; i++){
		if(enem === this.hits[i]) return false;
	} return true;
};

Projectile.prototype.render = function (ctx) {
	if(this.renderStyle === 'sprite'){
		if(this.sprite === 'blank') return;
		var oldAlpha = ctx.globalAlpha;
		ctx.save();
		// Use particle specific values
		ctx.globalAlpha = this.alpha;
		// Draw the thing
		this.sprite.scale = 0.15*this.radius;
		this.sprite.drawCentredAt(ctx, this.cx, this.cy, this.rotation);
		//util.fillCircle(ctx,this.cx, this.cy, this.radius);
		// give the context back as we found it
		ctx.globalAlpha = oldAlpha;
		ctx.beginPath();
		ctx.restore();
	} else {
		this.animation.renderAt(ctx, this.cx, this.cy, this.rotation);
	}
};


Projectile.prototype.handleCollision = function(hitEntity, axis) {
    var bEdge,lEdge,rEdge,tEdge;
    var standingOnSomething;
    var walkingIntoSomething
	
	if(hitEntity instanceof Block && !hitEntity._isPassable) {
		if(this.type === 'bomb' && checkForUps("BouncyBombs")){
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
			var sameRow = true;

			lEdge = charToRight && sameRow;
			rEdge = charToLeft && sameRow;
			tEdge = charBelow && sameCol;
			bEdge = charAbove && sameCol;
			
			if(lEdge || rEdge) this.velX *= -1;
			if(tEdge || bEdge) this.velY *= -1;
			this.takeHit(0.5);
			return {standingOnSomething: standingOnSomething, walkingIntoSomething: walkingIntoSomething};
		}
		if(!this.etherial)this.takeHit(1);
		hitEntity.tryToBreak();
		//makes boomerang turn around upon hitting a brick
		if(this.boomerangScaler > -0.5 && !checkForUps("boomerangEtherial")) this.boomerangScaler = -0.5;
		if(this.type === 'arrow') entityManager.generateParticle(this.cx + 0.5*this.velX, this.cy + 0.5*this.velY, this.radius, this.rotation, 0 , 'arrow1', false);
		
    }
	
	else if(hitEntity instanceof Enemy && this.shooter instanceof Player) {
        
		hitEntity.takeHit(this.dmg);
		if(!this.etherial)this.takeHit(1);
    }
	//catch the boomerang
	else if(hitEntity instanceof Player && this.type === 'boomerang') {
		if(this.lifeSpan < (this.startinglifeSpan - 30)){ this.takeHit(1000);
			if(hitEntity.boomerangs < hitEntity.maxboomerangs) hitEntity.boomerangs++;
		}
    } 
	
	else if(hitEntity instanceof Player && this.shooter instanceof Enemy) {
		if(!hitEntity.state['dashing']) hitEntity.takeHit(15);
        this.takeHit(1);
		if(this.type === 'arrow') entityManager.generateParticle(this.cx + 0.5*this.velX, this.cy + 0.5*this.velY, this.radius, this.rotation + Math.PI, 2 , 'arrow2', true);
		
    }
	/*
	else if(hitEntity instanceof Zelda && this.shooter instanceof Shooter) {
        this.takeHit();
        hitEntity.takeHit();
    }
	*/
    return {standingOnSomething: standingOnSomething, walkingIntoSomething: walkingIntoSomething};
	
};

Projectile.prototype.takeHit = function(dmg) {
	if(!dmg) dmg = 1;
	this.HP -= dmg;
	if(this.HP <= 0) this._isDeadNow = true;
	// skoppa burt frá spikes
}

Projectile.prototype.configureRotation = function() {
	if(this.velX < 0){ 
		this.rotation = Math.PI + Math.atan(this.velY/this.velX); 
		//angle of player to mouse
	}
	else {
		this.rotation = Math.atan(this.velY/this.velX); 
		//angle of player to mouse
	}
};