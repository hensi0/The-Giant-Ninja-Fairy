// =========
// MARIO
// =========
/*

TO-DO:

Þessi texti sem verður hérna í staðin fyrir þennan shitty To-do lista 
og lýsir leiknum okkar copyright claims, authors,  og allt þannig stuff...

Spurning um að útbúa level clasa sem entity manangerinn getur notað til að 
einfallda að hafa mörg level sem entity manangerinn getur haldið utanum...

þessi kóði hér gerir ráð fyrir falli "resetAll" í entityManager má skoða / breyta

Á eftir að fylla innní föll + bæta við í  Block.js / Character.js og Projectile.js

Bæta við link á sprites hér neðst í þessu skjali, útskýrt nánar þar..

Velja okkur gluggastærð. getum stillt það  í globals.js

er með hér inná öll helper functions frá Pat til að passa uppá compatability við ykkar dót
*/

"use strict";

/* jshint browser: true, devel: true, globalstrict: true */

var g_canvas = document.getElementById("myCanvas");
var g_ctx = g_canvas.getContext("2d");

/*
0        1         2         3         4         5         6         7         8
12345678901234567890123456789012345678901234567890123456789012345678901234567890
*/


// ===============
// CREATE INITIAL 
// ===============

function createInitialStuff() {

	//Sniðugt að búa til alla units í Levelinu hér og svoleiðis til 
	// allt sé loadað áðurenn hann byrjar render/update
	//AKA það er betra að hafa þetta sem part af "loading" frekar en 
	//byrjunar laggi
}

// =============
// GATHER INPUTS
// =============

function gatherInputs() {
    // Nothing to do here!
    // The event handlers do everything we need for now.
}


// =================
// UPDATE SIMULATION
// =================


// GAME-SPECIFIC UPDATE LOGIC

function updateSimulation(du) {
    
    processDiagnostics();
    
	
	
	if(entityManager._level != 1) entityManager.enterLevel(1);
    entityManager.update(du);

}

// GAME-SPECIFIC DIAGNOSTICS

var g_allowMixedActions = true;
var g_renderSpatialDebug = false;
var g_viewPort = {x:0, y:0};
var g_isMuted = false;

var KEY_MUTE   = keyCode('M');
var KEY_MIXED   = keyCode('M');
var KEY_SPATIAL = keyCode('X');

var KEY_RESET = keyCode('R');

// hér má bæta við lykklum fyrir tests ásamt falli fyrir neðan 
// í Diagnostics svosem "spawna óvin"

function processDiagnostics() {

    if (eatKey(KEY_MIXED))
        g_allowMixedActions = !g_allowMixedActions;

    if (eatKey(KEY_SPATIAL)) 
		g_renderSpatialDebug = !g_renderSpatialDebug;

    if (eatKey(KEY_RESET)) entityManager.resetAll();
}


// =================
// RENDER SIMULATION
// =================

// GAME-SPECIFIC RENDERING

function renderSimulation(ctx) {
	ctx.save();
	
        var dx = g_viewPort.x;
        var dy = g_viewPort.y;
    
    var lvlLength;        
	lvlLength = entityManager._world[0].blocks[13].length*(g_canvas.height/14) - g_canvas.width;
	
    //current background for the game. To be replaced with multi-layered background later
	g_sprites.skybox.drawCentredAt( ctx, g_canvas.width/2, g_canvas.height/2, 0 );
	 
	ctx.translate(-dx,-dy);
    entityManager.render(ctx);
	
	entityManager.render(ctx);
            
	if (g_renderSpatialDebug) spatialManager.render(ctx);
    
	ctx.restore();
}


// =============
// PRELOAD STUFF
// =============

var g_images = {};

function requestPreloads() {

    var requiredImages = {
        marioTest: 	"res/images/mario.png",
		skyBox: 	"res/images/skybox.png",
		bricks: 	"res/images/dungeonBrick.png",
		//tilesets
		//mud-tileset
		dirtM1:		"res/images/blocks/Dirtblock.png",
		dirtMT:		"res/images/blocks/Grass1Flat.png",
		dirtMTL:	"res/images/blocks/EdgeblockLeft.png",
		dirtMTR:	"res/images/blocks/EdgeblockRight.png",
		
		//Player-Sprites
		druidI:		"res/images/druidStanding.png",
		goatI:		"res/images/goatStanding.png"
    };

    imagesPreload(requiredImages, g_images, preloadDone);
}

var g_sprites = {};
var g_animations = {};

function makePlayerAnimationGoat(scale) {
    var Player = {};
	//image, frameY, frameWidth, frameHeight, numFrames, interval, scale
    Player.idleRight = new Animation(g_images.goatI,0,32,96,1,400, scale);
	Player.idleLeft  = new Animation(g_images.goatI,0,32,96,1,400, -scale);
/*    bowser.idleLeft = new Animation(g_images.bowserSpriteSheet,0,200,200,3,400,-scale);
    bowser.attackRight = new Animation(g_images.bowserSpriteSheet,200,199,200,5,150,scale);
    bowser.attackLeft = new Animation(g_images.bowserSpriteSheet,200,199,200,5,150,-scale);
	bowser.takeDamageRight = new Animation(g_images.bowserSpriteSheet,400,200,200,4,150,scale);
    bowser.takeDamageLeft = new Animation(g_images.bowserSpriteSheet,400,200,200,4,150,-scale);
    bowser.dieRight = new Animation(g_images.bowserSpriteSheet,600,200,200,4,350,scale);
    bowser.dieLeft = new Animation(g_images.bowserSpriteSheet,600,200,200,4,350,-scale);
*/
    return Player;
};
function makePlayerAnimationDruid(scale) {
    var Player = {};
	
	//image, frameY, frameWidth, frameHeight, numFrames, interval, scale
    Player.idleRight = new Animation(g_images.druidI,0,24,64,1,400, scale);
	Player.idleLeft  = new Animation(g_images.druidI,0,16,64,1,400, -scale);
	
    return Player;
};
function makePlayerAnimationFairy(scale) {
    var Player = {};
	
	//image, frameY, frameWidth, frameHeight, numFrames, interval, scale
    Player.idleRight = new Animation(g_images.bricks,0,32,32,1,400, scale);
	Player.idleLeft  = new Animation(g_images.bricks,0,32,32,1,400, -scale);

    return Player;
};

function preloadDone() {

    g_sprites.marioTest  = new Sprite(g_images.marioTest),
	g_sprites.bricks  = new Sprite(g_images.bricks),
	g_sprites.skybox  = new Sprite(g_images.skyBox),
	
	//tileset-mud
	g_sprites.dirtM1  = new Sprite(g_images.dirtM1),
	g_sprites.dirtMT  = new Sprite(g_images.dirtMT),
	g_sprites.dirtMTL  = new Sprite(g_images.dirtMTL),
	g_sprites.dirtMTR  = new Sprite(g_images.dirtMTR);

    entityManager.init();

    main.init();
}

// Kick it off
requestPreloads();