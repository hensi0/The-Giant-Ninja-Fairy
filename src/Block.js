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

	switch(this.type) {
		case 0: 
		break;
		
		case 6: this.sprite = g_sprites.dirtM1;
		break; 

		default: this._isPassable = true;
				 this.sprite = g_sprites.blank;
		break;
	}
	
};

Block.prototype._isDeadNow = false;
Block.prototype._isPassable = false;
Block.prototype.dim = g_canvas.height/14;

Block.prototype = new Entity();

Block.prototype.update = function (du) {
	if(this._isDeadNow) return true;
	else return false;
};


Block.prototype.render = function (ctx,x,y,w,h) {
	
	var img_h = this.sprite.height;
	var scale = h/img_h;
	this.sprite.scale = scale;
	this.sprite.drawCentredAt(ctx,x+w/2,y+h/2);
	
};

Block.prototype.activate = function (Char, direction) {
    //direction 1 = up, 2 = right, 3 = down, 4 = left
	
	if(direction === 1){
		this.tryToBreak();
	}
	if(this.type === 2){
		if(Char instanceof Player) Char.takeHit();
	}
};


Block.prototype.tryToBreak = function(){
    if(this._isBreakable) {
		this._isDeadNow = true;
	}
}