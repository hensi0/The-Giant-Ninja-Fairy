// ==========
// World
// ==========

"use strict";

/* jshint browser: true, devel: true, globalstrict: true */

/*
0        1         2         3         4         5         6         7         8
12345678901234567890123456789012345678901234567890123456789012345678901234567890
*/


// A generic contructor which accepts an arbitrary descriptor object
function World(descr) {
    // Common inherited setup logic from Entity
    this.setup(descr);
    // Define current level:
    this.world = this.Worlds[descr.level];

    this.blocks = [];
	var s = 0;	
	//will be changed when I combine rooms randomly
	for(var i = 0; i < this.world.length; i++) {
		this.blocks[i] = [];
		for(var j = 0; j < this.world[i].length; j++) {
			s = this.world[i][j];
			var location = this.getLocation(i,j);
			/* how we generated map - defined enemies in prinsess Avokado.
			Might get used later if they will be bound to rooms and not spreaded 
			randomly throughout the world
			if(s === 'a'){
				entityManager.generateEnemy({cx: location[0], cy: location[1]});
			} 
			*/
			this.blocks[i][j] = (s === 0 ? null : new Block({i: i, j: j, type: s}));
		}
	}
}

World.prototype = new Entity();

// =====================
// WORLD COLLISION STUFF
// =====================
    
// Initial, inheritable, default values
World.prototype.height = 14 //Able to fit 14 blocks on the height of the canvas.
World.prototype.blockDim = g_canvas.height/14;


World.prototype.getBlockCoords = function(x,y) {
	var col = Math.floor(x/(this.blockDim));
	var row = Math.floor(y/(this.blockDim));
	return [row, col];
}

World.prototype.getLocation = function(i,j) {
	//var block = this.blocks[i][j];
	return [j*this.blockDim, 
			i*this.blockDim]
}


World.prototype.collidesWith = function (player, prevX, prevY, nextX, nextY) {
	var halfW = player.getSize().sizeX;
	var halfH = player.getSize().sizeY;
	var newCoords = this.getBlockCoords(prevX,prevY+halfH/2 - 2); // off by 2 because we have off by 1 for zelda's putToGround AND regular off by 1 so we don't fall after landing.
	
	var collidingBlocks = [];
	var collidingCoords = [];
	var row = newCoords[0]-2;
	var col = newCoords[1]-1;
	for(var i = 0; i < 4; i++) {
		for(var j = 0; j < 3; j++) {
			if(this.blocks[row+i]) {
				if(this.blocks[row+i][col+j]) {
					collidingBlocks.push(this.blocks[row+i][col+j]);	
				}
			}	
		}
	}

	for(var block in collidingBlocks) {
		var b = collidingBlocks[block];
		if(b) {
			var coords = this.getLocation(b.i, b.j);
			b.cx = coords[0]+this.blockDim/2;
			b.cy = coords[1]+this.blockDim/2;
			b.halfWidth  = this.blockDim;
			b.halfHeight = this.blockDim;
		}
	}
// */

	return {blocks: collidingBlocks, coords: collidingCoords};
};


// ================================
// BRICK World - GAME LOOP FUNCTIONS
// ================================


World.prototype.update = function (du) {
	/*
	for(var i = 0; i < this.world.length; i++) {
		for(var j = 0; j < this.world[i].length; j++) {
		}
	}
	*/
};

World.prototype.render = function(ctx) {
	ctx.save();
	for(var i = 0; i < this.world.length; i++) {
		for(var j = 0; j < this.world[i].length; j++) {
			var block = this.blocks[i][j];
			if(block != null) {
				var coords = this.getLocation(i,j)
				block.render(ctx, coords[0], coords[1], this.blockDim, this.blockDim);
			}
		}
	}

	ctx.restore();
}

// ======================
// VARIOUS WORLD PARTS DEFINED
// ======================


World.prototype.Worlds =  {
	
	1 : [
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,6,0,0,0,0,0,0,0,0,0,0,6,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,6,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,6,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,6,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,6,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,6,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,6,0,0,0,0,0,0,6,0,0,0,6,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,6,6,6,0,0,0,0,0,6,0,0,0,6,0,0,0],
	[6,6,6,6,6,6,6,6,6,6,6,6,6,6,0,6,6,6,6,6,6,6,6,6,6,6],
	[6,6,6,6,6,6,6,6,6,6,6,6,6,6,0,6,6,6,6,6,6,6,6,6,6,6]
	],
};		