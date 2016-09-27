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
viewBox.prototype.sizeX = 350;
viewBox.prototype.sizeY = 250;
viewBox.prototype.screenX = 0;
viewBox.prototype.screenY = 0;
viewBox.prototype.chasing = true;

    
viewBox.prototype.update = function(du){
	if(!entityManager._character[0]) return;
	var Player = entityManager._character[0];
	
	
	if(Math.abs(this.cx - Player.cx) > this.sizeX/2 || Math.abs(this.cy - Player.cy) > this.sizeY/2)
		this.chasing = true;
	//while player stays within the inner box camera stays still
	if(this.chasing){
		
		//some funky math to get this as smooth as I can think off atm...
		this.xVel -= (this.cx - Player.cx)/1000;
		this.xVel *= 0.5 + 0.48*((Math.abs(this.cx - Player.cx))/(1+ Math.abs(this.cx - Player.cx)));
		
		
		 
			//the boundries are so that the camera doesn't move around to fast,
			//	f.ex. when moveing out of the grace-box
			var temp = 0.05*((this.screenX - Player.cx) + 2.4*(this.cx - Player.cx));
			if(Math.abs(temp)  > 100) this.reset();
			var limit = 5 + 3 *(Math.abs(Player.velX) / (4 + Math.abs(Player.velX))); 
			if(temp > limit) temp = limit;
			if(temp < -limit) temp = -limit;
			this.screenX -=  temp;
			
			
		
		if(Math.abs(this.xVel) < 0.03) this.chasing = false;
		
		this.cx += this.xVel * du;
		
	
		//updates the global wievport camera variables
		var nextViewX = (this.screenX - g_canvas.width/2);
		
		
		var lvlLength = entityManager._world[0].blocks[13].length*(g_canvas.height/14) - g_canvas.width;
		
		if (nextViewX < 0) {
			g_viewPort.x = 0;
		} else if (nextViewX > lvlLength) {
			g_viewPort.x = lvlLength;
		} else {
			g_viewPort.x = nextViewX;
		}
	
		
	
}
	this.yVel -= (this.cy - Player.cy)/1000;
	this.yVel *= 0.5 + 0.48*((Math.abs(this.cy - Player.cy))/(1+ Math.abs(this.cy - Player.cy)));
	
	var temp2 = 0.05*((this.screenY - Player.cy) + 2.4*(this.cy - Player.cy));
	if(Math.abs(temp2)  > 100) this.reset();
	if(temp2 > 3) temp2 = 3;
	if(temp2 < -3) temp2 = -3;
	this.screenY -=  temp2;
	
	this.cy += this.yVel * du;	
	
	var nextViewY = (this.screenY - g_canvas.height/2 + 80);
	var temp3 = entityManager._world[0].returnStartLocation().y - g_canvas.height/2;
	if(nextViewY > temp3) g_viewPort.y = temp3;
	else 	g_viewPort.y = nextViewY;
};

viewBox.prototype.render = function(ctx){
	//renders inner and outer box if you press X, even though outer box might be hard to see 
	if (g_renderSpatialDebug){
	
		ctx.save();
		ctx.beginPath();
		ctx.strokeStyle = "blue";	
		ctx.rect(this.cx-this.sizeX/2,this.cy-this.sizeY/2,this.sizeX,this.sizeY);
		ctx.stroke();
		ctx.beginPath();
		ctx.strokeStyle = "green";	
		ctx.rect(this.screenX - g_canvas.width/2 ,this.cy - g_canvas.height/1.35,g_canvas.width,g_canvas.height);
		ctx.stroke();
		ctx.restore();
		ctx.beginPath();
	}
};

viewBox.prototype.reset = function(){

	var x = entityManager._world[0].returnStartLocation().x;
	var y = entityManager._world[0].returnStartLocation().y;
	this.cx = x;
	this.cy = y;
	this.screenY = y;
	this.screenX = x;
	g_viewPort.y = y;
	g_viewPort.x = x;
};
