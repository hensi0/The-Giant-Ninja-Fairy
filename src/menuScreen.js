// ==========
// Character STUFF
// ==========

"use strict";

/* jshint browser: true, devel: true, globalstrict: true */

/*
0        1         2         3         4         5         6         7         8
12345678901234567890123456789012345678901234567890123456789012345678901234567890
*/

// A generic contructor which accepts an arbitrary descriptor object
function Menu(descr) {
	this.setup(descr)
    // Default sprite, if not otherwise specified
    this._scale = 1;
	this.initialized = false;
};

Menu.prototype = new Enemy();

// Initial, inheritable, default values
Menu.prototype.cx = 0;
Menu.prototype.cy = 0;
Menu.prototype.hoverTimer = 0;
Menu.prototype.textBox = null;
Menu.prototype.initialized = false;
Menu.prototype.currentScreen = 'startingScreen';
Menu.prototype.buttons = [];
Menu.prototype.skillNodes = [];
Menu.prototype.skillTree;


Menu.prototype.addAButton = function(x,y,r,s,d) {
	this.buttons.push({x: x, y: y, r: r, string: s, desc: d});
};


Menu.prototype.update = function(du) {
	if(!this.initialized) this.initialize();
	var oldText = this.textBox;
	this.textBox = null;
	this.buttonScan(g_mouseX2, g_mouseY2, false);
	//this.animation.update(du);
	if(this.textBox === oldText) this.hoverTimer++;
	else this.hoverTimer = 0;
	
};

Menu.prototype.buttonScan = function(x,y, click) {
	for(var i = 0; i < this.buttons.length; i++){
		var dist = Math.sqrt(((x - this.buttons[i].x)*(x - this.buttons[i].x)) +  
							 ((y - this.buttons[i].y)*(y - this.buttons[i].y)));
		if(dist < this.buttons[i].r)
			if(click){
				if(this.buttons[i].node) 	this.buttonTranslator(this.buttons[i].node);
				else 						this.buttonTranslator(this.buttons[i].string);
			} else {
				if(this.buttons[i].node) {
					if(this.buttons[i].node.desc) 
						this.textBox = this.buttons[i].node.desc;
					if(this.buttons[i].node.cost && !this.buttons[i].node.isBought) 
						this.textBox += " (cost: " + this.buttons[i].node.cost + ")"
				} else if(this.buttons[i].desc) this.textBox = this.buttons[i].desc;
			}
	}
};

Menu.prototype.buttonTranslator = function(s) {
	if(s instanceof Node){ 
		g_gold -= s.tryToBuy(g_gold);
		console.log(g_gold);
		this.generateTree();
		return;
	}
	if			(s === "play"){
		g_MenuScreenOn = !g_MenuScreenOn;
		stopZeShootin();
	} else if	(s === "tree"){
		this.currentScreen = 'skillTree';
		this.generateTree();
		util.crossfadeLoop(g_audio.intro2);
	} else if	(s === "mainMenu"){
		this.buttons = [];
		this.currentScreen = 'mainMenu';
		this.addAButton(0.7*g_canvas.width,150,300, "play", "Enter the Castle!");
		this.addAButton(0.3*g_canvas.width,150,300, "tree", "Spend Gold to Gain Strength");
		this.addAButton(0.9*g_canvas.width,0.9*g_canvas.height,50, "settings", "configure stuff");
		util.crossfadeLoop(g_audio.intro3);
	} else if	(s === "settings"){
		this.buttons = [];
		this.currentScreen = 'settings';
		this.addAButton(0.9*g_canvas.width,0.8*g_canvas.height,60, "mainMenu", "Go Back to the Forest");
	} 
};

Menu.prototype.mouseAction = function() {
	if(this.currentScreen === 'startingScreen')  {
		this.buttonTranslator("mainMenu");
	} else if(this.currentScreen === 'mainMenu') 
		this.buttonScan(g_mouseX2, g_mouseY2, true);
	else if(this.currentScreen === 'skillTree') 
		this.buttonScan(g_mouseX2, g_mouseY2, true);
	else if(this.currentScreen === 'settings') 
		this.buttonScan(g_mouseX2, g_mouseY2, true);
};

