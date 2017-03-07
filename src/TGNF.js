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

var g_menu = new Menu();

function updateSimulation(du) {
    
    processDiagnostics();
    
	
	
	if(entityManager._level === 0) entityManager.enterLevel(1);
    if(g_MenuScreenOn) g_menu.update(du);
	else entityManager.update(du);

}

// GAME-SPECIFIC DIAGNOSTICS

var g_allowMixedActions = true;
var g_renderSpatialDebug = false;
var g_viewPort = {x:0, y:0};
var g_isMuted = false;
var g_MenuScreenOn = true;

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
	
	if(!g_MenuScreenOn){
			var dx = g_viewPort.x;
			var dy = g_viewPort.y;
		
		
		//current background for the game. To be replaced with multi-layered background later
		ctx.fillStyle = "black";	
		ctx.fillRect(0,0,g_canvas.width,g_canvas.height);
		ctx.fillStyle = "red";	
		
		var scale = g_CameraZoom;
		ctx.scale(scale, scale);
		ctx.translate(((1 - scale)/scale)*0.5*g_canvas.width, ((1 - scale)/scale)*0.5*g_canvas.height);
		
		ctx.translate(-dx,-dy);
		
		//here we handle the zoom
		
		
		
		entityManager.render(ctx);
		
		if (!g_renderSpatialDebug){
			ctx.translate(dx,dy);
			ctx.scale(1/scale, 1/scale);
			var Sx = g_canvas.width/2 -(1-g_CameraZoom)*g_canvas.width*0.5; 
			var Sy = g_canvas.height/2 -(1-g_CameraZoom)*g_canvas.height*0.5; 
			util.drawHUD(ctx, Sx, Sy)
		
		} else  spatialManager.render(ctx);
		
	} else g_menu.render(ctx);
		
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
		wall:		"res/images/blocks/wall.png",
		loot:		"res/images/blocks/chest.png",
		blocks:		"res/images/blocks/blocks.png",
		
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
		
		FoW: 		"res/images/FoW.png",
		
		//Menu images
		menu1:			"res/images/menu/title.png",
		menuMain:		"res/images/menu/main.png",
		menuTree:		"res/images/menu/titleTree.png",
		HUD:			"res/images/menu/HUD.png",
		TreeIcons:		"res/images/menu/TreeIcons.png",
		charIcons:		"res/images/menu/charIcons.png",

		
		
		//enemy-sprites:
		dawg: 			   "res/images/dawg.png",
		princeSpriteSheet: "res/images/patss.png"
		
    };

    imagesPreload(requiredImages, g_images, imagePreloadDone);
}

var g_sprites = {};
var g_animations = {};
var g_audio = {};
var backgroundMusic;
var backgroundMusic2;

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
	Player.dyinRight  = new Animation(g_images.druid,0,70,140,2,200, scale);
	Player.dyinLeft   = new Animation(g_images.druid,0,70,140,2,200, scale);
	Player.deadRight  = new Animation(g_images.druid,0,80,140,1,350, scale, 210);
	Player.deadLeft   = new Animation(g_images.druid,0,80,140,1,350, scale, 210);
	
	
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
	Player.spawningRight = new Animation(g_images.pixie,474,72,82,4,70, scale, 216);
	Player.spawningLeft  = new Animation(g_images.pixie,474,72,82,4,70, -scale, 216);
	
    return Player;
};

function makeDogAnimation(scale) {
    var Dog = {};
	
	//image, frameX, frameY, frameWidth, frameHeight, numFrames, interval, scale
    Dog.walkingRight = new Animation(g_images.dawg,0,88,55,12,200, scale);
	Dog.walkingLeft  = new Animation(g_images.dawg,0,88,55,12,200, -scale);
	Dog.inAirRight = new Animation(g_images.dawg,0,88,55,1,100, scale, 176);
	Dog.inAirLeft  = new Animation(g_images.dawg,0,88,55,1,100, -scale, 176);
	Dog.swimmingRight = new Animation(g_images.bricks,0,32,32,1,400, scale);
	Dog.swimmingLeft  = new Animation(g_images.bricks,0,32,32,1,400, -scale);

    

    return Dog;
};


