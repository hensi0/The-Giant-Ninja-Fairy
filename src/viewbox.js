function viewBox(descr) {
    for (var property in descr) {
        this[property] = descr[property];
    }
}

viewBox.prototype.cx = 0;
viewBox.prototype.scale = 1;
viewBox.prototype.cy = 400;
viewBox.prototype.xVel = 0;
viewBox.prototype.yVel = 0;
viewBox.prototype.sizeX = 150;
viewBox.prototype.sizeY = 10;
viewBox.prototype.screenX = 0;
viewBox.prototype.screenY = 0;
viewBox.prototype.chasingX = true;
viewBox.prototype.chasingY = true;

    
viewBox.prototype.update = function(du){
	if(!entityManager._character[0]) return;
	var Player = entityManager._character[0];
	/*
	if(Player.velX === 0 && Player.velY === 0)
		this.adjustZoom('in');
	else 
		this.adjustZoom('out');
	/*
	if(Math.abs(this.cx - Player.cx) > this.sizeX/2)
		this.chasingX = true;
	if(Math.abs(this.cy - Player.cy) > this.sizeY/2)
		this.chasingY = true;
	//while player stays within the inner box camera stays still
//	if(this.chasingX){
		
		//some funky math to get this as smooth as I can think off atm...
		this.xVel -= (this.cx - Player.cx)/1000;
		this.xVel *= 0.5 + 0.48*((Math.abs(this.cx - Player.cx))/(1+ Math.abs(this.cx - Player.cx)));
		
			//the boundries are so that the camera doesn't move around to fast,
			//	f.ex. when moveing out of the grace-box
			var temp = 0.05*((this.screenX - Player.cx) + 2.4*(this.cx - Player.cx) + (g_mouseX - g_canvas.width/2));
			if(Math.abs(temp)  > 100) this.reset();
			var limit = 5 + 3 *(Math.abs(Player.velX) / (4 + Math.abs(Player.velX))); 
			if(temp > limit) temp = limit;
			if(temp < -limit) temp = -limit;
			this.screenX -=  temp;
			
		if(Math.abs(this.xVel) < 0.03) this.chasingX = false;

		this.cx += this.xVel * du;	
//	}
	
	//updates the global wievport camera variables
	var nextViewX = (this.screenX - g_canvas.width/2);	
	var lvlLength = entityManager._world[0].blocks[13].length*(g_canvas.height/14) - g_canvas.width;
	
	if (nextViewX < (1 - g_CameraZoom)*(0.5*g_canvas.width)) {
		g_viewPort.x = (1 - g_CameraZoom)*(0.5*g_canvas.width);
	} else if (nextViewX > lvlLength - (1 - g_CameraZoom)*(0.5*g_canvas.width)) {
		g_viewPort.x = lvlLength - (1 - g_CameraZoom)*(0.5*g_canvas.width);
	} else {
		g_viewPort.x = nextViewX;
	}
	
//	if(this.chasingY){
		this.yVel -= (this.cy - Player.cy)/1000;
		this.yVel *= 0.5 + 0.48*((Math.abs(this.cy - Player.cy))/(1+ Math.abs(this.cy - Player.cy)));
		
		var temp2 = 0.05*((this.screenY - Player.cy) + 2.4*(this.cy - Player.cy));
		var limit = 4 + 3 *(Math.abs(Player.velY) / (4 + Math.abs(Player.velY))); 
		if(Math.abs(temp2)  > 100) this.reset();
		if(temp2 > limit) temp2 = limit;
		if(temp2 < -limit) temp2 = -limit;
		this.screenY -=  temp2;
		
		if(Math.abs(this.xVel) < 0.03) this.chasingY = false;	
		
		this.cy += this.yVel * du;	
//	}
		var nextViewY = (this.screenY - g_canvas.height/2);
		var temp3 = entityManager._world[0].returnStartLocation().y - g_canvas.height/2;
		var lowerEdge = temp3 - (1 - g_CameraZoom)*(g_canvas.height)
		if (nextViewY < -(1 - g_CameraZoom)*(0.5*g_canvas.height))
			g_viewPort.y = -(1 - g_CameraZoom)*(0.5*g_canvas.height);
		else if(nextViewY > lowerEdge) g_viewPort.y = lowerEdge;
		else 	g_viewPort.y = nextViewY;
	*/
	
	
	var tempX = Player.cx - g_canvas.width/2;
	var tempY = Player.cy - g_canvas.height/2;
	
	tempX += 0.3*(g_mouseX2 - g_canvas.width/2);
	tempY += 0.5*(g_mouseY2 - g_canvas.height/2);
	
	//barriers to be implemented here so player is never off-screen  (safety measure)
	var limitL = Player.cx - 0.25*g_canvas.width;
	var limitR = Player.cx - 0.75*g_canvas.width;
	var limitU = Player.cy - 0.75*g_canvas.height;
	var limitD = Player.cy - 0.25*g_canvas.height;
	
	//console.log(Math.round(limitL) + " " + Math.round(tempX) + " " + 
	//			Math.round(limitR) + Math.round(0.3*(g_mouseX - g_canvas.width/2)));
	
	if(tempX > limitL) tempX = limitL;
	if(tempX < limitR) tempX = limitR;
	if(tempY < limitU) tempY = limitU;
	if(tempY > limitD) tempY = limitD;
	
	g_viewPort.x = tempX;
	g_viewPort.y = tempY;
	
};

viewBox.prototype.render = function(ctx){
	//renders inner and outer box if you press X, even though outer box might be hard to see 
	if (g_renderSpatialDebug){
	
		ctx.save();
		ctx.beginPath();
		ctx.strokeStyle = "blue";	
		ctx.rect(this.cx-this.sizeX/2,this.cy-this.sizeY/2,this.sizeX,this.sizeY);
		ctx.stroke();
		/*
		ctx.beginPath();
		ctx.strokeStyle = "green";	
		ctx.rect(this.screenX - g_canvas.width/2 ,this.cy - g_canvas.height/1.35,g_canvas.width,g_canvas.height);
		ctx.stroke();
		*/
		ctx.restore();
		ctx.beginPath();
		
	}
};

viewBox.prototype.adjustZoom = function(outOrIn){
	//adjusts the zoom depending if you are moveing or not
	var vel = 0
	if(outOrIn === 'out'){
		vel = 0.015*(g_CameraZoom - 1);
		if(vel > 0.001) vel = 0.001;
		g_CameraZoom -= vel; 
	} else if (outOrIn === 'in'){
		vel = 0.005*(1.4 - g_CameraZoom);
		if(vel > 0.0005) vel = 0.0005;
		g_CameraZoom += vel;
	}
};

viewBox.prototype.reset = function(){

	var x = entityManager._character[0].cx;
	var y = entityManager._character[0].cy;
	this.cx = x;
	this.cy = y;
	this.screenY = y;
	this.screenX = x;
	g_viewPort.y = y;
	g_viewPort.x = x;
};
