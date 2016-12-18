"use strict";

function Particle(descriptor){
	for( var key in descriptor ){
		this[key] = descriptor[key];
	}

	if(this.type === 'bomb'){
		this.animations = makeBombAnimation(0.04*this.r*this.r);
		this.animation = this.animations['boom'];
		this.rendertype = 'animation';
	} else if(this.type === 'flash'){
		this.animations = makeBombAnimation(1);
		this.animation = this.animations['flash'];
		this.rendertype = 'animation';
	}
	if(this.fade === false) this.alpha = 1;
}

Particle.prototype.dead = false;
Particle.prototype.rendertype = 'sprite';

Particle.prototype.update = function(dt){
	//Let's trim down the number of particles if performance is suffering
	if(this.type === 'spam')this.dead = (Math.random() > 1/dt);
	if(this.dead) return entityManager.KILL_ME_NOW;
	if(this.fade && this.alpha > 0) this.alpha -= 0.1;
	if(this.shrink) this.r = this.r*0.9;
	if(this.alpha < 0){
		this.dead = true;
		return;
	}
	this.cx += Math.cos(this.angle)*this.vel*dt;
	this.cy += Math.sin(this.angle)*this.vel*dt;
	if(this.rendertype === 'animation')if(this.animation.update(dt) === 1) this.dead = true;
	
}

Particle.prototype.render = function(ctx){
	if(this.alpha<0 || this.dead) return; //make sure we don't do anything silly
	// Store old values
	if(this.rendertype === 'sprite'){
		var oldStyle = ctx.fillStyle;
		var oldAlpha = ctx.globalAlpha;
		ctx.save();
		
		// Use particle specific values
		ctx.fillStyle = this.style;
		ctx.globalAlpha = this.alpha;
		// Draw the thing
			util.fillCircle(ctx, this.cx, this.cy, this.r);
		
		
		// give the context back as we found it
		ctx.fillStyle = oldStyle;
		ctx.globalAlpha = oldAlpha;
		ctx.beginPath();
		ctx.restore();
	} else {
		ctx.globalAlpha = this.alpha;
		this.animation.renderAt(ctx, this.cx, this.cy, this.angle);
		ctx.globalAlpha = 1;
	}
}