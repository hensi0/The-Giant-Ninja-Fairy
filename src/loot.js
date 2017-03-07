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
function loot(descr) {
	this.setup(descr)
    // Default sprite, if not otherwise specified
	
	var temp = 600 + this.type*100;
	var sprite = new Sprite(g_images.dawg);
					
					sprite.sx = temp 
					sprite.sy = 554;
					sprite.width = 100;
					sprite.height = 100;
					sprite.scale = 0.8;
					sprite.drawAt = function(ctx,x,y){
						ctx.drawImage(this.image, this.sx, this.sy, this.width, this.height, x, y, this.width*this.scale, this.height*this.scale);
					};
		this.sprite = sprite || this.sprite;
		
		this.state['jumping'] = true;
		this.velX = Math.random()*2 - 1;
		this.velY = -(Math.random()*2 + 1);
};

loot.prototype = new Character();

// Initial, inheritable, default values
loot.prototype.cx = 0;
loot.prototype.cy = 0;
loot.prototype.velX = 0;
loot.prototype.velY = -3;
loot.prototype.HP = 40;
loot.prototype.maxhp = 40;

loot.prototype.rotation = 0;
loot.prototype.lifeTime = 0;
loot.prototype.initialized = false;
loot.prototype.dirbuffer = 0;
loot.prototype.state = {
	jumping: true,
	offGround: false,
	onGround: true
};


loot.prototype.update = function(du) {
	spatialManager.unregister(this);
	
	var Player = entityManager._character[0];
	
	
	//check if this is inside the viewport
	var margin = this.getSize().sizeX; //margin outside of viewport we want to update
	if(this.cx+this.getSize().sizeX/2 < g_viewPort.x-margin ||
	   this.cx-this.getSize().sizeX/2 > g_viewPort.x+g_canvas.width+margin) return;
	   
	if(this.type === 1 && this.state['jumping']) this.rotation += 0.1

	this.updateProxBlocks(this.cx, this.cy, this.cx+this.velX*du, this.cy+this.velY*du);
    if(this._isDeadNow) return entityManager.KILL_ME_NOW;	
	
	if(this.damagePlayerCD > 0) this.damagePlayerCD -= du;
	
	var nextX = this.cx + this.velX*du;
    var nextY = this.cy + this.velY*du;
	var prevX = this.cx;
    var prevY = this.cy;
	
	
	//check left/right collisions first and then top/bottomx
    var walkingIntoSomething = this.handlePartialCollision(nextX,prevY,"x");
	var standingOnSomething = this.handlePartialCollision(prevX,nextY,"y");
	// update location
    this.cx += this.velX*du;
    this.cy += this.velY*du;
	if(this.velY !== 0) this.state['jumping'] = true; 
	if(this.state['jumping'])this.velY += 0.05;
	
	/*
	var rotation = Math.atan((this.cy - this.shooter.cy)/(this.cx - this.shooter.cx));
		var temp = 1;
		if(this.cx <= this.shooter.cx) temp *= -1;
		this.velX = (3*this.velX + Math.abs(this.boomerangScaler)*40*temp*Math.cos(rotation))/4;
		this.velY = (3*this.velY + Math.abs(this.boomerangScaler)*40*temp*Math.sin(rotation))/4;
	*/

	
	
	this.lifeTime++;
	

	spatialManager.register(this);
};



loot.prototype.render = function (ctx) {
	if(this.sprite === 'blank') return;
		var oldAlpha = ctx.globalAlpha;
		ctx.save();
		
		// Use particle specific values
		ctx.globalAlpha = this.alpha;
		
		// Draw the thing
		this.sprite.scale = 1;
		this.sprite.drawCentredAt(ctx, this.cx, this.cy, this.rotation);
		
		ctx.globalAlpha = oldAlpha;
		ctx.beginPath();
		ctx.restore();
};

loot.prototype.getSize = function(){
    var size = {sizeX:10*this._scale,sizeY:10*this._scale};
    return size;
};


loot.prototype.handleCollision = function(hitEntity, axis) {
    var bEdge,lEdge,rEdge,tEdge;
    var standingOnSomething = false;
    var walkingIntoSomething = false;


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
        var sameRow = (hitCoords[0] == charCoords[0] || hitCoords[0] == charCoords[0]-1) || this.state['jumping'];

        lEdge = charToRight && sameRow;
        rEdge = charToLeft && sameRow;
        tEdge = charBelow && sameCol;
        bEdge = charAbove && sameCol;

        // Bad fix to make Character decide what happens to it's subclasses (loot, Zelda, Projectile)
        if(hitEntity instanceof Block) {
            var dir = 0; //direction of hit
            if(!hitEntity._isPassable) {
                standingOnSomething = standingOnSomething || bEdge;
                if(lEdge && this.velX < 0 && axis === "x") {
                    walkingIntoSomething = walkingIntoSomething || true;
					this.velX *= -1;
                }
                if(rEdge && this.velX > 0 && axis === "x") {
                    walkingIntoSomething = walkingIntoSomething || true;
					this.velX *= -1;
                }
                if(bEdge && this.velY > 0 && axis === "y") {
                    this.tempMaxJumpHeight = this.cy - this.maxPushHeight; 
                    var groundY = entityManager._world[0].getLocation((hitEntity.i), (hitEntity.j))[1] // block top y coordinate
                    this.putToGround(groundY);
					this.velX = 0;
                    dir = 4;
                } 
                if(tEdge && this.velY < 0  && axis === "y"){// && this.velY < 0) {
                    this.velY *= -1;
                    dir = 1;
                    this.state['offGround'] = true;
                }
            }
            hitEntity.activate(this, dir);
         }else if (hitEntity instanceof Player){
			//gain loot
			//this._isDeadNow = true;
			if(this.lifeTime > 80) {
				this._isDeadNow = true;
				//nomm nomm
				
				if(this.type === 1) hitEntity.gainLife(this.power);
				if(this.type === 2) g_gold += this.power;
				
			}
		} 
    return {standingOnSomething: standingOnSomething, walkingIntoSomething: walkingIntoSomething};
};
