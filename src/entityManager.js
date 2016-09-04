/*

entityManager.js

A module which handles arbitrary entity-management for "Asteroids"


We create this module as a single global object, and initialise it
with suitable 'data' and 'methods'.

"Private" properties are denoted by an underscore prefix convention.

*/


"use strict";


// Tell jslint not to complain about my use of underscore prefixes (nomen),
// my flattening of some indentation (white), or my use of incr/decr ops 
// (plusplus).
//
/*jslint nomen: true, white: true, plusplus: true*/


var entityManager = {

// "PRIVATE" DATA

_character   : [],
_bullets : [],
_particles : [],
_world: [],
_collisionBlocks : [],
_enemies   : [],
_objects    : [],
_level : 0,

// "PRIVATE" METHODS

_forEachOf: function(aCategory, fn) {
    for (var i = 0; i < aCategory.length; ++i) {
        fn.call(aCategory[i]);
    }
},

// PUBLIC METHODS

// A special return value, used by other objects,
// to request the blessed release of death!
//
KILL_ME_NOW : -1,

// Some things must be deferred until after initial construction
// i.e. thing which need `this` to be defined.
//
deferredSetup : function () {
    this._categories = [this._objects, this._character, this._world, this._collisionBlocks,
						this._bullets, this._particles, this._enemies];
},



init: function() {
	
    this.generatePlayer({});
},

enterLevel: function(lvl) {
    
	util.resetSpatialManager();
	
    this._bullets = [];
    this._enemies = [];
    this._objects = [];
    this._world = [];
    this._collisionBlocks = [];

    

if(this._character.length === 0) this.generateCharacter({cx : 10, cy: 10 });
    this._character[0].reset();

    this._level = lvl;
	this.generateLevel({level: this._level});
	
	console.log(this._level + " asd");
	
    this.deferredSetup();
},

fireBullet: function(cx, cy, velX, velY, rotation) {
    this._bullets.push(new Bullet({
        cx   : cx,
        cy   : cy,
        velX : velX,
        velY : velY,

        rotation : rotation
    }));
},

generateParticle : function(x,y,angle,avgVel,maxAlpha,maxR,fillStyle){
	var r = Math.random()*maxR;
	var vel = avgVel + (0.5*avgVel - Math.random()*avgVel); // +- 50% velocity from avgVel
	var alpha = Math.random()*maxAlpha;
	var particle = new Particle({
		cx: x,
		cy: y,
		r: r,
		angle: angle,
		vel: vel,
		style: fillStyle,
		alpha: alpha
	});
    this._particles.push(particle);
},

giveMePlayer : function(descr) {
    return this._character[0];
},

generatePlayer : function(descr) {
    this._character.push(new Player(descr));
},

generateEnemy : function(descr) {
    this._enemies.push(new Enemy(descr));
},

generateLevel : function(descr) {
    this._world.push(new World(descr));
},

generateObject : function(descr) {
    this._objects.push(new Object(descr));
},

// entities and centres have same dimensions, max 2
setBoxCentres: function(entities, centres) {
    for(var i=0; i<entities.length; i++){
        for(var j=0; j<entities[i].length; j++){
            if(entities[i][j]){
                entities[i][j].cx = centres[i][j][0];
                entities[i][j].cy = centres[i][j][1];
                entities[i][j].halfWidth = this._world[0].blockDim;
                entities[i][j].halfHeight = this._world[0].blockDim;
            }
        }
    }
},


// entities and centres have same dimensions, max 2
setDims: function(entities, dims) {
    for(var i=0; i<entities.length; i++){
        for(var j=0; j<entities[i].length; j++){
            if(entities[i][j]){
                entities[i][j].cx = centres[i][j][0];
                entities[i][j].cy = centres[i][j][1];
            }
        }
    }
},


update: function(du) {

    for (var c = 0; c < this._categories.length; ++c) {

        var aCategory = this._categories[c];
        var i = 0;

        while (i < aCategory.length) {

            var status = aCategory[i].update(du);

            if (status === this.KILL_ME_NOW) {
                // remove the dead guy, and shuffle the others down to
                // prevent a confusing gap from appearing in the array
                aCategory.splice(i,1);
            }
            else {
                ++i;
            }
        }
    }
},

render: function(ctx) {
    var debugX = 10, debugY = 100;

    for (var c = 0; c < this._categories.length; ++c) {

        var aCategory = this._categories[c];

        for (var i = 0; i < aCategory.length; ++i) {
            aCategory[i].render(ctx);
        }
        debugY += 10;
    }
}

}

// Some deferred setup which needs the object to have been created first
entityManager.deferredSetup();

