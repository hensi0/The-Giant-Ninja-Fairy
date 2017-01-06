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
    
	
	
	if(entityManager._level === 0) entityManager.enterLevel(1);
    entityManager.update(du);

}

// GAME-SPECIFIC DIAGNOSTICS

var g_allowMixedActions = true;
var g_renderSpatialDebug = false;
var g_viewPort = {x:0, y:0};
var g_isMuted = false;

var KEY_MUTE   = keyCode('M');
var KEY_SPATIAL = keyCode('X');

var KEY_RESET = keyCode('R');

// hér má bæta við lykklum fyrir tests ásamt falli fyrir neðan 
// í Diagnostics svosem "spawna óvin"

function processDiagnostics() {

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
	lvlLength = entityManager._world[0].blocks[0].length*(g_canvas.height/14) - g_canvas.width;
	
	//current background for the game. To be replaced with multi-layered background later
	ctx.fillStyle = "cyan";	
	ctx.fillRect(0,0,g_canvas.width,g_canvas.height);
	ctx.fillStyle = "red";	
	util.fillCircle(ctx,g_mouseX2,g_mouseY2,8);
	
	var scale = g_CameraZoom;
    ctx.scale(scale, scale);
	ctx.translate(((1 - scale)/scale)*0.5*g_canvas.width, ((1 - scale)/scale)*0.5*g_canvas.height);
	
     
	ctx.translate(-dx,-dy);
    
	//here we handle the zoom
	
    
	
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
		spikes:		"res/images/blocks/spikes.png",
		door:		"res/images/blocks/door.png",
		
		//mud-tileset
		dirtM1:		"res/images/blocks/Dirtblock.png",
		dirtMT:		"res/images/blocks/Grass1Flat.png",
		dirtMTL:	"res/images/blocks/EdgeblockLeft.png",
		dirtMTR:	"res/images/blocks/EdgeblockRight.png",
		
		//Player-Sprites
		druidI:		"res/images/druidStanding.png",
		goatI:		"res/images/goatStanding.png",
		pixie:		"res/images/Pixie.png",
		druid:		"res/images/druid.png",

		//enemie-sprites:
		dawg: 			"res/images/dawg.png",
		princeSpriteSheet: "res/images/patss.png"
		
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
	Player.inAirRight = new Animation(g_images.goatI,0,32,96,1,400, scale);
	Player.inAirLeft  = new Animation(g_images.goatI,0,32,96,1,400, -scale);
	Player.walkingRight = new Animation(g_images.goatI,0,32,96,1,400, scale);
	Player.walkingLeft  = new Animation(g_images.goatI,0,32,96,1,400, -scale);
    Player.spawningRight = new Animation(g_images.pixie,210,72,69,4,80, scale);
	Player.spawningLeft  = new Animation(g_images.pixie,210,72,69,4,80, -scale);
	
	
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
    Player.idleRight = new Animation(g_images.druid,140,72,140,3,350, scale);
	Player.idleLeft  = new Animation(g_images.druid,140,72,140,3,250, -scale);
	Player.walkingRight = new Animation(g_images.druid,418,74,140,8,100, scale);
	Player.walkingLeft  = new Animation(g_images.druid,418,74,140,8,100, -scale);
	Player.dashingRight = new Animation(g_images.druid,300,90,90,11,70, scale);
	Player.dashingLeft  = new Animation(g_images.druid,300,90,90,11,70, -scale);
	Player.inAirRightDown = new Animation(g_images.druid,558,81,140,3,140, scale);
	Player.inAirLeftDown  = new Animation(g_images.druid,558,81,140,3,140, -scale);
	Player.inAirRightUp = new Animation(g_images.druid,838,81,140,2,200, scale);
	Player.inAirLeftUp  = new Animation(g_images.druid,838,81,140,2,200, -scale);
	Player.spawningRight = new Animation(g_images.druid,140,72,140,3,100, scale, 216);
	Player.spawningLeft  = new Animation(g_images.druid,140,72,140,3,100, -scale, 216);
	Player.holdingWallRight = new Animation(g_images.druid,698,81,130,2,150, -scale);
	Player.holdingWallLeft  = new Animation(g_images.druid,698,81,130,2,150, scale);
	Player.holdingWall2Right = new Animation(g_images.druid,698,81,130,2,350, -scale, 162);
	Player.holdingWall2Left  = new Animation(g_images.druid,698,81,130,2,350, scale,  162);
	
	
    return Player;
};

function makePlayerAnimationFairy(scale) {
    var Player = {};
	
	//image, frameY, frameWidth, frameHeight, numFrames, interval, scale
    Player.idleRight = new Animation(g_images.pixie,0,72,69,1,600, scale);
	Player.idleLeft  = new Animation(g_images.pixie,0,72,69,1,600, -scale);
	Player.inAirRight = new Animation(g_images.pixie,140,72,69,6,100, scale);
	Player.inAirLeft  = new Animation(g_images.pixie,140,72,69,6,100, -scale);
	Player.shootingRight = new Animation(g_images.pixie,70,72,69,3,133, scale);
	Player.shootingLeft  = new Animation(g_images.pixie,70,72,69,3,133, -scale);
	Player.walkingRight = new Animation(g_images.pixie,0,72,69,6,100, scale);
	Player.walkingLeft  = new Animation(g_images.pixie,0,72,69,6,100, -scale);
	//Player.spawningRight = new Animation(g_images.pixie,210,72,69,4,80, scale);
	//Player.spawningLeft  = new Animation(g_images.pixie,210,72,69,4,80, -scale);
	Player.spawningRight = new Animation(g_images.pixie,450,72,140,4,70, scale);
	Player.spawningLeft  = new Animation(g_images.pixie,450,72,140,4,70, -scale);
	
    return Player;
};

function makeDogAnimation(scale) {
    var Dog = {};
	
	//image, frameX, frameY, frameWidth, frameHeight, numFrames, interval, scale
    Dog.walkingRight = new Animation(g_images.dawg,0,45,48,4,400, scale);
	Dog.walkingLeft  = new Animation(g_images.dawg,0,45,48,4,400, -scale);
	Dog.inAirRight = new Animation(g_images.dawg,0,45,48,4,100, scale, 245);
	Dog.inAirLeft  = new Animation(g_images.dawg,0,45,48,4,100, -scale, 245);
	Dog.swimmingRight = new Animation(g_images.bricks,0,32,32,1,400, scale);
	Dog.swimmingLeft  = new Animation(g_images.bricks,0,32,32,1,400, -scale);

    

    return Dog;
};

function makeBombAnimation(scale) {
    var bomb = {};	
	//image, frameX, frameY, frameWidth, frameHeight, numFrames, interval, scale
    bomb.boom = new Animation(g_images.pixie,434,40,40,8,50, scale);
	bomb.flash = new Animation(g_images.pixie,474,40,40,10,80, scale);

    return bomb;
};


function makeBoomerangAnimation(scale) {
    var boomerang = {};	
	//image, frameX, frameY, frameWidth, frameHeight, numFrames, interval, scale
    boomerang.boomerang = new Animation(g_images.druid,993,32,32,29,50, scale);	

    return boomerang;
};

function preloadDone() {

    g_sprites.marioTest  = new Sprite(g_images.marioTest),
	g_sprites.bricks  = new Sprite(g_images.bricks),
	g_sprites.spikes  = new Sprite(g_images.spikes),
	g_sprites.door    = new Sprite(g_images.door),
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