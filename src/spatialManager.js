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
findEntityInRange: function(posX, posY, radius) {
	var posX2,
		posY2,
		radius2;
	for(var i = 1 ; i < this._entities.length; i++){
		if(this._entities[i]){
			var pos = this._entities[i].getPos();
			posX2 = pos.posX;
			posY2 = pos.posY;
			radius2 = this._entities[i].getRadius();
			var distSq = util.wrappedDistSq(
            posX, posY, 
            posX2, posY2,
            g_canvas.width, g_canvas.height);

			if(util.square(radius + radius2) >= distSq){ 
			return this._entities[i];
			}
		}	
	}
},

render: function(ctx) {
    var oldStyle = ctx.strokeStyle;
    ctx.strokeStyle = "red";
    
    for (var ID in this._entities) {
        var e = this._entities[ID];
        util.strokeCircle(ctx, e.posX, e.posY, e.radius);
    }
    ctx.strokeStyle = oldStyle;
}

}