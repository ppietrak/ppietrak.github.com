// Simple Smoothstreaming player
// author: Przemyslaw Pietrak
// (C) 2013 Orange Labs Poland

// if logger not defined, fallback to console logging
if (typeof log===undefined) 
{
    log = function( msg ) { console.log( msg ); }
    log_indent = function( lev, msg ) { console.log( msg ); }
}


// ------------------------------------------------------------------------------------

function SmMediaObject() {
    this.currentVideoStreamIndex = 0;
    this.currentVideoQualityIndex = 0;
    this.currentAudioStreamIndex = 0;
    this.currentAutioQualityIndex = 0;
    this.manifest = null;
}


SmMediaObject.prototype.open = function( url )
{
	var xhr = new XMLHttpRequest();
	xhr.open('GET', url, true);
	xhr.send();
    var smMedia = this;

	xhr.onload = function(e) {
		if (xhr.status != 200) {
            error = "Unexpected status code " + xhr.status + " for " + url;
			if (smMedia.onerror)
                smMedia.onerror(error);
            else 
                alert(error);
            return;
		}

		smMedia.manifest = xhr.responseXML;

        console.log(smMedia);
        console.log(this);
        smMedia.selectStream(0,0,0,0);       
		if (smMedia.onload) {
           smMedia.onload();
        };
        smMedia.loadFragment();
	};

    // by default, first audio/video streams are selected, with the first quality levels


}

SmMediaObject.prototype.selectStream = function( videoIndex, videoQualityIndex, audioIndex, audioQualityIndex )
{
    // retrieve manifest information
    
    var streams = this.manifest.getElementsByTagName('StreamIndex');
    var audioStreams = [];
    var videoStreams = [];

    for(var i=0; i<streams.length;i++){
        if (streams[i].hasAttribute('Type')===true) {
		    if (streams[i].getAttribute('Type')=='video') {
		        videoStreams.push(streams[i]);
		    }
		    if (streams[i].getAttribute('Type')=='audio') {
		        audioStreams.push(streams[i]);
		    }
        }
    }

    this.currentVideoXMLNode = videoStreams[videoIndex];
    this.currentAudioXMLNode = audioStreams[videoIndex];

    this.currentVideoQualityXMLNode = this.currentVideoXMLNode.getElementsByTagName('QualityLevel')[videoQualityIndex];
    this.currentAudioQualityXMLNode = this.currentAudioXMLNode.getElementsByTagName('QualityLevel')[audioQualityIndex];

    this.currentVideoIndex = videoIndex;
    this.currentAudioIndex = audioIndex;
    this.currentVideoQualityIndex = videoQualityIndex;
    this.currentAudioQualityIndex = audioQualityIndex;

    console.log("-------------------------VideoStreamXMLNode:");
    console.log(this.currentVideoXMLNode);
    console.log("-------------------------AudioStreamXMLNode:");
    console.log(this.currentAudioXMLNode);
    console.log("-------------------------VideoQualityXMLNode:");
    console.log(this.currentVideoQualityXMLNode);
    console.log("-------------------------AudioQualityXMLNode:");
    console.log(this.currentAudioQualityXMLNode);
}




SmMediaObject.prototype.getNextFragment = function()
{
   // need to create moov and moof

}

SmMediaObject.prototype.loadFragment = function()
{
    var xhr = new XMLHttpRequest();
	  xhr.open('GET', '/images/zplatformy-clean.mp4', true);
	  xhr.responseType = 'arraybuffer';
	  xhr.send();
      var smMedia = this;

	  xhr.onload = function(e) {
		if (xhr.status != 200) {
		  alert("Unexpected status code " + xhr.status + " for " + url);
		  return false;
		}
        var f = new File();
		u = new Uint8Array(xhr.response);		
        f = new File();
        p = new DeserializationBoxFieldsProcessor(f,u,0,u.length);
	    f._processFields(p);
        smMedia.fragment = f;
        smMedia.play()	
	  };
}

SmMediaObject.prototype.play = function()
{
	// TUTAJ DO DOPISANIA 
 
	console.log('\n\n\nJestem funkcja do dopisania');
	console.log('mam manifest:');
	console.log(this.manifest);
	console.log('oraz sparsowany plik z platformy:');
	console.log(this.fragment);
	var moov = new MovieBox();
	console.log('ale moov na razie wyglada slabo, trzeba go uzupełnić:');
    console.log(moov);
}









