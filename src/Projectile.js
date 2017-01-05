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
	}
   
	if(this.type === 'bomb' || this.type === 'arrow'){
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
	}
	if(this.type === 'boomerang'){
		this.animations = makeBoomerangAnimation(1);
		this.animation = this.animations['boomerang'];
		this.rendertype = 'animation';
	}
   
	this.sprite = sprite || this.sprite;
	if(this.type !== 'boomerang')this.HP = 1;
	else this.HP = 100;
	if(!this.lifeSpan) this.lifeSpan = (3500 / NOMINAL_UPDATE_INTERVAL);
	this.startinglifeSpan = this.lifeSpan;
}

Projectile.prototype = new Character(); // Lol remember to change name of Character class... turns out it's useful for more things than just a character.

// Initial, inheritable, default values
Projectile.prototype.friendly = false;  //override if Mario made it 
Projectile.prototype.radius = 3;        //override in constructor for specific r
Projectile.prototype.rotation = 0;
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
					entityManager.generateParticle(this.shooter.cx, this.shooter.cy, 0.5*this.radius, 0, 0 , 'flash', false);
					this.shooter.cx = this.cx - 0.5*this.velX; 
					this.shooter.cy = this.cy - 0.5*this.velY;
					entityManager.generateParticle(this.shooter.cx, this.shooter.cy, 0.5*this.radius, 0, 0 , 'flash', false);
				}
			}
		}														//x,	y,		radius,			angle,	  avgVel, type, shouldFade?
		if(this.type === 'bomb') entityManager.generateParticle(this.cx + 0.5*this.velX, this.cy + 0.5*this.velY, this.radius, this.rotation, 0 , 'bomb', false);
		
		return entityManager.KILL_ME_NOW;
	}
	
	if(this.animation) this.animation.update(du);
	
	if(this.type === 'detector' && this.shooter.form === 'druid'){
		//this.shooter.cx = this.cx - 0.5*this.velX;
		//this.shooter.cy = this.cy - 0.5*this.velY;
		this.shooter.velX = this.velX*0.2*du;
		this.shooter.velY = this.velY*0.2*du;
		
	}
	
	if(this.type === 'arrow') this.velY += 0.1;
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
	if(this.type === 'boomerang' && this.boomerangScaler > -1) this.boomerangScaler -= 0.014*du;

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
        this.takeHit(1);
		//makes boomerang turn around upon hitting a brick
		if(this.boomerangScaler > -0.5) this.boomerangScaler = -0.5;
    }
	
	else if(hitEntity instanceof Enemy && this.shooter instanceof Player) {
        
		if(this.firstHit(hitEntity)){
			this.hits.push(hitEntity);
			hitEntity.takeHit(15);
		}
    }
	//catch the boomerang
	else if(hitEntity instanceof Player && this.type === 'boomerang') {
		if(hitEntity.boomerangs < hitEntity.maxboomerangs) hitEntity.boomerangs++;
        if(this.lifeSpan < (this.startinglifeSpan - 3)) this.takeHit(100);
    } 
	
	else if(hitEntity instanceof Player && this.shooter instanceof Enemy) {
		hitEntity.takeHit(15);
        this.takeHit(1);
    }
	/*
	else if(hitEntity instanceof Zelda && this.shooter instanceof Shooter) {
        this.takeHit();
        hitEntity.takeHit();
    }
	*/
    return {standingOnSomething: standingOnSomething, walkingIntoSomething: walkingIntoSomething};
	
}
