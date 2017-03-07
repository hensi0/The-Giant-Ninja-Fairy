function audioBox(descr) {
    for (var property in descr) {
        this[property] = descr[property];
    }
	this.isInitialized = false;
}

audioBox.prototype._tracks = [];
audioBox.prototype._maxVol = 0.5;
    
audioBox.prototype.initialize = function(){
	this._tracks[0] = g_audio.flute;
	this._tracks[1] = g_audio.flute2;
	this._tracks[2] = g_audio.klukkuspil;
	this._tracks[3] = g_audio.drums;
	this._tracks[4] = g_audio.tribal;
	this._tracks[5] = g_audio.violins;
	this._tracks[6] = g_audio.action;
	this._tracks[7] = g_audio.ambience;
	for(var i = 0; i < this._tracks.length; i++)
		this._tracks[i].volume = 0;
	this.play();
	this.isInitialized = true;
};

audioBox.prototype.update = function(du){
	if(!this.isInitialized) this.initialize();
	var P = this.findFittingProfile();
	this.adjustTracks(P);
};

audioBox.prototype.play = function(){
    backgroundMusic.pause();
	backgroundMusic2.pause();
	for(var i = 0; i < this._tracks.length; i++){
		try {
            if(i !== 7) this._tracks[i].addEventListener('timeupdate', function(){
				var buffer = 0.40
                if(this.currentTime > this.duration - buffer){
                    //this.currentTime = 0.1
                    //this.play();
					entityManager._audioBox[0].play();
                }
				}, false);
			this._tracks[i].currentTime = 0.1;
            this._tracks[i].play();
        } catch(err) {}
	}
};

audioBox.prototype.adjustTracks = function(P){
	var p = entityManager._character[0];
	var rateBonus = 0.3 - (0.3*(p.HP / p.maxhp));
	for(var i = 0; i < this._tracks.length; i++){
		this._tracks[i].volume = Math.min(1,Math.max(0,this._tracks[i].volume + 
								0.05*(P[i] - this._tracks[i].volume)));
		if(!entityManager._character[0]._isDeadNow)
			this._tracks[i].playbackRate = 1 + rateBonus;
		else this._tracks[i].playbackRate = 0.8;
	}
};

audioBox.prototype.findFittingProfile = function(){
	if(g_mute) return [0,0,0,0,0,0,0,0];
	var t = this._maxVol - 0.9*(g_CameraZoom - 1.5);
	var profile = [0,t,t,0,0,t,0,0];
	if(entityManager._character[0]) 
		if(entityManager._character[0]._isDeadNow)  
			return profile = [0,0,t,0,0,0,0,0];
	var pForm = entityManager._character[0].form;
	//if(pForm === 'druid') profile[1] = t;
	if(pForm === 'fairy') profile[0] = 0.3  + t;
	if(pForm === 'goat') profile[4] = t;
	var temp = t - Math.min(t,Math.max(0, (t - 0.5) + (g_CameraZoom - 1.5)));
	profile[3] = temp;
	profile[7] = Math.max(0,Math.min(1,2*(this._maxVol - temp)));
	//action-track for boss yet to be implemented here
	
	return profile;
};

audioBox.prototype.render = function(ctx){
	//to be implemented for triggered voice-over events
};
