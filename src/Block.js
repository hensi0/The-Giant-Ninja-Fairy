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
	this.isCracked = true;
	this._isInitialized = false;
};


Block.prototype.rotation = 0;
Block.prototype.sizeMod = 1;
Block.prototype.isCracked = true;
Block.prototype.damageCD = 0;
Block.prototype._isDeadNow = false;
Block.prototype._isPassable = false;
Block.prototype._isBreakable = false;
Block.prototype.dim = g_canvas.height/28;

Block.prototype = new Entity();

Block.prototype.update = function (du) {
	if(this._isDeadNow) return entityManager.KILL_ME_NOW;
	if(!this._isInitialized) this.initialize();
};

Block.prototype.initialize = function () {
	this._isInitialized = true;
	
	//above, left, right and below
			var a = 0;
			var l = 0;
			var r = 0;
			var b = 0;
			var world = entityManager._world[0].blocks;
			
			if(this.j > 0) 
					if(world[this.i][this.j-1]) l = (world[this.i][this.j-1].type);
			if(this.i > 0) 
					if(world[this.i-1][this.j]) a = (world[this.i-1][this.j].type);
			if(this.i < (world.length -1)) 
					if(world[this.i+1][this.j]) b = (world[this.i+1][this.j].type);
			if(this.j < (world[0].length -1))
					if(world[this.i][this.j+1]) r = (world[this.i][this.j+1].type);
		
			this.adjBlocks = {
				above : a,
				left: 	l,
				right: 	r,
				below:	b
			}
			
			this.renderPicker();
};

Block.prototype.renderPicker = function () {
	switch(this.type) {
		case 0: 
		break;
		
		case 6: 	this.sprite = this.mudBlockLogic(this.status); //normal block
		break; 
		
		case 2: 	this.sprite 		= this.spritify(64,128,64,64);
					this._isPassable 	= true;
					this.sizeMod 		= 0.6;
					this.damageCD 		= 0;
					this.rotation 		= Math.PI*Math.random();
					this.rotation2 		= Math.PI*Math.random();
					this.sprite2 		= this.spritify(256,128,64,64);
		break; 
		
		case 3:		this.sprite = g_sprites.bricks;
					this._isPassable = false;
					this._isBreakable = true;
		break;
		
		case 4:		this.sprite = this.pillarBlockLogic(this.status);
					this._isBreakable = true;
		break;
		
		case 'E':	this.sprite = g_sprites.door;
					this._isPassable = true;
		break;
		
		case 'T':	
					var sprite = new Sprite(g_images.dawg);
					
					sprite.sx = 100 
					sprite.sy = 554;
					sprite.width = 100;
					sprite.height = 100;
					sprite.scale = 1;
					sprite.drawAt = function(ctx,x,y){
						ctx.drawImage(this.image, this.sx, this.sy, 100, 100, x-97, y-85, 300, 300);
					};
					this.sprite = sprite;
					this._isPassable = true;
		break;
		
		default: 	this._isPassable = true;
					this.sprite = g_sprites.blank;
		break;
	}
};

Block.prototype.mudBlockLogic = function () {
	//simple logic that might be implemented and improved uppon with diffrent tile-sets 
	if(this.isPassableTest(this.adjBlocks.above)){
		if(this.adjBlocks.left === 0)
			return this.spritify(64,0,64,64);
		else if(this.adjBlocks.right === 0)
			return this.spritify(128,0,64,64);
		else
			return this.spritify(192,0,64,64);
	}
	//this.rndRotation();
	
	var sprite = this.spritify(0,0,64,64);
	this.isCracked = false;
	return sprite;
	
};


Block.prototype.isPassableTest = function (type) {
	var temp = false;
	if (type === 0) temp = true;
	if (type === 'E') temp = true;
	if (type === 'T') temp = true;
	if (type === 2) temp = true;
	if (type === 4) temp = true;
	
	return temp;
	
};

Block.prototype.pillarBlockLogic = function () {
	//simple logic that might be implemented and improved uppon with diffrent tile-sets 
	
	//this.rndRotation();
	
	var sprite = new Sprite(g_images.blocks);
					
					sprite.sx = 0 
					sprite.sy = 128;
					sprite.width = 64;
					sprite.height = 64;
					sprite.scale = 1;
					sprite.drawAt = function(ctx,x,y){
						ctx.drawImage(this.image, this.sx, this.sy, this.width, this.height, x, y, this.scale*2.02*this.width, this.scale*2.02*this.height);
					};
	if(this.adjBlocks.above === 0)
		sprite.sy = 128;
	else if (this.adjBlocks.above === 4 && this.adjBlocks.below === 4 )
		sprite.sy = 192;
	else {
		sprite.sy = 320;
	}
	return sprite;
	
};

Block.prototype.rndRotation = function () {
	if(Math.random() < 0.25)
		return 0;
	else if(Math.random() < 0.33)
		return  0.5*Math.PI;
	else if(Math.random() < 0.5)
		return  Math.PI;
	else return  Math.PI*1.5;
};

Block.prototype.spritify = function (sx, sy, w, h) {
	var sprite = new Sprite(g_images.blocks);
					
					sprite.sx = sx;
					sprite.sy = sy;
					sprite.width = w;
					sprite.height = h;
					sprite.scale = 1;
					sprite.drawAt = function(ctx,x,y){
						ctx.drawImage(this.image, this.sx, this.sy, this.width, this.height, x, y, this.scale*2.02*this.width, this.scale*2.02*this.height);
					};
	return sprite;
};

Block.prototype.render = function (ctx,x,y,w,h) {
	if(this._isDeadNow) return entityManager.KILL_ME_NOW;
	if(this.type === 2) {this.rotation += 0.01; this.rotation2 -= 0.005;}
	if(this.damageCD > 0) this.damageCD--;
	var img_h = this.sprite.height;
	var scale = h/img_h;
	this.sprite.scale = scale;
	this.sprite.drawCentredAt(ctx, x+w/2, y+h/2, this.rotation);
	if(this.sprite2){
		this.sprite2.scale = scale;
		var oldAlpha = ctx.globalAlpha;
		ctx.globalAlpha = Math.max(0.15, (Math.abs(Math.cos(this.rotation))*Math.abs(Math.sin(this.rotation))));
		
		this.sprite2.drawCentredAt(ctx,x+w/2,y+h/2, this.rotation2);
		ctx.globalAlpha = oldAlpha;
	}
	if(this.sprite3){
		this.sprite3.scale = scale;
		this.sprite3.drawCentredAt(ctx,x+w/2,y+h/2, this.rotation3);
	}
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
		
		case 'E':	if(Char instanceof Player)
					entityManager.enterLevel(entityManager._level +  1)
		break;
		
		case 'T':	//this._isDeadNow = true;
					this.sprite.sx = 200;
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
		this._isPassable = true;
	} else if(!this.isCracked){
		this.sprite3 = this.spritify(0,64,64,64);
		this.rotation3 = 0;
		this.rotation3 = this.rndRotation();
		this.isCracked = true;
	}
	
}