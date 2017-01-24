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
	this.Worlds[1] = this.generateLevel(descr.x, descr.y);
    this.world = this.Worlds[1];

    this.blocks = [];
	var s = 0;	
	//will be changed when I combine rooms randomly
	for(var i = 0; i < this.world.length; i++) {
		this.blocks[i] = [];
		for(var j = 0; j < this.world[i].length; j++) {
			s = this.world[i][j];
			var location = this.getLocation(i,j);
			
			if(s === 'D'){
				//entityManager.generateDog({cx: location[0], cy: location[1]});
				//entityManager.generateRanger({cx: location[0], cy: location[1]});
				entityManager.generateBat({cx: location[0], cy: location[1]});
				s = 0;
			}
			//above, left, right and below
			var a = false;
			var l = false;
			var r = false;
			var b = false;
			
			if(j > 0) 
					l = (this.world[i][j-1]);
			if(i > 0) 
					a = (this.world[i-1][j]);
			if(i < (this.world.length -1)) 
					b = (this.world[i+1][j]);
			if(j < (this.world[0].length -1))
					r = (this.world[i][j+1]);
		
			var adjBlocks = {
				above : a,
				left: 	l,
				right: 	r,
				below:	b
			}
			s = this.handleMultiBlocks(s);
				
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
World.prototype.map; 
World.prototype.blockDim = g_canvas.height/24;


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

//a function that takes a block that only has a chance to exist and determs if it should
World.prototype.handleMultiBlocks = function(s) {
	if			(s === 7){
		if(Math.random() > 0.6) return 6;
		else 					return 0;
	} else if 	(s === 2){
		if(Math.random() > 0.6) return 2;
		else 					return 0;
	} else if 	(s === 5){
		if(Math.random() > 0.5) return 4;
		else 					return 0;
	} return s;
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

//function to check if there are blocks above the character making him unable to grow bigger
World.prototype.isSafeToTransform = function ( x, y) {
	//to prevent players clipping into terrain by changing hitbox-sizes
	if(x < 0 || x > (this.world.length - 1)) return true;
	if(y < 0 || y > (this.world[0].length - 1)) return true;
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
	
	var newGrid = new Array(roomsY);
	for(var i = 0 ; i < roomsY ; i++) 
		newGrid[i] = new Array(roomsX);
	

	
	for(var i = 0; i < roomsY; i++) {
		for(var j = 0; j < roomsX; j++) {
			newGrid[i][j] = Rooms[j][i];
		}
	}
	
	return this.createTheLevel(newGrid, roomsY, roomsX);
};	

//Makes a level out of an array of rooms  
World.prototype.createTheLevel = function( rooms, mX, mY){
	var newGrid = new Array(14*mX);
	for(var i = 0 ; i < 14*mX ; i++) 
		newGrid[i] = new Array(14*mY);
	this.map = rooms;
	for(var i = 0 ; i < mX ; i++)
		for(var j = 0 ; j < mY ; j++){
			newGrid = this.fillRoom(newGrid, 14*i, 14*j, rooms[i][j], mX, mY);
		}
	//console.log("y: " + mY + " x: " + mX);
	for(var i = 0 ; i < 14*mY ; i++) newGrid[0][i] = 6;
	for(var i = 0 ; i < 14*mX ; i++) newGrid[i][((14*mY)-1)] = 6;
		
	return newGrid;
	
};	
//Returns the x/y c.o. for the middle of the starting room looked up in the "map"
World.prototype.returnStartLocation = function(){
	var BS = this.blockDim; //blockSize
	for(var i = 0; i < this.map.length ; i++)
		for(var j = 0; j < this.map[0].length; j++)
			if(this.map[i][j] === 'S') return {x: BS*(7+(14*j)), y: BS*(7+14*i)};
	return {x: 0, y: 0};
};	

World.prototype.fillRoomWithBlocks = function(room){
	var grid = new Array(14);
	for(var i = 0 ; i < 14 ; i++) 
		grid[i] = new Array(14);
	var t = Math.floor(Math.random()*room.length);
	for(var i = 0 ; i < 14 ; i++)
			for(var j = 0 ; j < 14 ; j++)
				grid[i][j] = room[t][j][i];
			grid = this.rotateGrid(grid, 1);
	return grid;
};	

//sorts room -blocks into an array 
World.prototype.fillRoom = function( level, x, y, type, mX, mY){
	
	var grid = new Array(14);
	for(var i = 0 ; i < 14 ; i++) 
		grid[i] = new Array(14);
	
	//console.log(type);
	switch(type) {
	case 'S': 
		var roomType = this.WhereIsTheExit('S', x/14, y/14, mX, mY);
		grid = this.fillRoomWithBlocks(roomType);
		break;
	case 'E':
		var roomType = this.WhereIsTheExit('E', x/14, y/14, mX, mY);
		grid = this.fillRoomWithBlocks(roomType);
		break;
	case 'B':
		var roomType = this.WhereIsTheExit('B', x/14, y/14, mX, mY);
		grid = this.fillRoomWithBlocks(roomType);
		break;
	case 0:
		grid = this.fillRoomWithBlocks(this.Worlds.O);
		break;
	case 'I':
		grid = this.fillRoomWithBlocks(this.Worlds.I);
		break;
	case '-': 
		grid = this.fillRoomWithBlocks(this.Worlds.V);
		break;
	case 'J': 
		grid = this.fillRoomWithBlocks(this.Worlds.J);
		break;
	case 'L': 
		grid = this.fillRoomWithBlocks(this.Worlds.L);
		break;
	case 'p':
		grid = this.fillRoomWithBlocks(this.Worlds.p);
		break;
	case 'q':
		grid = this.fillRoomWithBlocks(this.Worlds.q);
		break;
	case 'T':
		grid = this.fillRoomWithBlocks(this.Worlds.T);
		break;
	case 'R':
		grid = this.fillRoomWithBlocks(this.Worlds.R);
		break;
	case 'W':
		grid = this.fillRoomWithBlocks(this.Worlds.W);
		break;
	case 'K':
		grid = this.fillRoomWithBlocks(this.Worlds.K);
		break;
	default:
		console.log("panic: " + type);
	}
	
	for(var i = 0 ; i < 14 ; i++)
			for(var j = 0 ; j < 14 ; j++)
				level[x+i][y+j] = grid[i][j];
	return level;
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
		if(Rooms[x-1][y] === 'I') Rooms[x-1][y] = 'K';
		Rooms = this.findNextRooms(Rooms, x, y, 'r', roomsX, roomsY);
	} else if(p === 'r'){
		if(Rooms[x+1][y] === 'L') Rooms[x+1][y] = 'W';
		if(Rooms[x+1][y] === 'p') Rooms[x+1][y] = 'T';
		if(Rooms[x+1][y] === 'I') Rooms[x+1][y] = 'R';
		Rooms = this.findNextRooms(Rooms, x, y, 'l', roomsX, roomsY);
	} else if(p === 'u'){
		if(Rooms[x][y-1] === 'L') Rooms[x][y-1] = 'K';
		if(Rooms[x][y-1] === 'J') Rooms[x][y-1] = 'R';
		if(Rooms[x][y-1] === '-') Rooms[x][y-1] = 'T';
		Rooms = this.findNextRooms(Rooms, x, y, 'd', roomsX, roomsY);
	} else if(p === 'd'){
		if(Rooms[x][y+1] === 'q') Rooms[x][y+1] = 'R';
		if(Rooms[x][y+1] === 'p') Rooms[x][y+1] = 'K';
		if(Rooms[x][y+1] === '-') Rooms[x][y+1] = 'W';
		Rooms = this.findNextRooms(Rooms, x, y, 'up', roomsX, roomsY);
	} else return Rooms;
	
}
//function that finds and tells the room-creator function where there are entrances 
//on this room. This is used on bonus and Ending rooms and therefor always has only one exit
//currently this then simply returns the corresponding room
World.prototype.WhereIsTheExit = function(type, y, x, mY, mX){
	var dir = '';
	
	if(y > 0){
		var t = this.map[y-1][x];
		if(t==='I' || t==='R' || t==='K' || t==='q' || t==='T' || t==='p') 		dir += 'up';
	}
	if(y < (mY -1)){
		var t = this.map[y+1][x];
		if(t==='I' || t==='R' || t==='K' || t==='J' || t==='W' || t==='L') 		dir += 'down';
	}
	if(x > 0){ 		
		var t = this.map[y][x-1];
		if(t==='p' || t==='K' || t==='L' || t==='-' || t==='T' || t==='W')		dir += 'left';
	}
	if(x < (mX - 1)){
		var t = this.map[y][x+1];
		if(t==='q' || t==='R' || t==='J' || t==='-' || t==='T' || t==='W')		dir += 'right';
	}
	//console.log("(x,y): (" + x + "," + y + ") dir: " + dir);
	
	
	
	if(type === 'E'){
		if(dir === 'up') 	return this.Worlds.Eu;
		if(dir === 'down') 	return this.Worlds.Ed;
		if(dir === 'left')	return this.Worlds.El;
		if(dir === 'right')	return this.Worlds.Er;
	} else if(type === 'B'){
		if(dir === 'up')	return this.Worlds.Bu;
		if(dir === 'down')	return this.Worlds.Bd;
		if(dir === 'left')	return this.Worlds.Bl;
		if(dir === 'right')	return this.Worlds.Br;

	} else if(type === 'S'){
		if(dir === 'leftright')	return this.Worlds.Sw;
		if(dir === 'left')	return this.Worlds.Sl;
		if(dir === 'right')	return this.Worlds.Sr;

	} 
	return this.Worlds.O;
}
//makes a randomized snake-like path from a block until it get's stuck
World.prototype.findNextRooms = function( rooms, x , y, last, mX, mY){
	var l = false;
	var r = false;
	var u = false;
	var d = false;

	this.numRooms++;
	
	if(x > 0) 		if(rooms[x-1][y] === 0) 				 l = true;
	if(x < (mX -1)) if(rooms[x+1][y] === 0) 				 r = true;
	if(y > 0) 		if(rooms[x][y-1] === 0) 				 u = true;
	if(y < (mY - 1)) if(rooms[x][y+1] === 0 && last != 'up') d = true;
	if(last === 'up' || last === 'S' || last === 'I') 		 u = false;
	
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
	//current shitty - handcrafted level : Automaticly replaced when this.createLevel(); is called
	1 : [
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,6,0,0,0,0,0,0,0,0,0,0,6],
	[0,0,0,0,0,0,6,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,6,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,6,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,6,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,6,0,0,0,0,0,0,6],
	[0,0,0,0,0,0,0,0,0,0,6,6,6,0,0,0,0,0,6],
	[6,6,6,6,6,6,6,6,6,6,6,6,6,6,0,6,6,6,6],
	[6,6,6,6,6,6,6,6,6,6,6,6,6,6,0,6,6,6,6]
	],
	
	//Array of starting rooms
	'Sl' : [
	[
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,6,0,0,0,0,6,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,6,0,0,0,0,0,0,0,0,6,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,'D','D','D','D',0],
	[0,0,0,0,0,0,0,0,0,2,2,0,0,7],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,7],
	[7,0,7,0,0,0,0,0,0,0,0,0,0,7],
	[6,6,6,6,6,6,6,6,6,6,6,6,6,6]
	]
	],
	
	'Sr' : [
	[
	[6,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[6,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[6,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[6,0,0,0,0,0,0,0,0,0,0,'T',0,0],
	[6,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[6,0,0,0,6,0,0,0,0,6,0,0,0,0],
	[6,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[6,0,6,0,0,0,0,0,0,0,0,6,0,0],
	[6,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[6,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[6,5,0,0,0,0,0,0,0,2,2,0,0,0],
	[6,4,0,0,0,0,0,0,0,0,0,0,'D',0],
	[6,4,7,0,0,0,0,0,0,0,0,0,0,7],
	[6,6,6,6,6,6,6,6,6,6,6,6,6,6]
	]
	],
	
	'Sw' : [
	[
	[6,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,6,0,0,0,0,6,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,6,0,0,0,0,0,0,0,0,6,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,2,2,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,'D',0],
	[0,7,7,0,0,0,0,0,0,0,0,0,0,7],
	[6,6,6,6,6,6,6,6,6,6,6,6,6,6]
	]
	],
	
	//Array of Finishing rooms
	'Eu' : [
	[
	[6,0,0,0,0,0,0,0,0,0,0,0,0,7],
	[6,0,0,0,0,0,0,0,0,0,7,7,7,6],
	[6,0,0,0,0,0,7,7,7,6,6,6,6,6],
	[6,0,0,0,0,0,0,0,0,0,7,7,7,7],
	[6,7,0,0,0,0,0,0,0,0,0,0,0,0],
	[6,6,2,7,0,0,0,0,0,0,0,0,0,0],
	[6,6,6,7,7,6,6,6,6,0,0,0,0,7],
	[6,7,7,0,0,0,0,0,0,0,0,0,0,2],
	[6,7,0,0,0,0,0,0,0,0,0,0,0,0],
	[6,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[6,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[6,7,2,0,0,0,0,0,0,0,0,0,0,7],
	[6,7,7,7,0,0,'E',0,0,0,2,7,7,7],
	[6,6,6,6,6,6,6,6,6,6,6,6,6,6]
	]
	],
	
	'Ed' : [
	[
	[6,7,7,0,0,0,0,0,0,0,0,7,0,6],
	[6,7,0,0,0,0,0,0,0,0,0,7,0,7],
	[6,0,0,0,0,0,0,0,0,0,0,0,0,7],
	[6,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[6,0,0,7,0,'E',0,7,0,0,0,0,7,0],
	[6,0,0,0,6,6,6,6,0,0,0,0,0,0],
	[6,7,0,0,7,7,0,0,0,0,0,0,0,6],
	[6,6,0,0,0,0,0,0,0,0,0,0,7,6],
	[6,0,0,0,0,0,0,0,0,0,7,6,6,6],
	[6,7,0,0,0,0,0,0,0,0,0,0,0,0],
	[6,7,7,7,0,0,0,0,0,0,0,0,0,0],
	[6,6,6,6,6,6,0,0,0,0,0,0,7,6],
	[6,6,0,0,0,0,0,0,0,0,0,0,0,0],
	[6,0,0,0,0,0,0,0,6,6,7,0,0,0]
	]
	],
	
	'El' : [
	[
	[7,0,0,0,0,0,0,0,0,0,0,7,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,7,7,0,0,0,0,7,0,0,0,0],
	[0,0,0,7,7,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,7],
	[7,7,0,7,0,0,0,0,0,0,0,0,0,0],
	[7,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,7,7,7,0,0,0,0],
	[0,0,0,0,0,7,6,6,6,2,0,0,0,0],
	[0,0,0,0,7,6,7,0,0,0,0,0,0,0],
	[0,0,0,0,6,7,7,0,0,0,0,0,0,0],
	[0,0,7,6,7,7,7,0,0,0,0,0,0,7],
	[0,0,6,6,7,7,7,0,'E',0,0,7,7,7],
	[6,6,6,6,6,6,6,6,6,6,6,6,6,6]
	]
	],
	
	'Er' : [
	[
	[6,7,0,0,0,0,0,0,0,0,0,0,0,0],
	[6,7,0,0,0,0,0,0,0,0,0,0,0,0],
	[6,7,7,7,0,0,0,0,0,0,0,0,0,0],
	[6,7,0,0,0,0,0,0,7,0,0,0,0,0],
	[6,7,0,0,0,0,0,0,0,0,0,0,0,0],
	[6,7,0,0,2,2,0,0,0,0,0,0,7,0],
	[6,0,0,0,0,0,0,0,0,0,0,7,6,6],
	[6,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[6,0,0,7,0,0,7,0,0,0,2,7,0,0],
	[6,0,0,6,0,0,6,0,0,0,0,0,0,0],
	[6,0,6,0,0,0,0,6,0,0,0,0,0,0],
	[6,0,6,0,0,0,0,6,0,0,0,0,0,0],
	[6,0,6,0,'E',0,6,6,7,7,0,2,0,0],
	[6,6,6,6,6,6,6,6,6,6,6,6,6,6]
	]
	],
	
	//Array of Bonus rooms
	'Bu' : [
	[
	[6,0,0,0,0,0,0,0,0,0,0,0,0,7],
	[6,0,0,0,0,0,0,0,0,0,7,7,7,6],
	[6,0,0,0,0,0,7,7,7,6,6,6,6,6],
	[6,0,0,0,0,0,0,0,0,0,7,7,7,7],
	[6,7,0,0,0,0,0,0,0,0,0,0,0,0],
	[6,6,2,7,0,0,0,0,0,0,0,0,0,0],
	[6,6,6,7,7,6,6,6,6,0,0,0,0,7],
	[6,7,7,0,0,0,0,0,0,0,0,0,0,2],
	[6,7,0,0,0,0,0,0,0,0,0,0,0,0],
	[6,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[6,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[6,7,2,0,0,0,0,0,0,0,0,0,0,7],
	[6,7,7,7,0,0,'T',0,0,0,2,7,7,7],
	[6,6,6,6,6,6,6,6,6,6,6,6,6,6]
	]
	],
	
	'Bd' : [
	[
	[6,7,7,0,0,0,0,0,0,0,0,7,0,6],
	[6,7,0,0,0,0,0,0,0,0,0,7,0,7],
	[6,0,0,0,0,0,0,0,0,0,0,0,0,7],
	[6,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[6,0,0,7,0,'T',0,7,0,0,0,0,7,0],
	[6,0,0,0,6,6,6,6,0,0,0,0,0,0],
	[6,7,0,0,7,7,0,0,0,0,0,0,0,6],
	[6,6,0,0,0,0,0,0,0,0,0,0,7,6],
	[6,0,0,0,0,0,0,0,0,0,7,6,6,6],
	[6,7,0,0,0,0,0,0,0,0,0,0,0,0],
	[6,7,7,7,0,0,0,0,0,0,0,0,0,0],
	[6,6,6,6,6,6,0,0,0,0,0,0,7,6],
	[6,6,0,0,0,0,0,0,0,0,0,0,0,0],
	[6,0,0,0,0,0,0,0,6,6,7,0,0,0]
	]
	],
	
	'Bl' : [
	[
	[7,0,0,0,0,0,0,0,0,0,0,7,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,7,7,0,0,0,0,7,0,0,0,0],
	[0,0,0,7,7,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,7],
	[7,7,0,7,0,0,0,0,0,0,0,0,0,0],
	[7,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,7,7,7,0,0,0,0],
	[0,0,0,0,0,7,6,6,6,2,0,0,0,0],
	[0,0,0,0,7,6,7,0,0,0,0,0,0,0],
	[0,0,0,0,6,7,7,0,0,0,0,0,0,0],
	[0,0,7,6,7,7,7,0,0,0,0,0,0,7],
	[0,0,6,6,7,7,7,0,'T',0,0,7,7,7],
	[6,6,6,6,6,6,6,6,6,6,6,6,6,6]
	]
	],
	
	'Br' : [
	[
	[6,7,0,0,0,0,0,0,0,0,0,0,0,0],
	[6,7,0,0,0,0,0,0,0,0,0,0,0,0],
	[6,7,7,7,0,0,0,0,0,0,0,0,0,0],
	[6,7,0,0,0,0,0,0,7,0,0,0,0,0],
	[6,7,0,0,0,0,0,0,0,0,0,0,0,0],
	[6,7,0,0,2,2,0,0,0,0,0,0,7,0],
	[6,0,0,0,0,0,0,0,0,0,0,7,6,6],
	[6,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[6,0,0,7,0,0,7,0,0,0,2,7,0,0],
	[6,0,0,6,0,0,6,0,0,0,0,0,0,0],
	[6,0,6,0,0,0,0,6,0,0,0,0,0,0],
	[6,0,6,0,0,0,0,6,0,0,0,0,0,0],
	[6,0,6,0,'T',0,6,6,7,7,0,2,0,0],
	[6,6,6,6,6,6,6,6,6,6,6,6,6,6]
	]
	],
	
	//bonus rooms
	'B' : [
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
	
	//Useless unaccessable room. I'll maybe put a carrot in there later
	'O' : [
	[
	[6,6,6,6,0,0,0,0,0,0,0,0,0,0],
	[6,6,6,0,0,0,0,0,0,0,0,0,0,0],
	[6,6,6,0,0,0,0,0,0,6,0,0,0,0],
	[6,6,0,0,0,0,0,0,6,0,0,0,0,0],
	[6,0,0,0,0,0,0,0,6,0,0,0,0,0],
	[6,0,0,0,0,0,0,0,0,6,0,0,0,0],
	[6,0,0,0,0,0,0,6,6,6,0,0,0,0],
	[6,0,0,0,0,0,6,0,0,0,0,0,0,0],
	[6,0,0,6,0,0,0,0,0,0,0,0,0,0],
	[6,0,6,0,0,0,6,0,0,0,0,0,0,0],
	[6,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[6,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[6,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[6,6,6,6,6,6,6,6,6,6,6,6,6,6]
	]
	],
	//An upside down hallway. Currently used sideways for '-'
	'I' : [
	[
	[6,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,6,6,0,0,0,0,0,0,0,0,0,0,0],
	[0,6,0,0,0,0,0,0,0,0,0,0,0,6],
	[0,6,6,0,0,0,0,0,0,0,0,0,7,6],
	[6,7,0,0,0,0,0,0,0,6,7,7,6,6],
	[6,0,0,0,0,0,0,6,6,6,6,6,6,6],
	[6,0,0,0,0,0,0,0,0,0,7,6,7,7],
	[6,0,0,6,6,0,0,0,0,0,0,0,0,7],
	[7,6,0,0,0,0,0,0,0,0,0,0,0,0],
	[7,6,0,0,0,0,7,6,6,6,0,0,0,0],
	[7,7,6,0,0,0,0,7,0,0,0,0,0,0],
	[7,6,6,6,0,0,0,0,0,0,0,0,0,0],
	[6,6,0,0,0,0,0,0,0,0,0,0,0,0],
	[6,0,0,0,0,0,0,0,0,0,0,0,0,0]
	],
	
	[
	[6,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[6,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[6,7,0,0,0,0,0,0,0,0,0,0,0,0],
	[6,7,7,0,0,0,0,0,0,0,7,7,0,0],
	[6,0,7,6,7,0,0,0,7,6,6,0,0,0],
	[7,6,7,7,0,0,0,0,0,0,0,0,0,7],
	[7,6,7,0,0,0,0,0,0,0,0,0,7,7],
	[6,7,0,0,0,0,0,0,6,6,6,6,6,6],
	[6,0,0,0,0,0,0,0,0,7,7,7,6,6],
	[6,0,0,0,7,6,0,0,0,0,0,0,0,7],
	[6,0,0,0,7,0,7,0,0,0,0,0,0,0],
	[6,7,0,0,0,0,0,0,0,0,0,0,0,0],
	[6,6,7,0,0,0,0,0,0,0,0,0,0,0],
	[6,7,7,0,0,0,0,0,0,0,7,7,0,0]
	]
	
	],
	
	//An upside down hallway. Currently used sideways for '-'
	'V' : [
	[
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[7,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,7,7,7,7,7,0,0,0,0],
	[0,0,7,7,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,7,6,0,2,0,0,0,0,0,7,7,7,0],
	[0,7,0,0,0,0,0,0,0,7,7,7,6,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,7,6,0,0,0,0,7,0,0,0,0,0],
	[0,7,6,6,2,2,2,2,0,6,6,0,0,0],
	[6,6,7,7,6,6,6,6,6,7,6,6,6,6]
	],
	
	[
	[0,2,0,0,0,0,0,0,0,0,2,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,7,6,6,6,7,0,0,0,0,0,0,0,0],
	[0,7,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,6,7,0,0,2,0,0,6,6,6,6,6],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,6,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,7,2,0,0,6,6,2,0,2,7,0,0],
	[6,6,6,6,6,6,6,6,6,6,6,6,6,6]
	]
	],
	
	//Hallway with two entrances. currently turned a few times to form "p","q" and "L"
	'J' : [
	[
	[6,6,7,7,0,0,0,0,0,0,0,0,7,6],
	[6,6,7,7,0,0,0,0,0,0,0,0,0,0],
	[6,6,7,0,0,0,0,0,0,0,6,6,0,0],
	[6,7,0,0,0,0,0,0,0,0,0,7,0,0],
	[6,0,0,0,0,0,0,0,0,7,0,0,0,0],
	[0,0,0,0,0,0,0,0,7,6,7,0,0,7],
	[0,0,0,0,0,0,0,6,6,6,7,0,0,0],
	[0,0,0,0,7,0,6,0,0,0,0,0,0,0],
	[0,0,0,6,7,7,0,0,0,0,0,0,0,0],
	[0,0,6,7,0,6,6,0,0,0,0,0,0,0],
	[0,0,0,0,0,7,0,0,0,0,0,0,7,0],
	[0,0,0,0,0,7,0,0,0,0,7,7,6,0],
	[0,2,0,0,0,7,0,0,0,7,7,6,6,0],
	[6,6,6,6,6,6,6,6,6,6,6,6,6,6]
	]
	],
	
	'L' : [
	[
	[6,6,0,0,0,0,0,0,0,0,0,0,7,6],
	[6,7,7,7,6,0,0,0,0,0,0,0,0,6],
	[6,6,7,0,0,0,0,0,0,0,7,0,0,0],
	[6,6,0,0,0,0,0,0,0,7,7,6,0,0],
	[6,0,0,0,0,0,0,0,0,0,2,0,0,0],
	[6,0,0,6,0,0,0,0,6,6,0,0,0,0],
	[6,0,0,6,7,0,0,0,0,0,0,0,0,2],
	[6,0,7,0,0,0,0,0,0,0,0,0,0,0],
	[6,0,0,0,2,0,0,0,0,0,0,0,0,0],
	[6,7,0,0,6,6,6,7,7,0,0,0,0,0],
	[6,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[6,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[6,0,0,0,0,0,0,2,0,0,0,0,0,7],
	[6,6,6,6,6,6,6,6,6,6,6,6,6,6]
	]
	],
	
	'p' : [
	[
	[6,6,6,6,0,0,0,0,0,0,0,0,0,0],
	[6,6,6,7,7,0,0,0,0,0,0,0,0,0],
	[6,6,6,7,0,0,0,0,0,0,0,0,0,0],
	[6,6,7,0,0,0,0,0,0,0,0,0,0,0],
	[6,7,0,0,0,0,0,0,0,0,0,6,7,0],
	[6,7,0,0,0,0,0,7,0,0,0,0,0,0],
	[6,0,0,0,0,0,7,2,7,0,0,0,0,0],
	[6,0,0,0,0,0,0,7,0,0,0,0,0,0],
	[6,0,7,6,0,0,0,0,0,0,0,0,0,0],
	[6,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[6,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[6,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[6,0,0,0,0,0,0,6,6,0,0,0,0,0],
	[6,0,0,0,0,0,0,0,0,0,0,0,0,6]
	]
	],
	
	'q' : [
	[
	[6,6,2,7,7,7,0,0,0,0,0,0,0,0],
	[6,6,6,7,2,0,0,0,0,0,0,0,0,7],
	[0,6,6,7,0,0,0,0,0,0,0,0,7,6],
	[0,0,6,7,0,0,0,0,0,0,0,0,6,7],
	[0,0,0,0,0,0,0,7,7,7,0,0,0,0],
	[0,0,0,0,0,6,0,0,0,0,0,0,0,0],
	[0,0,0,0,7,6,0,0,0,0,0,0,0,6],
	[0,0,0,0,7,0,0,0,0,0,7,6,6,6],
	[0,0,0,7,6,0,0,0,0,7,6,0,0,0],
	[0,0,6,7,6,6,6,0,0,0,0,0,7,0],
	[0,0,6,6,0,0,0,0,0,0,0,0,0,0],
	[0,0,6,0,0,0,0,0,0,0,0,7,0,0],
	[0,6,6,0,2,0,0,0,0,7,7,6,6,6],
	[6,6,0,0,0,0,0,0,0,6,0,0,0,6]
	]
	],
	
	//Hallway with three entrances. currently turned a few times to form "R","W" and "K"
	
	'T' : [
	[
	[6,6,6,6,7,0,0,7,0,0,0,6,7,6],
	[6,6,6,7,0,0,0,0,0,6,0,7,7,7],
	[0,6,6,0,0,0,0,0,0,0,0,0,0,0],
	[0,6,7,0,0,0,0,0,0,0,0,0,0,0],
	[0,7,0,0,0,0,0,0,0,0,7,0,0,0],
	[0,0,0,0,0,0,0,0,0,7,7,7,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,7,0,0,0,0,0,0],
	[0,0,0,0,0,0,6,0,0,0,0,0,0,0],
	[0,0,0,7,7,6,0,6,6,0,0,0,0,0],
	[0,0,0,0,7,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,6],
	[6,0,0,0,0,0,0,0,0,0,0,0,6,6]
	]
	],
	
	'R' : [
	[
	[6,6,7,0,0,0,0,0,0,0,0,6,6,6],
	[6,6,6,7,0,0,0,0,0,0,0,0,0,7],
	[6,6,6,7,0,0,0,0,0,7,7,0,0,7],
	[7,6,7,0,0,0,0,7,6,6,6,6,0,0],
	[7,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,7,6,6,0,0,0,0,0,0,0,7],
	[0,0,0,0,0,0,0,0,0,0,6,6,6,7],
	[0,7,0,0,0,0,0,0,0,0,7,7,7,6],
	[0,0,0,0,0,0,7,0,0,0,0,7,7,0],
	[0,0,0,7,6,6,6,6,6,0,0,0,7,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,7,0],
	[0,7,0,0,0,0,0,0,0,0,0,0,0,0],
	[6,7,0,0,0,0,0,0,0,0,0,6,6,6]
	]
	],
	
	'W' : [
	[
	[6,6,6,6,0,0,0,0,0,0,0,0,7,6],
	[6,6,6,6,6,6,0,0,0,0,0,0,0,6],
	[7,6,6,7,7,0,0,0,0,0,7,0,0,6],
	[0,7,7,0,0,0,0,0,7,7,7,7,0,6],
	[0,0,0,0,0,0,0,6,6,6,6,6,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,7,7,7,0,0,0,0,0,0,0,7],
	[0,0,0,0,6,6,6,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,7,7,0,0,0,0],
	[0,0,7,0,0,0,0,7,6,6,6,0,0,0],
	[0,7,6,6,6,6,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[7,0,0,0,0,0,7,0,0,7,7,0,0,0],
	[6,6,6,6,6,6,6,6,6,6,6,6,6,6]
	]
	],
	
	'K' : [
	[
	[6,7,0,0,0,0,7,0,0,0,0,0,0,6],
	[6,7,7,0,0,0,0,0,0,0,0,0,6,6],
	[6,6,7,0,0,0,0,0,0,0,7,6,6,6],
	[6,6,6,6,0,0,0,0,0,0,0,0,0,0],
	[6,6,6,7,0,0,0,7,0,0,0,0,0,0],
	[6,6,7,0,0,0,6,6,6,6,0,0,0,0],
	[6,7,7,0,0,0,0,0,0,0,0,0,0,0],
	[6,7,0,0,0,0,0,0,0,0,0,0,6,6],
	[6,0,6,6,0,0,0,0,0,0,0,0,0,0],
	[6,0,0,0,0,0,0,7,7,0,0,0,0,0],
	[6,7,0,0,0,7,6,6,6,6,0,0,0,0],
	[6,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[6,0,0,0,0,0,0,0,0,0,0,0,7,6],
	[6,0,7,6,6,0,0,0,0,0,0,7,6,6]
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
			newGrid[i][13-j] = grid[13-j][i];
		}
	}
	numb--;
	return this.rotateGrid(newGrid, numb);
};

World.prototype.printMap = function(){
	util.printTwoDimentionalArray(this.map);
};	