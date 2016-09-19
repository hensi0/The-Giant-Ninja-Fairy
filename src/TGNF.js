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
    
    var lvlLength = 666;        
    

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
		bricks: 	"res/images/dungeonBrick.png",
		dirtM1:		"res/images/blocks/Dirtblock.png",
		druidI:		"res/images/druidStanding.png"
    };

    imagesPreload(requiredImages, g_images, preloadDone);
}

var g_sprites = {};
var g_animations = {};

function makePlayerAnimation(scale) {
    var Player = {};
	//image, frameY, frameWidth, frameHeight, numFrames, interval, scale
    Player.idleRight = new Animation(g_images.druidI,0,24,64,1,400,scale);
	Player.idleLeft  = new Animation(g_images.druidI,0,16,64,1,400,-scale);
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

function preloadDone() {

    g_sprites.marioTest  = new Sprite(g_images.marioTest),
	g_sprites.bricks  = new Sprite(g_images.bricks),
	g_sprites.dirtM1  = new Sprite(g_images.dirtM1);

    entityManager.init();

    main.init();
}

// Kick it off
requestPreloads();