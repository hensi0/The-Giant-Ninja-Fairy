/*

spatialManager.js

A module which handles spatial lookup, as required for...
e.g. general collision detection.

*/

"use strict";

/* jshint browser: true, devel: true, globalstrict: true */

/*
0        1         2         3         4         5         6         7         8
12345678901234567890123456789012345678901234567890123456789012345678901234567890
*/

var spatialManager = {

// "PRIVATE" DATA

_nextSpatialID : 1, // make all valid IDs non-falsey (i.e. don't start at 0)

_entities : [],

// "PRIVATE" METHODS
//
// <none yet>


// PUBLIC METHODS

getNewSpatialID : function() {
    // TODO: Horfa á mánudagsfyrirlesturinn hjá Patt og sjá hver er 
	//		optimal leiðinn til að hafa leyst verkefni 9 (semsagt þetta skjal)
	this._nextSpatialID++;
	return this._nextSpatialID - 1;
},

register: function(entity) {
    //var pos = entity.getPos();
    var spatialID = entity.getSpatialID();
	this._entities[spatialID] = entity;
},

unregister: function(entity) {
    var spatialID = entity.getSpatialID();
	this._entities[spatialID] = undefined;
},
 //circular collision detection
findEntityInRange: function(posX, posY, sizeX, sizeY) {
		var posX2,
		posY2,
		sizeX2,
		sizeY2;
	for(var i = 1 ; i < this._entities.length; i++){
		if(this._entities[i]){
			var pos = this._entities[i].getPos();
			posX2 = pos.posX;
			posY2 = pos.posY;
			var size = this._entities[i].getSize();
			sizeX2 = size.sizeX;
			sizeY2 = size.sizeY;
			
			var Xcollision = Math.abs(posX - posX2) - sizeX/2 - sizeX2/2;
			var Ycollision = Math.abs(posY - posY2) - sizeY/2 - sizeY2/2;

			if(Xcollision <= 0 && Ycollision <= 0){ 
			return this._entities[i];
			}
		}	
	}
},

findEntitiesInRange: function(posX, posY, sizeX, sizeY) {
	var posX2,
		posY2,
		sizeX2,
		sizeY2;
	var entities = [];
	for(var i = 1 ; i < this._entities.length; i++){
		if(this._entities[i]){
			var pos = this._entities[i].getPos();
			posX2 = pos.posX;
			posY2 = pos.posY;
			var size = this._entities[i].getSize();
			sizeX2 = size.sizeX;
			sizeY2 = size.sizeY;
			
			var Xcollision = Math.abs(posX - posX2) - sizeX/2 - sizeX2/2;
			var Ycollision = Math.abs(posY - posY2) - sizeY/2 - sizeY2/2;
			
			console.log("yCol: " + Ycollision)
			
			
			if(Xcollision <= 0 && Ycollision <= 0){ 
				entities.push(this._entities[i])
			}
		}	
	}

	return entities;
},

render: function(ctx) {
	ctx.save();
	ctx.beginPath();
	ctx.strokeStyle = "red";
	var posX,posY,sizeX,sizeY;
	for(var i=1; i < this._entities.length; i++){
		if(this._entities[i]){
			var pos = this._entities[i].getPos();
			posX = pos.posX;
			posY = pos.posY;
			var size = this._entities[i].getSize();
			sizeX = size.sizeX;
			sizeY = size.sizeY;
			ctx.rect(posX-sizeX/2,posY-sizeY/2,sizeX,sizeY);
			ctx.stroke();
		}	
	}
	ctx.restore();
	ctx.beginPath();
}
}
