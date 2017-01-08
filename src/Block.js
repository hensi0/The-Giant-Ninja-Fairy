// ====
// Block
// ====

"use strict";

/* jshint browser: true, devel: true, globalstrict: true */

/*
0        1         2         3         4         5         6         7         8
12345678901234567890123456789012345678901234567890123456789012345678901234567890
*/


// A generic contructor which accepts an arbitrary descriptor object
function Block(descr) {
	this.setup(descr);
	this.sprite = this.Asprite || g_sprites.defaultBlock;
	this.AnimationSprite = this.AnimationSprite || g_sprites.coin;
	this.sizeMod = 1;
	switch(this.type) {
		case 0: 
		break;
		
		case 6: 	this.sprite = this.mudBlockLogic(this.status);
		break; 
		
		case 2: 	this.sprite = g_sprites.spikes;
					this._isPassable = true;
					this.sizeMod = 0.6;
					this.damageCD = 0;
		break; 
		
		case 3:		this.sprite = g_sprites.bricks;
					this._isPassable = false;
					this._isBreakable = true;
		break;
		
		case 'E':	this.sprite = g_sprites.door;
					this._isPassable = true;
		break;
		
		case 'T':	this.sprite = g_sprites.loot;
					this._isPassable = true;
		break;
		
		default: 	this._isPassable = true;
					this.sprite = g_sprites.blank;
		break;
	}
	
};


Block.prototype.rotation = 0;
Block.prototype.sizeMod = 1;
Block.prototype.damageCD = 0;
Block.prototype._isDeadNow = false;
Block.prototype._isPassable = false;
Block.prototype._isBreakable = false;
Block.prototype.dim = g_canvas.height/28;

Block.prototype = new Entity();

Block.prototype.update = function (du) {
	if(this._isDeadNow) return true;
	else return false;
};

Block.prototype.mudBlockLogic = function (status) {
	//simple logic that might be implemented and improved uppon with diffrent tile-sets 
	if(status.above){
		if(status.left)
			return g_sprites.dirtMTL;
		else if(status.right)
			return g_sprites.dirtMTR;
		else
			return g_sprites.dirtMT;
	}
	this.rndRotation();
	return g_sprites.dirtM1;
	
};

Block.prototype.rndRotation = function () {
	if(Math.random() < 0.25)
		this.rotation = 0;
	else if(Math.random() < 0.33)
		this.rotation = 0.5*Math.PI;
	else if(Math.random() < 0.5)
		this.rotation = Math.PI;
	else this.rotation = Math.PI*1.5;
	
};

Block.prototype.render = function (ctx,x,y,w,h) {
	if(this._isDeadNow) return entityManager.KILL_ME_NOW;
	if(this.damageCD > 0) this.damageCD--;
	var img_h = this.sprite.height;
	var scale = h/img_h;
	this.sprite.scale = scale;
	this.sprite.drawCentredAt(ctx,x+w/2,y+h/2, this.rotation);
	
};

Block.prototype.activate = function (Char, direction) {
    //direction 1 = up, 2 = right, 3 = down, 4 = left
	/*
	if(direction === 1){
		this.tryToBreak();
	}
	*/
	switch(this.type) {
		case 0: 
		break;
		
		case 1: 	
		break; 
		
		case 2: 	if(Char instanceof Player && this.damageCD === 0){ 
						Char.takeHit(10);
						this.damageCD = 50;
					}
		break; 
		
		case 'E':	entityManager.enterLevel(entityManager._level +  1)
		break;
		
		case 'T':	this._isDeadNow = true;
					//get treasure
		break;
		
		default: 
		break;
	}
};

Block.prototype.getSize = function () {
    return {sizeX : this.sizeMod*this.halfWidth, sizeY : this.sizeMod*this.halfHeight};
};

Block.prototype.tryToBreak = function(){
    if(this._isBreakable) {
		this._isDeadNow = true;
	}
}