function makeBatAnimation(scale) {
    var Bat = {};
	
	//image, frameX, frameY, frameWidth, frameHeight, numFrames, interval, scale
    Bat.walkingRight = new Animation(g_images.dawg,454,100,100,8,100, -scale);
	Bat.walkingLeft  = new Animation(g_images.dawg,454,100,100,8,100, scale);
	Bat.inAirRight = new Animation(g_images.dawg,0,88,55,1,100, scale, 176);
	Bat.inAirLeft  = new Animation(g_images.dawg,0,88,55,1,100, -scale, 176);
	Bat.swimmingRight = new Animation(g_images.bricks,0,32,32,1,400, scale);
	Bat.swimmingLeft  = new Animation(g_images.bricks,0,32,32,1,400, -scale);

    

    return Bat;
};

function makeRangerAnimation(scale) {
    var Ranger = {};
	
	//image, frameX, frameY, frameWidth, frameHeight, numFrames, interval, scale
    Ranger.walkingRight = new Animation(g_images.dawg,54,100,100,6,200, scale, 500);
	Ranger.walkingLeft  = new Animation(g_images.dawg,54,100,100,6,200, -scale, 500);
	
	Ranger.feetRight = new Animation(g_images.dawg,154,100,100,5,200, scale);
	Ranger.feetLeft  = new Animation(g_images.dawg,154,100,100,5,200, -scale);
	Ranger.aimingRight = new Animation(g_images.dawg,54,100,100,5,290, scale);
	Ranger.aimingLeft  = new Animation(g_images.dawg,54,100,100,5,290, -scale);
	
	Ranger.inAirRight   = new Animation(g_images.dawg,154,100,100,1,100, scale, 500);
	Ranger.inAirLeft    = new Animation(g_images.dawg,154,100,100,1,100, -scale, 500);
	Ranger.swimmingRight = new Animation(g_images.bricks,0,32,32,1,400, scale);
	Ranger.swimmingLeft  = new Animation(g_images.bricks,0,32,32,1,400, -scale);

    

    return Ranger;
};

function makeBombAnimation(scale) {
    var bomb = {};	
	//image, frameX, frameY, frameWidth, frameHeight, numFrames, interval, scale
    bomb.boom = new Animation(g_images.pixie,434,40,40,8,50, scale);
	bomb.flash = new Animation(g_images.pixie,564,40,40,10,80, scale);
	bomb.arrow1 = new Animation(g_images.dawg,260,100,80,1,2000, scale, 17);
	bomb.arrow2 = new Animation(g_images.dawg,254,100,100,1,500, scale, 100);

    return bomb;
};

function makePortalAnimation(scale) {
    var portal = {};	
	//image, frameX, frameY, frameWidth, frameHeight, numFrames, interval, scale
    portal.portal = new Animation(g_images.blocks,257,62,64,3,150, scale, 64);	

    return portal;
};

function makeBoomerangAnimation(scale) {
    var boomerang = {};	
	//image, frameX, frameY, frameWidth, frameHeight, numFrames, interval, scale
    boomerang.boomerang = new Animation(g_images.druid,993,32,32,29,50, scale);	

    return boomerang;
};

