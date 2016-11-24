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
    var sprite = new Sprite(g_images.pixie);
		sprite.sx = 0 + Math.floor(Math.random()*8)*20;
		sprite.sy = 414;
		sprite.width = 20;
		sprite.height = 20;
		sprite.scale = 1;
		sprite.drawAt = function(ctx,x,y){
			ctx.drawImage(this.image, this.sx, this.sy, this.width, this.height, x, y, this.width*this.scale, this.height*this.scale);
		};
		this.sprite = sprite;
	
	this.hp = 1;
}

Projectile.prototype = new Character(); // Lol remember to change name of Character class... turns out it's useful for more things than just a character.

// Initial, inheritable, default values
Projectile.prototype.friendly = false;  //override if Mario made it 
Projectile.prototype.radius = 2;        //override in constructor for specific r
Projectile.prototype.rotation = 0;
Projectile.prototype.cx = 200;
Projectile.prototype.cy = 200;
Projectile.prototype.velX = 1;
Projectile.prototype.velY = 1;
Projectile.prototype.color;
Projectile.prototype.alpha = 0.7;

//

// Convert times from milliseconds to "nominal" time units.
Projectile.prototype.lifeSpan = 3500 / NOMINAL_UPDATE_INTERVAL;

Projectile.prototype.update = function (du) {
		
    // Unregister
    spatialManager.unregister(this);
	
    this.updateProxBlocks(this.cx, this.cy, this.cx+this.velX*du, this.cy+this.velY*du);
    if(this.lifeSpan < 0) return entityManager.KILL_ME_NOW;
	this.lifeSpan -= du;
	
	if(this._isDeadNow){
		return entityManager.KILL_ME_NOW;
	}
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
	if(Math.abs(this.velX) < 20 && Math.abs(this.velY) < 20)
	{ 
		this.velX *= Math.pow(1.03, du);
		this.velY *= Math.pow(1.03, du);
	}
	this.radius *= Math.pow(1.01, du);
	var nextX = this.cx + this.velX*0.2*du;
    var nextY = this.cy + this.velY*0.2*du;

	
    this.handlePartialCollision(nextX,this.cy,"x")
	

    this.cx += this.velX *0.2* du;
    this.cy += this.velY *0.2* du;

    // (Re-)Register
    spatialManager.register(this);

};

Projectile.prototype.getPos = function () {
    return {posX: this.cx-1, posY: this.cy-1};
};

Projectile.prototype.getSize = function () {
    return {sizeX: 1.8*this.radius, sizeY: 1.8*this.radius};
};

Projectile.prototype.render = function (ctx) {
    var oldAlpha = ctx.globalAlpha;
	ctx.save();
	// Use particle specific values
	ctx.globalAlpha = this.alpha;
	// Draw the thing
	this.sprite.scale = 0.1*this.radius;
	this.sprite.drawAt(ctx, this.cx, this.cy);
    //util.fillCircle(ctx,this.cx, this.cy, this.radius);
	// give the context back as we found it
	ctx.globalAlpha = oldAlpha;
	ctx.beginPath();
	ctx.restore();
	
};


Projectile.prototype.handleCollision = function(hitEntity, axis) {
    var bEdge,lEdge,rEdge,tEdge;
    var standingOnSomething;
    var walkingIntoSomething
	
	if(hitEntity instanceof Block && !hitEntity._isPassable) {
        this.takeHit();
    }
	/*
	else if(hitEntity instanceof Enemy && this.shooter instanceof Zelda) {
        this.takeHit();
        hitEntity.takeHit();
    }else if(hitEntity instanceof Zelda && this.shooter instanceof Shooter) {
        this.takeHit();
        hitEntity.takeHit();
    }
	*/
    return {standingOnSomething: standingOnSomething, walkingIntoSomething: walkingIntoSomething};
	
}
