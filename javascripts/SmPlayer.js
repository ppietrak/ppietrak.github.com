// Simple Smoothstreaming player
// author: Przemyslaw Pietrak
// (C) 2013 Orange Labs Poland


function SmPlayer( videoElement ) {

    this.progressControllerTimer = null;
    this.smMedia = null;
    this.fragmentLoadedCallback = null;

    this.waitingForFragment = false;
    this.lastFetchedFragmentNumber = -1;

    this.videoElement = videoElement;
    this.mediaSource = 0;
    this.sourceBuffer = 0;

    this.mediaSource = new MediaSource();
    this.videoElement.src = window.URL.createObjectURL(this.mediaSource);
    this.started = false;

	this.mediaSource.addEventListener('webkitsourceended', function(e) {
	  console.log('mediaSource readyState: ' + this.readyState);
	}, false);

    var smPlayer = this;

	this.mediaSource.addEventListener('webkitsourceopen', function(e) 
    {	
        var codecString = 'video/mp4; codecs="avc1.42801e"';
        smPlayer.sourceBuffer = this.addSourceBuffer(codecString);  
        smPlayer._controlProgress();        
	});
}


SmPlayer.prototype.open = function( url, callback )
{
    var xhr = new XMLHttpRequest();
	xhr.open('GET', url+'/manifest', true);
	xhr.send();
    var smPlayer = this;

	xhr.onload = function(e) {
		if (xhr.status != 200) {
            error = "Unexpected status code " + xhr.status + " for " + url;
            return;
		}

        smPlayer.smMedia = new SmMediaObject(xhr.responseXML, url); 

        if (callback)
            callback( smPlayer.smMedia );
	};
}


SmPlayer.prototype.start = function()
{
    this.started = true;
    this._controlProgress();
    var smPlayer = this;
    this.progressControllerTimer = setInterval(function(){smPlayer._controlProgress();},1000);
}


SmPlayer.prototype.stop = function()
{
    if (this.progressControllerTimer!=0)
    {
        clearInterval(progressControllerTimer);
        this.progressControllerTimer = 0;
    }
    this.videoElement.pause();
}


SmPlayer.prototype._controlProgress = function()
{    
    if (!this.started)
        return;

    if (!this.smMedia)
        return;

    if (!this.sourceBuffer)
        return;

    var smPlayer = this;

    //console.log('PROGRESS CHECK:'+this.videoElement.currentTime+' - '+this.videoElement.duration);

    //console.log('IF1:'+((this.lastFetchedFragmentNumber==-1) || (this.videoElement.currentTime+5>this.videoElement.duration)));
    //console.log('IF2:'+(!this.waitingForFragment));
    //console.log('IF3:'+(this.lastFetchedFragmentNumber<this.smMedia.numberOfVideoFragments));
    //console.log(this.lastFetchedFragmentNumber);
    //console.log(this.smMedia.numberOfVideoFragments);

    if (((this.lastFetchedFragmentNumber==-1) || (this.videoElement.currentTime+5>this.videoElement.duration))
        && (!this.waitingForFragment) 
        && (this.lastFetchedFragmentNumber<this.smMedia.numberOfVideoFragments))
    {
        console.log('smPlayer: Less than 5 seconds left, fetching next fragments');
        this.waitingForFragment = true;
        this.smMedia.loadFragment( this.lastFetchedFragmentNumber+1, function( number, buf, f ) { smPlayer._fragmentLoaded( number, buf, f); } );                
    }
}


SmPlayer.prototype._fragmentLoaded = function( number, buf, f )
{
    console.log('smPlayer: fragment number '+number+' loaded');
    this.sourceBuffer.append(buf);    
    this.lastFetchedFragmentNumber = number;
    this.waitingForFragment = false;
    if (this.fragmentLoadedCallback)
        this.fragmentLoadedCallback( number );
    this._controlProgress();
}