function imagePreloadDone() {
    var requiredAudio = {
        //menusongs
		intro1: "res/sounds/introPart1.ogg",
		intro2: "res/sounds/introPart2.ogg",
		intro3: "res/sounds/introPart3.ogg",
		intro4: "res/sounds/introPart4.ogg",
		
		//in-game-music
		flute: "res/sounds/music/flute.ogg",
		flute2: "res/sounds/music/flute2.ogg",
		klukkuspil: "res/sounds/music/klukkuspil.ogg",
		drums: "res/sounds/music/drums.ogg",
		tribal: "res/sounds/music/tribalDrums.ogg",
		violins: "res/sounds/music/violins.ogg",
		action: "res/sounds/music/actionMelody.ogg",
		ambience: "res/sounds/FX/ambience.ogg",
		
		//SFX
		beinbrotna1:  "res/sounds/FX/beinbrotna1.ogg",
		beinbrotna2: "res/sounds/FX/beinbrotna2.ogg",
		beinbrotna3: "res/sounds/FX/beinbrotna3.ogg",
		blink: "res/sounds/FX/blink1.ogg",
		bomb: "res/sounds/FX/bombs.ogg",
		findStuff: "res/sounds/FX/findStuff.ogg",
		findStuff2: "res/sounds/FX/findStuff2.ogg",
		hurd: "res/sounds/FX/hurdOpnast.ogg",
		jump: "res/sounds/FX/jump.ogg",
		shooting1: "res/sounds/FX/shooting1.ogg",
		shooting2: "res/sounds/FX/shooting2.ogg",
		shooting3: "res/sounds/FX/shooting3.ogg",
		shooting4: "res/sounds/FX/shooting4.ogg",
		shooting5: "res/sounds/FX/shooting5.ogg"
		
		
		//theme1: "res/sounds/part1.wav",
        
    }
    audioPreload(requiredAudio, g_audio, preloadDone);
};

function preloadDone() {

    g_sprites.marioTest  = new Sprite(g_images.marioTest),
	g_sprites.bricks  = new Sprite(g_images.bricks),
	g_sprites.spikes  = new Sprite(g_images.spikes),
	g_sprites.door    = new Sprite(g_images.door),
	g_sprites.wall    = new Sprite(g_images.door),
	g_sprites.loot    = new Sprite(g_images.loot),
	g_sprites.skybox  = new Sprite(g_images.skyBox),

	
	
	//tileset-mud
	g_sprites.dirtM1  = new Sprite(g_images.dirtM1),
	g_sprites.dirtMT  = new Sprite(g_images.dirtMT),
	g_sprites.dirtMTL  = new Sprite(g_images.dirtMTL),
	g_sprites.dirtMTR  = new Sprite(g_images.dirtMTR),
	
	
	//tileset-mud
	g_sprites.menu1  		= new Sprite(g_images.menu1),
	g_sprites.menuMain  	= new Sprite(g_images.menuMain),
	g_sprites.menuTree  	= new Sprite(g_images.menuTree),
	
	//extra cause lazy
	
	g_sprites.HUD 	  = new Sprite(g_images.HUD),
	g_sprites.HUD.drawAt = function(ctx,x,y){
			ctx.drawImage(this.image, 0, 0, 342, 280, x, y, 342*this.scale, 280*this.scale);
		};
	g_sprites.HUD.drawBarsAt = function(ctx,x,y, s, w,h){
			ctx.drawImage(this.image, 0, s, w, h, x, y, w*this.scale, h*this.scale);
		};
		
	g_sprites.charIcons 	= new Sprite(g_images.charIcons),
	g_sprites.charIcons.sx = 0;
	g_sprites.charIcons.drawAt = function(ctx,x,y){
			ctx.drawImage(this.image, this.sx, 0, 96, 96, x, y, 96*this.scale, 96*this.scale);
		};

	
	
	g_sprites.FoW  = new Sprite(g_images.FoW),
	g_sprites.skybox  = new Sprite(g_images.skyBox),
	
	
    entityManager.init();

    main.init();
	
	try {
            g_audio.intro1.addEventListener('timeupdate', function(){
                var buffer = .20
                if(this.currentTime > this.duration - buffer){
                    this.currentTime = 0
                    util.playLoop(g_audio.intro2, 0.5)
                }}, false);
        } catch(err) {}
		
	backgroundMusic = g_audio.intro1;
	backgroundMusic2 = g_audio.intro1;
	backgroundMusic.volume = 0.5;
    util.play(g_audio.intro1);
	
}

// Kick it off
requestPreloads();