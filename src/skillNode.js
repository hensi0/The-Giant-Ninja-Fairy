// ==========
// Character STUFF
// ==========

"use strict";

/* jshint browser: true, devel: true, globalstrict: true */

/*
0        1         2         3         4         5         6         7         8
12345678901234567890123456789012345678901234567890123456789012345678901234567890
*/

// A generic contructor which accepts an arbitrary descriptor object
function Node(descr) {
	for (var property in descr) {
        this[property] = descr[property];
    }
	var sprite = new Sprite(g_images.TreeIcons);
		sprite.sx = 0 
		sprite.sy = 0;
		sprite.width  = 64;
		sprite.height = 64;
		sprite.scale = 1;
		sprite.drawAt = function(ctx,x,y){
			ctx.drawImage(this.image, this.sx, this.sy, this.width, this.height, x, y, this.width*this.scale, this.height*this.scale);
		};
	this.sprite = sprite;
	
	this.isInitialized = false;
	this.angle = -(Math.PI/180)*144;
};

Node.prototype.x = 0;
Node.prototype.y = 0;
Node.prototype.iconX = 0;
Node.prototype.iconY = 0;
Node.prototype.parentX = 0;
Node.prototype.parentY = 0;
Node.prototype.price = 0;
Node.prototype.level = 0;
Node.prototype.angle = 0;
Node.prototype.radius = 30;
Node.prototype.isBought = false;
Node.prototype.cost = 10;
Node.prototype.name = "placeholder";
Node.prototype.isInitialized = false;
Node.prototype.childNodes = [];


Node.prototype.update = function(du) {
	if(!this.isInitialized) this.initialize();
};

Node.prototype.initialize = function() {
	var aFixer = (Math.PI/180)*38*(Math.sqrt(this.level + 2)/(this.level + 2));
	var angle = this.angle - aFixer;
	if(this.level > 2) angle += aFixer;
	var length = 160 - 50*Math.sqrt(Math.sqrt(this.level));
	if(this.cost === 10)this.cost = (1 + this.level*this.level*this.level)* 5;
	for(var i = 0; i < this.childNodes.length ; i++){
		this.childNodes[i].x = this.x + length*Math.cos(angle);
		this.childNodes[i].y = this.y + length*Math.sin(angle);
		this.childNodes[i].parentX = this.x;
		this.childNodes[i].parentY = this.y;
		this.childNodes[i].angle = angle;
		this.childNodes[i].level = this.level + 1;
		this.childNodes[i].initialize();
		angle += 2*aFixer;
	}
};


Node.prototype.render = function (ctx) {
	var x = this.x - 32;
	var y = this.y - 32;
	if(this.isBought)
		for(var i = 0; i < this.childNodes.length ; i++){
			this.childNodes[i].render(ctx);
		}
	if(this.level !== 0){
		ctx.strokeStyle = "red";
		ctx.beginPath();
		ctx.moveTo(this.parentX,this.parentY);
		ctx.lineTo(this.x, this.y);
		ctx.stroke();
		this.adjustSprite(128,0,64,64);	
		this.sprite.drawAt(ctx, x, y);
	}
	
	this.adjustSprite(this.iconX,this.iconY,64,64);
	this.sprite.drawAt(ctx, x , y);
	
	if(this.isBought && this.level !== 0){ 	
		this.adjustSprite(0,0,73,73);	
		this.sprite.drawAt(ctx, x, y);
	}
	//util.fillCircle(ctx, x, y, this.radius);
	
};

Node.prototype.adjustSprite = function(x,y,w,h){
    this.sprite.sx = x;
	this.sprite.sy = y;
	this.sprite.width  = w;
	this.sprite.height = h;
};

Node.prototype.getSize = function(){
    var size = {sizeX:35*this._scale,sizeY:20*this._scale};
    return size;
};

Node.prototype.generateButtons = function(butts){
	if(this.childNodes === [])
		return butts
	else if(this.isBought){
		for(var i = 0; i < this.childNodes.length ; i++){
			butts = this.childNodes[i].generateButtons(butts);
		}
		butts.push({x: this.x, y: this.y, r: this.radius, string: "", node: this});
	} else butts.push({x: this.x, y: this.y, r: this.radius, string: "", node: this});
	return butts;
};


Node.prototype.tryToBuy = function(gold) {
	if(gold >= this.cost && !this.isBought){
		this.isBought = true;
		g_skills.push(this.name);
		return this.cost;
	} else return 0;
};


//function to check if an upgrade has been bought
function checkForUps( s ){
    for(var i = 0 ; i < g_skills.length; i++){
		if(g_skills[i] === s) return true;
	}
	return false;
}