Menu.prototype.generateTree = function(x,y) {
	this.buttons = [];
	//treeButtons
	this.buttons = this.skillTree.generateButtons(this.buttons);
	this.addAButton(0.9*g_canvas.width,0.8*g_canvas.height,60, "mainMenu", "Go Back to the Forest");
};

Menu.prototype.initialize = function() {
	this.image1 = g_sprites.menu1;
	this.image2 = g_sprites.menuMain;
	this.image3 = g_sprites.menuTree;
	this.skillTree = this.createTree();
	this.skillTree.update();
	this.initialized = true;
};

Menu.prototype.render = function (ctx) {
	if(this.currentScreen === 'startingScreen') this.renderScaler(ctx, this.image1);
	else if(this.currentScreen === 'mainMenu') 	this.renderScaler(ctx, this.image2);
	else if(this.currentScreen === 'skillTree'){
		this.renderScaler(ctx, this.image3);
		this.skillTree.render(ctx);
	}
	ctx.fillStyle = "white";
	ctx.strokeStyle = "red";
	ctx.lineWidth = 4;
	util.fillCircle(ctx, g_mouseX2, g_mouseY2, 5);
	if(this.hoverTimer > 20 && this.textBox != null)
		this.drawInfoBox(ctx);
	if (g_renderSpatialDebug) this.renderButtonAreas(ctx);
};

Menu.prototype.drawInfoBox = function(ctx){
	ctx.fillStyle = "gray";
	ctx.fillRect(g_mouseX2 + 5, g_mouseY2 , this.textBox.length*5.5 , 14);
	ctx.fillStyle = "white";
    ctx.fillText(this.textBox, 10 + g_mouseX2, 10 + g_mouseY2);
};

Menu.prototype.renderButtonAreas = function(ctx){
    for(var i = 0; i < this.buttons.length; i++){
		util.strokeCircle(ctx, this.buttons[i].x, this.buttons[i].y, this.buttons[i].r);
	}
};

Menu.prototype.renderScaler = function (ctx, image) {
	var img_h = image.height;
	var scale = g_canvas.height / img_h;
	image.scale = scale;
	image.drawCentredAt(ctx, g_canvas.width/2, g_canvas.height/2, 0);
};

Menu.prototype.getSize = function(){
    var size = {sizeX:g_canvas.width*this.scale ,sizeY: g_canvas.height*this.scale};
    return size;
};

Menu.prototype.handleSpecificMenuAction = function(du, dir) {
	// To be implemented in subclasses.
	
};


