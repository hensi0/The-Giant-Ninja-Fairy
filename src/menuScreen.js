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
Menu.prototype.initialized = false;
Menu.prototype.currentScreen = 'startingScreen';
Menu.prototype.buttons = [];
Menu.prototype.skillNodes = [];
Menu.prototype.skillTree;


Menu.prototype.addAButton = function(x,y,r,s) {
	this.buttons.push({x: x, y: y, r: r, string: s});
};


Menu.prototype.update = function(du) {
	if(!this.initialized) this.initialize();
	
	//this.animation.update(du);
	
};

Menu.prototype.buttonScan = function(x,y) {
	for(var i = 0; i < this.buttons.length; i++){
		var dist = Math.sqrt(((x - this.buttons[i].x)*(x - this.buttons[i].x)) +  
							 ((y - this.buttons[i].y)*(y - this.buttons[i].y)));
		if(dist < this.buttons[i].r)
			if(this.buttons[i].node) this.buttonTranslator(this.buttons[i].node);
			else this.buttonTranslator(this.buttons[i].string);

	}
};

Menu.prototype.buttonTranslator = function(s) {
	if(s instanceof Node){ 
		s.tryToBuy(g_gold);
		this.generateTree();
		return;
	}
	if			(s === "play"){
		g_MenuScreenOn = !g_MenuScreenOn;
		stopZeShootin();
	} else if	(s === "tree"){
		this.currentScreen = 'skillTree';
		this.generateTree();
	} else if	(s === "mainMenu"){
		this.buttons = [];
		this.currentScreen = 'mainMenu';
		this.addAButton(0.7*g_canvas.width,150,300, "play");
		this.addAButton(0.3*g_canvas.width,150,300, "tree");
		this.addAButton(0.9*g_canvas.width,0.9*g_canvas.height,50, "settings");
	} else if	(s === "settings"){
		this.buttons = [];
		this.currentScreen = 'settings';
		this.addAButton(0.9*g_canvas.width,0.8*g_canvas.height,60, "mainMenu");
	} 
};

Menu.prototype.mouseAction = function() {
	if(this.currentScreen === 'startingScreen')  {
		this.currentScreen = 'mainMenu';
		this.addAButton(0.7*g_canvas.width,150,300, "play");
		this.addAButton(0.3*g_canvas.width,150,300, "tree");
		this.addAButton(0.9*g_canvas.width,0.9*g_canvas.height,50, "settings");
		return;
	} else if(this.currentScreen === 'mainMenu') 
		this.buttonScan(g_mouseX2, g_mouseY2);
	else if(this.currentScreen === 'skillTree') 
		this.buttonScan(g_mouseX2, g_mouseY2);
	else if(this.currentScreen === 'settings') 
		this.buttonScan(g_mouseX2, g_mouseY2);
};

Menu.prototype.generateTree = function(x,y) {
	this.buttons = [];
	//treeButtons
	this.buttons = this.skillTree.generateButtons(this.buttons);
	this.addAButton(0.9*g_canvas.width,0.8*g_canvas.height,60, "mainMenu");
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
	if (g_renderSpatialDebug) this.renderButtonAreas(ctx);
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
		name: "dashCD2"
	});
	var d34 = new Node({
		name: "dashCD1",
		childNodes: [d44]
	});
	var d43 = new Node({
		name: "dashSpeed",
	});
	var d33 = new Node({
		name: "dashDmg",
		childNodes: [d43]
	});
	var d22 = new Node({
		name: "dashDmg",
		childNodes: [d33,d34]
	});
	var d42 = new Node({
		name: "additionalBoomerang2"
	});
	var d32 = new Node({
		name: "additionalBoomerang",
		childNodes: [d42]
	});
	var d41 = new Node({
		name: "boomerangEtherial",
	});
	var d31 = new Node({
		name: "boomerangSpeed",
		childNodes: [d41]
	});
	var d21 = new Node({
		name: "boomerangDmg",
		childNodes: [d31,d32]
	});
	var d11 = new Node({
		name: "druidMaxJump",
		childNodes: [d31,d32]
	});
	
	//pixie-SkillTree
	var p44 = new Node({
		name: "dashCD2"
	});
	var p34 = new Node({
		name: "dashCD1",
		childNodes: [p44]
	});
	var p43 = new Node({
		name: "dashSpeed",
	});
	var p33 = new Node({
		name: "dashDmg",
		childNodes: [p43]
	});
	var p22 = new Node({
		name: "dashDmg",
		childNodes: [p33,p34]
	});
	var p42 = new Node({
		name: "additionalBoomerang2"
	});
	var p32 = new Node({
		name: "additionalBoomerang",
		childNodes: [p42]
	});
	var p41 = new Node({
		name: "boomerangEtherial",
	});
	var p31 = new Node({
		name: "boomerangSpeed",
		childNodes: [p41]
	});
	var p21 = new Node({
		name: "boomerangDmg",
		childNodes: [p31,p32]
	});
	var p11 = new Node({
		name: "druidMaxJump",
		childNodes: [p31,p32]
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
		name: "dashDmg",
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
		childNodes: [s31,s32]
	});
	
	//utility-SkillTree
	var u44 = new Node({
		name: "dashCD2"
	});
	var u34 = new Node({
		name: "dashCD1",
		childNodes: [u44]
	});
	var u43 = new Node({
		name: "dashSpeed",
	});
	var u33 = new Node({
		name: "dashDmg",
		childNodes: [u43]
	});
	var u22 = new Node({
		name: "dashDmg",
		childNodes: [u33,u34]
	});
	var u42 = new Node({
		name: "additionalBoomerang2"
	});
	var u32 = new Node({
		name: "additionalBoomerang",
		childNodes: [u42]
	});
	var u41 = new Node({
		name: "boomerangEtherial",
	});
	var u31 = new Node({
		name: "boomerangSpeed",
		childNodes: [u41]
	});
	var u21 = new Node({
		name: "boomerangDmg",
		childNodes: [u31,u32]
	});
	var u11 = new Node({
		name: "druidMaxJump",
		childNodes: [u31,u32]
	});
	
	var t01 = new Node({
		y: g_canvas.height*0.7, 
		x: g_canvas.width/2, 
		name: "TreeStem",
		isBought: true,
		childNodes: [d11,p11, s11, u11]
	});
	return t01;
	
};

