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
			
			//above, left, right and below
			var a = false;
			var l = false;
			var r = false;
			var b = false;

			if(j > 0) 
					l = (this.world[i][j-1] === 0);
			if(i > 0) 
					a = (this.world[i-1][j] === 0);
			if(i < (this.world.length -1)) 
					b = (this.world[i+1][j] === 0);
			if(j < (this.world[0].length -1))
					r = (this.world[i][j+1] === 0);
		
			var adjBlocks = {
				above : a,
				left: 	l,
				right: 	r,
				below:	b
			}
			
			
			
			this.blocks[i][j] = (s === 0 ? null : new Block({i: i, j: j, type: s, status: adjBlocks}));
		}
	}
}

World.prototype = new Entity();

// =====================
// WORLD COLLISION STUFF
// =====================
    
// Initial, inheritable, default values
World.prototype.height = 14 //Able to fit 14 blocks on the height of the canvas.
World.prototype.blocks; 
World.prototype.numRooms = 0; 
World.prototype.mainWayReady = false; 
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
	var row = newCoords[0]-3;
	var col = newCoords[1]-1;
	for(var i = 0; i < 5; i++) {
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

World.prototype.isSafeToTransform = function ( x, y) {
	//to prevent players clipping into terrain by changing hitbox-sizes
	if(x < 0 || x > (this.world.length - 1)) return true;
	if (this.blocks[x][y]){ 
		if(this.blocks[x][y].isPassable) return true;
		else return false;
	} else return true;
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

// q,p,L,J,-,I are all refering to shape of the corresponding Two-way room and where you can enter it
// K, R, T , W are threeway tiles
// S is start, E is finish and B are bonus-rooms.


World.prototype.generateLevel = function( roomsX, roomsY){
	var Rooms = new Array(roomsX);
	for(var i = 0 ; i < roomsX ; i++) 
		Rooms[i] = new Array(roomsY);
	for(var i = 0; i < roomsX; i++) {
		for(var j = 0; j < roomsY; j++) {
			Rooms[i][j] = 0;
		}
	}
	this.numRooms = 0;
	var startingRoom = Math.floor(Math.random()*roomsX);
	
	Rooms[startingRoom][roomsY - 1] = 'S' 
	Rooms = this.findNextRooms(Rooms, startingRoom, roomsY - 1 , 'S', roomsX, roomsY);
	
	for(var i = 0; i < roomsX; i++) {
		for(var j = 0; j < roomsY; j++) {
			if(Rooms[i][j] === 0) 
				this.checkForConnections(i,j, Rooms, roomsX, roomsY);

		}
	}
	
	return this.createTheLevel(Rooms, roomsX, roomsY);
};	

//Makes a level out of an array of rooms  
World.prototype.createTheLevel = function( rooms, mX, mY){
	var newGrid = new Array(14*mX);
	for(var i = 0 ; i < 14*mX ; i++) 
		newGrid[i] = new Array(14*mY);
	for(var i = 0 ; i < mX ; i++)
		for(var j = 0 ; j < mY ; j++)
			this.fillRoom(newGrid, 14*i, 14*j, rooms[i][j]);
	//asdasd
	
};	

//sorts room -blocks into an array 
World.prototype.fillRoom = function( grid, x, y, type){
	if(type === 'S') 
		for(var i = 0 ; i < 14 ; i++)
			for(var j = 0 ; j < 14 ; j++)
				grid[i][j] = this.Worlds.S[0][i][j];
	if(type === 'E') 
		for(var i = 0 ; i < 14 ; i++)
			for(var j = 0 ; j < 14 ; j++)
				grid[i][j] = this.Worlds.E[0][i][j];
	if(type === 'I') 
		for(var i = 0 ; i < 14 ; i++)
			for(var j = 0 ; j < 14 ; j++)
				grid[i][j] = this.Worlds.I[0][i][j];
	if(type === '-') 
		for(var i = 0 ; i < 14 ; i++)
			for(var j = 0 ; j < 14 ; j++)
				grid[i][j] = this.rotateGrid(this.Worlds.I[0][i][j] , 1);
	if(type === 'J') 
		for(var i = 0 ; i < 14 ; i++)
			for(var j = 0 ; j < 14 ; j++)
				grid[i][j] = this.Worlds.J[0][i][j];
	if(type === 'L') 
		for(var i = 0 ; i < 14 ; i++)
			for(var j = 0 ; j < 14 ; j++)
				grid[i][j] = this.rotateGrid(this.Worlds.J[0][i][j], 1);
	if(type === 'p') 
		for(var i = 0 ; i < 14 ; i++)
			for(var j = 0 ; j < 14 ; j++)
				grid[i][j] = this.rotateGrid(this.Worlds.J[0][i][j], 2);
	if(type === 'q') 
		for(var i = 0 ; i < 14 ; i++)
			for(var j = 0 ; j < 14 ; j++)
				grid[i][j] = this.rotateGrid(this.Worlds.J[0][i][j], 3);
	if(type === 'T') 
		for(var i = 0 ; i < 14 ; i++)
			for(var j = 0 ; j < 14 ; j++)
				grid[i][j] = this.Worlds.T[0][i][j];
	if(type === 'R') 
		for(var i = 0 ; i < 14 ; i++)
			for(var j = 0 ; j < 14 ; j++)
				grid[i][j] = this.rotateGrid(this.Worlds.T[0][i][j], 1);
	if(type === 'W') 
		for(var i = 0 ; i < 14 ; i++)
			for(var j = 0 ; j < 14 ; j++)
				grid[i][j] = this.rotateGrid(this.Worlds.T[0][i][j], 2);			
	if(type === 'K') 
		for(var i = 0 ; i < 14 ; i++)
			for(var j = 0 ; j < 14 ; j++)
				grid[i][j] = this.rotateGrid(this.Worlds.T[0][i][j], 3);
	
};	

//after a maze has been constructed this function adds random "wrong" pathways.
World.prototype.checkForConnections = function(x,y, Rooms , roomsX, roomsY) {
	var l = false;
	var r = false;
	var u = false;
	var d = false;
	
	if(x > 0) 				if(Rooms[x-1][y] != 0) 		return this.shapeAndGo(Rooms, x,y,'l', roomsX, roomsY);
	if(x < (roomsX -1)) 	if(Rooms[x+1][y] != 0) 		return this.shapeAndGo(Rooms, x,y,'r', roomsX, roomsY);
	if(y > 0) 				if(Rooms[x][y-1] != 0) 		return this.shapeAndGo(Rooms, x,y,'u', roomsX, roomsY);
	if(y < (roomsY - 1)) 	if(Rooms[x][y+1] != 0) 		return this.shapeAndGo(Rooms, x,y,'d', roomsX, roomsY);
	
	return Rooms
}

World.prototype.shapeAndGo = function(Rooms,x,y,p, roomsX, roomsY) {
	
	if(p === 'l'){
		if(Rooms[x-1][y] === 'J') Rooms[x-1][y] = 'W';
		if(Rooms[x-1][y] === 'q') Rooms[x-1][y] = 'T';
		Rooms = this.findNextRooms(Rooms, x, y, 'r', roomsX, roomsY);
	} else if(p === 'r'){
		if(Rooms[x+1][y] === 'L') Rooms[x+1][y] = 'W';
		if(Rooms[x+1][y] === 'p') Rooms[x+1][y] = 'T';
		Rooms = this.findNextRooms(Rooms, x, y, 'l', roomsX, roomsY);
	} else if(p === 'u'){
		if(Rooms[x][y-1] === 'L') Rooms[x][y-1] = 'K';
		if(Rooms[x][y-1] === 'J') Rooms[x][y-1] = 'R';
		Rooms = this.findNextRooms(Rooms, x, y, 'd', roomsX, roomsY);
	} else if(p === 'd'){
		if(Rooms[x][y+1] === 'q') Rooms[x][y+1] = 'R';
		if(Rooms[x][y+1] === 'p') Rooms[x][y+1] = 'K';
		Rooms = this.findNextRooms(Rooms, x, y, 'up', roomsX, roomsY);
	} else return Rooms;
	
}

//makes a randomized snake-like path from a block until it get's stuck

World.prototype.findNextRooms = function( rooms, x , y, last, mX, mY){
	var l = false;
	var r = false;
	var u = false;
	var d = false;

	this.numRooms++;
	
	if(x > 0) 		if(rooms[x-1][y] === 0) 				l = true;
	if(x < (mX -1)) if(rooms[x+1][y] === 0) 				r = true;
	if(y > 0) 		if(rooms[x][y-1] === 0) 				u = true;
	if(y < (mY - 1)) if(rooms[x][y+1] === 0 && last != 'u') d = true;
	if(last === 'up' || last === 'S' || last === 'I') 		u = false;
	
	var ways = '';
	if(l) ways += 'l'; 
	if(r) ways += 'r';
	if(u) ways += 'u';
	if(d) ways += 'd';

	switch(ways) {
	case '':
		if(this.mainWayReady){
			rooms[x][y] = 'B';
		} else {
			rooms[x][y] = 'E'; 
			this.mainWayReady = true;
		}
		return rooms;
		break;
		//one-option
	case 'l':
		if(last === 'up') rooms[x][y] = 'q';
		else if (last === 'l') rooms[x][y] = '-';
		else if (last === 'd') rooms[x][y] = 'J';
		return this.findNextRooms(rooms, x-1, y, 'l', mX, mY);
		break;
	case 'r':
		if(last === 'up') rooms[x][y] = 'p';
		else if (last === 'r') rooms[x][y] = '-';
		else if (last === 'd') rooms[x][y] = 'L';
		return this.findNextRooms(rooms, x+1, y, 'r', mX, mY);
		break;
	case 'u':
		if (last === 'l' || last === 'S') rooms[x][y] = 'L';
		else if (last === 'r' || last === 'S') rooms[x][y] = 'J';
		return this.findNextRooms(rooms, x, y-1, 'up', mX, mY);
		break;
	case 'd':
		if (last === 'l') rooms[x][y] = 'p';
		else if (last === 'r') rooms[x][y] = 'q';
		else if (last === 'd') rooms[x][y] = 'I';
		return this.findNextRooms(rooms, x, y+1, 'd', mX, mY);
		break;
		// two-options
	case 'lr':
		if(Math.random() < (x/mX)) {
			//left
			if(last === 'up') 		rooms[x][y] = 'q';
			else if(last != 'S') 	rooms[x][y] = 'J';
			return this.findNextRooms(rooms, x-1, y, 'l', mX, mY);
		}else { 
			//right
			if(last === 'up') 		rooms[x][y] = 'p';
			else if(last != 'S')	rooms[x][y] = 'L';
			return this.findNextRooms(rooms, x+1, y, 'r', mX, mY);
		}
		break;
	case 'lu':
		if(Math.random() > 0.4) {
			//left
			rooms[x][y] = '-';
			return this.findNextRooms(rooms, x-1, y, 'l', mX, mY);
		}else {
			//up
			rooms[x][y] = 'L';
			return this.findNextRooms(rooms, x, y-1, 'up', mX, mY);
		}
		break;
	case 'ld':
		if(Math.random() > 0.4) {
			//left
			if(last === 'l') rooms[x][y] = '-';
			else rooms[x][y] = 'J'
			return this.findNextRooms(rooms, x-1, y, 'l', mX, mY);
		}else {
			//down
			if(last === 'l') rooms[x][y] = 'p';
			else rooms[x][y] = 'I';
			return this.findNextRooms(rooms, x, y+1, 'd', mX, mY);
		}
		break;
	case 'rd':
		if(Math.random() > 0.4) {
			//right
			if(last === 'r') rooms[x][y] = '-';
			else rooms[x][y] = 'L'
			return this.findNextRooms(rooms, x+1, y, 'r', mX, mY);
		}else {
			//down
			if(last === 'r') rooms[x][y] = 'q';
			else rooms[x][y] = 'I';
			return this.findNextRooms(rooms, x, y+1, 'd', mX, mY);
		}
		break;
	case 'ru':
		if(Math.random() > 0.4) {
			//right
			rooms[x][y] = '-';
			return this.findNextRooms(rooms, x+1, y, 'r', mX, mY);
		}else {
			//up
			rooms[x][y] = 'J';
			return this.findNextRooms(rooms, x, y-1, 'up', mX, mY);
		}
		break;
	case 'ud':
		if(Math.random() > 0.4) {
			//up
			if(last === 'l') rooms[x][y] = 'L';
			else rooms[x][y] = 'J';
			return this.findNextRooms(rooms, x, y-1, 'up', mX, mY);
		}else {
			//down
			if(last === 'l') rooms[x][y] = 'p';
			else rooms[x][y] = 'q';
			return this.findNextRooms(rooms, x, y+1, 'd', mX, mY);
		}
		break;
	//aaaaaaaand 3-way-options
	case 'rud':
		if(Math.random() > 0.4) {
			//right
			rooms[x][y] = '-';
			return this.findNextRooms(rooms, x+1, y, 'r', mX, mY);
		}else if(Math.random() > 0.5){
			//up
			rooms[x][y] = 'J';
			return this.findNextRooms(rooms, x, y-1, 'up', mX, mY);
		} else {
			//down
			rooms[x][y] = 'q';
			return this.findNextRooms(rooms, x, y+1, 'd', mX, mY);
		}
		break;
	case 'lud':
		if(Math.random() > 0.4) {
			//left
			rooms[x][y] = '-';
			return this.findNextRooms(rooms, x-1, y, 'l', mX, mY);
		}else if(Math.random() > 0.5){
			//up
			rooms[x][y] = 'L';
			return this.findNextRooms(rooms, x, y-1, 'up', mX, mY);
		} else {
			//down
			rooms[x][y] = 'p';
			return this.findNextRooms(rooms, x, y+1, 'd', mX, mY);
		}
		break;
	case 'lrd':
		if(Math.random() < 0.3) {
			//down
			rooms[x][y] = 'I';
			return this.findNextRooms(rooms, x, y+1, 'd', mX, mY);
		}else if(Math.random() > 0.5){
			//left
			rooms[x][y] = 'J';
			return this.findNextRooms(rooms, x-1, y, 'l', mX, mY);
		} else {
			//right
			rooms[x][y] = 'L';
			return this.findNextRooms(rooms, x+1, y, 'r', mX, mY);
		}
		break;
	default:
		console.log("panic" + last);
		return rooms;
	}

	
};

World.prototype.Worlds =  {
	//current shitty - handcrafted level
	1 : [
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,6,0,0,0,6,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,6,0,0,0,6,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,6,0,0,0,6,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,6,0,0,0,6,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,6,0,0,0,6,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,6,0,0,0,0,0,0,0,0,0,0,6,0,0,0,0,0,0,0,0,0,0,6,0,0,0,6,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,6,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,6,0,0,0,6,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,6,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,6,0,0,0,6,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,6,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,6,0,0,0,0,0,0,0,0,6,0,0,0,6,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,6,0,0,0,0,0,0,0,0,0,0,0,0,6,0,0,0,0,0,0,0,0,0,0,6,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,6,0,0,0,0,0,0,6,0,0,0,6,0,0,0,0,0,0,6,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,6,6,6,0,0,0,0,0,6,0,0,0,6,0,0,0,0,0,0,0,0,0,0,6,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[6,6,6,6,6,6,6,6,6,6,6,6,6,6,0,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6],
	[6,6,6,6,6,6,6,6,6,6,6,6,6,6,0,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6]
	],
	
	'S' : [
	[
	[6,6,6,6,6,6,6,6,6,6,6,6,6,6],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,6,0,0,0,0,6,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,6,0,0,0,0,0,0,0,0,6,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[6,6,6,6,6,6,6,6,6,6,6,6,6,6]
	]
	],
	
	'E' : [
	[
	[6,6,6,6,6,0,0,0,0,0,6,6,6,6],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,6,0,0,0,0,6,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,6,0,0,0,0,0,0,0,0,6,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[6,6,6,6,0,0,0,0,0,0,6,6,6,6]
	]
	],
	
	'I' : [
	[
	[6,0,0,0,0,0,0,0,0,0,0,0,0,6],
	[6,0,0,0,0,0,0,0,0,0,0,0,0,6],
	[6,0,0,0,0,0,0,0,0,0,0,0,0,6],
	[6,0,0,0,0,0,0,0,0,0,0,0,0,6],
	[6,0,0,0,0,0,0,0,0,0,0,0,0,6],
	[6,0,0,0,0,6,6,6,6,6,0,0,0,6],
	[6,0,0,0,0,0,0,6,0,0,0,0,0,6],
	[6,0,0,0,0,0,0,6,0,0,0,0,0,6],
	[6,0,0,6,0,0,0,6,0,0,0,0,0,6],
	[6,0,0,0,0,0,0,6,0,0,0,0,0,6],
	[6,0,0,0,0,6,6,6,6,6,0,0,0,6],
	[6,0,0,0,0,0,0,0,0,0,0,0,0,6],
	[6,0,0,0,0,0,0,0,0,0,0,0,0,6],
	[6,0,0,0,0,0,0,0,0,0,0,0,0,6]
	]
	],
	
	
	'J' : [
	[
	[6,6,6,6,6,6,0,0,0,0,0,0,6,6],
	[6,6,6,0,0,0,0,0,0,0,0,0,0,6],
	[6,6,6,0,0,0,0,0,0,6,0,0,0,6],
	[6,6,0,0,0,0,0,0,6,0,0,0,0,6],
	[6,0,0,0,0,0,0,0,6,0,0,0,0,6],
	[0,0,0,0,0,0,0,0,0,6,0,0,0,6],
	[0,0,0,0,0,0,0,6,6,6,0,0,0,6],
	[0,0,0,0,0,0,6,0,0,0,0,0,0,6],
	[0,0,0,6,0,0,0,0,0,0,0,0,0,6],
	[0,0,6,0,0,0,6,0,0,0,0,0,0,6],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,6],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,6],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,6],
	[6,6,6,6,6,6,6,6,6,6,6,6,6,6]
	]
	],
	
	'T' : [
	[
	[6,6,6,6,6,6,6,6,6,6,6,6,6,6],
	[6,6,6,0,0,0,0,0,0,0,0,0,0,6],
	[6,6,6,0,0,0,0,0,0,0,0,0,0,6],
	[6,6,0,0,0,6,6,6,6,6,0,0,0,6],
	[6,0,0,0,0,0,0,6,0,0,0,0,0,6],
	[0,0,0,0,0,0,0,6,0,0,0,0,0,6],
	[0,0,0,0,0,0,0,6,0,0,0,0,0,6],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,6,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,6,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,6],
	[6,6,6,0,0,0,0,0,0,0,6,6,6,6]
	]
	],
}

World.prototype.rotateGrid = function(grid, numb) {
	if(numb === 0) return grid;
	var newGrid = new Array(14);
	for(var i = 0 ; i < 14 ; i++) 
		newGrid[i] = new Array(14);
	
	for(var i = 0; i < 14; i++) {
		for(var j = 0; j < 14; j++) {
			newGrid[i][j] = grid[13-j][13-i];
		}
	}
	numb--;
	return rotateGrid(newGrid, numb);
};