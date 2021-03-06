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
    this._categories = [this._world, this._objects, this._particles,  this._collisionBlocks,
						this._bullets, this._enemies, this._character, this._viewBox, this._audioBox];
},

resetAll : function () {
	console.log("not implemented yet");
},

init: function() {
	
    this.generatePlayer({});
	this._audioBox = []
},

enterLevel: function(lvl) {
    
	util.resetSpatialManager();
	
    this._bullets = [];
    this._enemies = [];
    this._objects = [];
	this._particles = [];
    this._world = [];
	this._viewBox = [];
    this._collisionBlocks = [];
	//this._audioBox = [];

    

    //lvl++;

	if(this._viewBox.length === 0) this.generateViewBox();
	if(this._audioBox.length === 0) this.generateAudioBox();
	
    this._level = lvl;
	if(this._level === 1){
		this._character[0].checkForUpgrades()
		if(checkForUps("headStart")) this._level += 2;
		if(checkForUps("headStart2")) this._level += 2;
	}
	var x = Math.floor(2 + 0.5*lvl);
	var y = Math.floor(2 + 0.3*lvl);
	this.generateLevel({x: x, y: y});
	
	if(this._character.length === 0) this.generateCharacter({cx : 10, cy: 10 });
    this._character[0].reset();
	this._viewBox[0].reset();
	
	
    this.deferredSetup();
},

fireBullet: function(cx, cy, velX, velY, radius, rotation, shooter, type, lifespan) {
    this._bullets.push(new Projectile({
        cx   : cx,
        cy   : cy,
        velX : velX,
        velY : velY,
		type : type,
		radius : radius,
        rotation : rotation,
        shooter : shooter,
		lifeSpan: lifespan
    }));
},

spawnKFC: function(cx, cy, heal) {
    this._bullets.push(new loot({
        cx   : cx,
        cy   : cy,
		type : 1,
		power: 8
    }));
},

spawnGold: function(cx, cy, gold) {
    this._bullets.push(new loot({
        cx   : cx,
        cy   : cy,
		type : 2,
		power: gold
    }));
},

generateParticle : function(x,y,radius,angle,avgVel,type, shouldFade){
	//var r = Math.random()*maxR;
	var vel = avgVel + (0.5*avgVel - Math.random()*avgVel); // +- 50% velocity from avgVel
	//var alpha = Math.random()*maxAlpha;
	var particle = new Particle({
		cx: x,
		cy: y,
		r: radius,
		angle: angle,
		vel: vel,
		alpha: 1,
		type: type,
		fade: shouldFade
	});
    this._particles.push(particle);
},

giveMePlayer : function(descr) {
    return this._character[0];
},

generatePlayer : function(descr) {
    this._character.push(new Player(descr));
},

generateDog : function(descr) {
    this._enemies.push(new Dog(descr));
},

generateBat : function(descr) {
    this._enemies.push(new Bat(descr));
},

generateRanger : function(descr) {
    this._enemies.push(new ranger(descr));
},

generateLevel : function(descr) {
    this._world.push(new World(descr));
	this._world[0].update();
},

generateObject : function(descr) {
    this._objects.push(new Object(descr));
},

generateViewBox : function(descr) {
    this._viewBox.push(new viewBox(descr));
},

generateAudioBox : function(descr) {
    this._audioBox.push(new audioBox(descr));
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