Menu.prototype.createTree = function() {
	//druid-SkillTree
	var d44 = new Node({
		name: "dashCD2",
		desc: "less dash cooldown"
	});
	var d34 = new Node({
		name: "dashCD1",
		childNodes: [d44],
		desc: "less dash cooldown"
	});
	var d43 = new Node({
		name: "dashSpeed",
		desc: "dash is faster"
	});
	var d33 = new Node({
		name: "dashDmg",
		childNodes: [d43],
		desc: "dash deals more damage"
	});
	var d22 = new Node({
		name: "dashDmg",
		childNodes: [d33,d34],
		desc: "dash deals more damage"
	});
	var d42 = new Node({
		name: "additionalBoomerang2",
		desc: "you have an additional boomerang"
	});
	var d32 = new Node({
		name: "additionalBoomerang",
		childNodes: [d42],
		desc: "you have an additional boomerang"
	});
	var d41 = new Node({
		name: "boomerangEtherial",
		desc: "boomerang can pass through walls"
	});
	var d31 = new Node({
		name: "boomerangSpeed",
		childNodes: [d41],
		desc: "boomerang is faster"
	});
	var d21 = new Node({
		name: "boomerangDmg",
		childNodes: [d31,d32],
		desc: "boomerang deals more damage"
	});
	var d11 = new Node({
		name: "druidMaxJump",
		childNodes: [d21,d22],
		desc: "you can jump higher"
	});
	
	//pixie-SkillTree
	var p44 = new Node({
		name: "blinkBombs2",
		desc: "blink shoots even more bombs"
	});
	var p34 = new Node({
		name: "blinkBombs",
		desc: "blink shoots out bombs",
		childNodes: [p44]
	});
	var p43 = new Node({
		name: "blinkCD2",
		desc: "less blink cooldown"
	});
	var p33 = new Node({
		name: "blinkCD",
		desc: "less blink cooldown",
		childNodes: [p43]
	});
	var p22 = new Node({
		name: "blinkRange",
		desc: "increased blink range",
		childNodes: [p33,p34]
	});
	var p42 = new Node({
		name: "BBchance",
		desc: "chance to shoot out a bigger bomb",
	});
	var p32 = new Node({
		name: "bombDamage",
		desc: "bombs deal more damage",
		childNodes: [p42]
	});
	var p41 = new Node({
		name: "BouncyBombs",
		desc: "bombs can bounce off walls",
	});
	var p31 = new Node({
		name: "bombAcc",
		desc: "increased accuracy",
		childNodes: [p41]
	});
	var p21 = new Node({
		name: "bombSpeed",
		desc: "bombs travel faster",
		childNodes: [p31,p32]
	});
	var p11 = new Node({
		name: "LessEnergy",
		desc: "stay longer in fairy form",
		childNodes: [p21,p22]
	});
	
	//Sheepinator-SkillTree
	var s44 = new Node({
		name: "dashCD2"
	});
	var s34 = new Node({
		name: "dashCD1",
		childNodes: [s44]
	});
	var s43 = new Node({
		name: "dashSpeed",
	});
	var s33 = new Node({
		name: "dashDmg2",
		childNodes: [s43]
	});
	var s22 = new Node({
		name: "dashDmg",
		childNodes: [s33,s34]
	});
	var s42 = new Node({
		name: "additionalBoomerang2"
	});
	var s32 = new Node({
		name: "additionalBoomerang",
		childNodes: [s42]
	});
	var s41 = new Node({
		name: "boomerangEtherial",
	});
	var s31 = new Node({
		name: "boomerangSpeed",
		childNodes: [s41]
	});
	var s21 = new Node({
		name: "boomerangDmg",
		childNodes: [s31,s32]
	});
	var s11 = new Node({
		name: "druidMaxJump",
		desc: "Content not yet ready",
		cost: 99999,
		childNodes: [s21,s22]
	});
	
	//utility-SkillTree
	var u44 = new Node({
		name: "moreHP3",
		desc: "a lot more max life"
	});
	var u34 = new Node({
		name: "moreHP2",
		desc: "even more max life",
		childNodes: [u44]
	});
	var u43 = new Node({
		name: "betterPickups",
		desc: "mobs drop better food"
	});
	var u33 = new Node({
		name: "morePickups",
		desc: "mobs drop more food",
		childNodes: [u43]
	});
	var u22 = new Node({
		name: "moreHP",
		desc: "more max life",
		childNodes: [u33,u34]
	});
	var u42 = new Node({
		name: "headStart2",
		desc: "start the dungeon on the 5th level"
	});
	var u32 = new Node({
		name: "headStart",
		desc: "start the dungeon on the 3rd level",
		childNodes: [u42]
	});
	var u41 = new Node({
		name: "megaLoot",
		desc: "chests might contain much better loot"
	});
	var u31 = new Node({
		name: "mobGold",
		desc: "mobs can drop extra gold",
		childNodes: [u41]
	});
	var u21 = new Node({
		name: "visionRange2",
		desc: "you can see even further",
		childNodes: [u31,u32]
	});
	var u11 = new Node({
		name: "visionRange",
		desc: "you can see further",
		childNodes: [u21,u22]
	});
	
	var t01 = new Node({
		y: g_canvas.height*0.63, 
		x: g_canvas.width/2, 
		name: "TreeStem",
		isBought: true,
		childNodes: [d11,p11, s11, u11]
	});
	return t01;
	
};

