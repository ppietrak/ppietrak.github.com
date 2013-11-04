function SmMediaObject( manifest, ismUrl ) {
    this.manifest = manifest;
    this.ismUrl = ismUrl;
    
    this.streams = this.manifest.getElementsByTagName('StreamIndex');
    this.audioStreams = [];
    this.videoStreams = [];

    for(var i=0; i<this.streams.length;i++){
        if (this.streams[i].hasAttribute('Type')===true) {
		    if (this.streams[i].getAttribute('Type')=='video') {
		        this.videoStreams.push(this.streams[i]);
		    }
		    if (this.streams[i].getAttribute('Type')=='audio') {
		        this.audioStreams.push(this.streams[i]);
		    }
        }
    }

    this.numberOfVideoFragments = this.videoStreams[0].getElementsByTagName('c').length; 

}

SmMediaObject.prototype.selectStream = function( videoIndex, videoQualityIndex, audioIndex, audioQualityIndex )
{
    this.currentVideoXMLNode = this.videoStreams[videoIndex];
    this.currentAudioXMLNode = this.audioStreams[videoIndex];

    this.currentVideoQualityXMLNode = this.currentVideoXMLNode.getElementsByTagName('QualityLevel')[videoQualityIndex];
    this.currentAudioQualityXMLNode = this.currentAudioXMLNode.getElementsByTagName('QualityLevel')[audioQualityIndex];

    this.currentVideoIndex = videoIndex;
    this.currentAudioIndex = audioIndex;
    this.currentVideoQualityIndex = videoQualityIndex;
    this.currentAudioQualityIndex = audioQualityIndex;
    this.currentVideoBitrate = parseInt(this.currentVideoQualityXMLNode.getAttribute('Bitrate'));
    this.lastSequenceNumber = 0;
}

SmMediaObject.prototype.getVideoQualities = function(videoStreamNumber) 
{
    var res = [];
    var t = this.videoStreams[videoStreamNumber].getElementsByTagName('QualityLevel')
    var i;
    for (i=0;i<t.length;i++)
    { 
        res.push(parseInt(t[i].getAttribute('Bitrate')));
    }
    return res;
}


SmMediaObject.prototype.getVideoFragmentStartTime = function( fragmentNumber )
{
    var i;
    var startPos = 0;
    for (i=0;i<fragmentNumber;i++) {
        startPos+=parseInt(this.currentVideoXMLNode.getElementsByTagName('c')[i].getAttribute('d'));
    }
    return startPos;
}

SmMediaObject.prototype.getFragmentForTime = function( timeInSec )
{
    var i;
    var startPos = 0;
    for (i=0;i<this.numberOfVideoFragments;i++) 
    {
        var endPos=startPos+parseInt(this.currentVideoXMLNode.getElementsByTagName('c')[i].getAttribute('d'));
        if ((startPos/13500000.0<timeInSec) && (timeInSec<endPos/13500000.0)) 
        {
            return i;
        }
        startPos = endPos;
    }
    return null;    
}

SmMediaObject.prototype.loadFragment = function( fragmentNumber, callback )
{
    var startPos = this.getVideoFragmentStartTime( fragmentNumber );

    //console.log('LOADING FRAGMENT '+fragmentNumber+' START POSITION='+startPos);

    var xhr = new XMLHttpRequest();
      xhr.open('GET', this.ismUrl+'/QualityLevels('+this.currentVideoBitrate+')/Fragments(video='+startPos+')', true);
	  
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
        smMedia.convertFragment( f, fragmentNumber );
	    var lp = new LengthCounterBoxFieldsProcessor(f);
	    f._processFields(lp);
	    var buf = new Uint8Array(lp.res);          
		var sp = new SerializationBoxFieldsProcessor(f, buf, 0);
	    f._processFields(sp);
        callback( fragmentNumber, buf, f );
	  };
}


SmMediaObject.prototype.convertFragment = function( fragment, fragmentNumber )
{
	var moov = new MovieBox();
	moov.boxes = new Array();
	var mvhd = new MovieHeaderBox();
	mvhd.creation_time = 0;
	mvhd.duration = 0;
	mvhd.flags = 0;
	
	var matrix = new Array(); //unity matrix
	matrix[0] = 0x00010000;
	matrix[1] = 0x0;
	matrix[2] = 0x0;
	matrix[3] = 0x0;
	matrix[4] = 0x00010000;
	matrix[5] = 0x0;
	matrix[6] = 0x0;
	matrix[7] = 0x0;
	matrix[8] = 0x40000000;
	mvhd.matrix = matrix;

	mvhd.modification_time = 0;
	mvhd.next_track_ID = 2;					//pierwsze wolne ID
	mvhd.rate = 0x00010000;					//typically 1.0
	mvhd.volume = 0x0100;					//typically, full volume
	mvhd.timescale = 1000;
	mvhd.version = 0;
	var reserved = new Array();
	reserved[0] = 0x0;
	reserved[1] = 0x0;
	mvhd.reserved = reserved;

	var pre_defined = new Array();
	pre_defined[0] = 0x0;
	pre_defined[1] = 0x0;
	pre_defined[2] = 0x0;
	pre_defined[3] = 0x0;
	pre_defined[4] = 0x0;
	pre_defined[5] = 0x0;
	mvhd.pre_defined = pre_defined;
	moov.boxes.push(mvhd);

	var iods = new Box();					//brak definicji box u Przemka
//	moov.boxes[1] = iods;	

	var mvex = new MovieExtendsBox();
	mvex.boxes = new Array();
	var mehd = new MovieExtendsHeaderBox(); //may be omited in live streams
	mehd.fragment_duration = 2000; 
	mehd.version = 0;
	mehd.flags = 0; 					//brak w ISO
	mvex.boxes.push(mehd);
	var trex = new TrackExtendsBox();
	trex.track_ID = 1; //to samo co w Movie Box
	trex.default_sample_description_index = 1;	//?	
    trex.default_sample_duration = 562491;  // 1/24 przy timescale 13000000, default dla smoothstreamingu
	trex.default_sample_flags = 65536;			//?
	trex.default_sample_size = 0;			//?
	mvex.boxes.push(trex);
    //moov.boxes.push(tmpunknown);
	moov.boxes.push(mvex);

	var trak = new TrackBox();
	trak.boxes = new Array();
	var tkhd = new TrackHeaderBox();
	tkhd.flags = 15;				//czemu 15?
	tkhd.creation_time = 0;
	tkhd.modification_time = 0;
	tkhd.track_id = 1;				//nie może być 0
	tkhd.duration = 0;				//?
	tkhd.alternate_group = 0;
	tkhd.volume = 0;				//0x0100 if track_is_audio else 0
	tkhd.layer = 0;
	tkhd.reserved = 0;
	tkhd.version = 0;
	tkhd.height = 37748736;				//??
	tkhd.width = 67108864;				//??
	tkhd.matrix = matrix;
	trak.boxes.push(tkhd);

	var mdia = new MediaBox();
	mdia.boxes = new Array();
	var mdhd = new MediaHeaderBox();
	mdhd.creation_time = 0;
	mdhd.duration = 0;
	mdhd.pad = 0;					//u Przemka flags?
	mdhd.language = 21956;				// ISO-639-2/T language code
	mdhd.modification_time = 0;
	mdhd.timescale = 13500000;   // wydaje się ze smoothstreaming z zalozenia taki timescale uzywa
    

	mdhd.version = 0;
	mdhd.pre_defined = 0;
	mdia.boxes.push(mdhd);
	var hdlr = new HandlerBox();
	hdlr.handler_type = 1986618469;			//?
	hdlr.name = "VideoHandler"
	hdlr.pre_defined = 0;
	hdlr.flags = 0;					//brak w ISO
	hdlr.version = 0;
	hdlr.reserved = new Array();
	hdlr.reserved[0] = 0;
	hdlr.reserved[1] = 0;
	hdlr.reserved[2] = 0;
	mdia.boxes.push(hdlr);
	
	var minf = new MediaInformationBox();
	minf.boxes = new Array();
	var vmhd = new VideoMediaHeaderBox();
	vmhd.graphicsmode = 0;
	vmhd.opcolor = new Array();
	vmhd.opcolor[0] = 0;			
	vmhd.opcolor[1] = 0;	
	vmhd.opcolor[2] = 0;	
    vmhd.flags = 1; 
	minf.boxes.push(vmhd);

	var dinf = new DataInformationBox();
	dinf.boxes = new Array();
	var dref = new DataReferenceBox();
	dref.entry_count = 1;
	dref.flags = 0;					//brak w ISO
	dref.boxes = new Array();
	dref.version = 0;
	url = new DataEntryUrlBox();
	url.location = "";				//?
	dref.boxes.push(url);
	dinf.boxes.push(dref);
	minf.boxes.push(dinf);
	

	var stbl = new SampleTableBox();
	stbl.boxes = new Array();
	var stsd = new SampleDescriptionBox();		//tu będzie AVC1
	var avc1 = new AVC1VisualSampleEntryBox();
	avc1.boxes = new Array();
	avc1.data_reference_index = 1;
	avc1.compressorname = "";
	avc1.depth = 24;
	avc1.reserved = new Array();
	avc1.reserved[0] = 0;
	avc1.reserved[1] = 0;
	avc1.reserved[2] = 0;
	avc1.reserved[3] = 0;
	avc1.reserved[4] = 0;
	avc1.reserved[5] = 0;
	avc1.reserved_2 = 0;
	avc1.reserved_3 = 0;
	avc1.pre_defined = 0;
	avc1.pre_defined_2 = new Array();
	avc1.pre_defined_2[0] = 0;
	avc1.pre_defined_2[1] = 0;
	avc1.pre_defined_2[2] = 0;
	avc1.pre_defined_3 = 65535;
	avc1.frame_count = 1;
	//avc1.height = 576;
	//avc1.width = 720;
	avc1.horizresolution = 0x00480000;
	avc1.vertresolution = 0x00480000;
	/*var pasp = new PixelAspectRatioBox();
	pasp.hSpacing = 64;				//??
	pasp.vSpacing = 45;				//??
	avc1.boxes.push(pasp);*/
	var avcC = new AVCConfigurationBox();
	avcC.configurationVersion = 1;
    avcC.lengthSizeMinusOne = 3;
	//avcC.AVCProfileIndication = 66;						
	//avcC.profile_compatibility = 128;						
	//avcC.AVCLevelIndication = 30;							
	avcC.reserved = 0x3F;
	avcC.SPS_NAL=new Array();
	avcC.PPS_NAL=new Array();
	var quality = this.currentVideoQualityIndex;	//która jakość z manifest

	var NALDatabuffer = new Uint8Array(0);			 		//brakujące NAL, które dopisywane są do mdat
	for (var i=0;i<this.manifest.getElementsByTagName('QualityLevel').length;i++)
	{

		if (this.manifest.getElementsByTagName('QualityLevel')[i].hasAttribute("Index")&&this.manifest.getElementsByTagName('QualityLevel')[i].getAttribute("Index")==quality)
		{
			avc1.height = parseInt(this.manifest.getElementsByTagName('QualityLevel')[i].getAttribute("MaxHeight"));
			avc1.width = parseInt(this.manifest.getElementsByTagName('QualityLevel')[i].getAttribute("MaxWidth"));
			var codecPrivateData = this.manifest.getElementsByTagName('QualityLevel')[i].getAttribute("CodecPrivateData");
			var NALArray = codecPrivateData.split("00000001");
			NALArray.splice(0,1);			//usunięcie pierwszego, pustego elementu tablicy
			for (var j=0;j<NALArray.length;j++)
			{
				var regexp7 = new RegExp("^[A-Z0-9]7", "gi");			//SPS
				var regexp8 = new RegExp("^[A-Z0-9]8", "gi");			//PPS
				var SPS_index = 0;
				var PPS_index = 0;
                   		var NALBuffer = _hexstringtoBuffer(NALArray[j]);
				if (NALArray[j].match(regexp7)) {
					avcC.SPS_NAL[SPS_index++] = { "NAL_length":NALBuffer.length, "NAL":NALBuffer };
					avcC.AVCProfileIndication = parseInt(NALArray[j].substr(2,2),16);
					avcC.profile_compatibility = parseInt(NALArray[j].substr(4,2),16);
					avcC.AVCLevelIndication = parseInt(NALArray[j].substr(6,2),16);
					

				}
				if (NALArray[j].match(regexp8)) {
					avcC.PPS_NAL[PPS_index++] =  { "NAL_length":NALBuffer.length, "NAL":NALBuffer };

					
				}
				var tempBuffer = new Uint8Array(NALBuffer.length+4);
				tempBuffer[3] = NALBuffer.length;
				tempBuffer.set(NALBuffer,4);

				NALDatabuffer = _mergeArrays(NALDatabuffer,tempBuffer);
			}
			avcC.numOfSequenceParameterSets = SPS_index;
			avcC.numOfPictureParameterSets = PPS_index;
		}
	}

	avc1.boxes.push(avcC);													//odkomentować
	stsd.boxes = new Array();
	stsd.boxes.push(avc1);
	stbl.boxes.push(stsd);
	var stts = new TimeToSampleBox();
	stts.entry_count = 0;
	stts.version = 0;
	stts.flags = 0;					//brak w ISO
	stts.entry = new Array();
	stbl.boxes.push(stts);
	var stsc = new SampleToChunkBox();
	stsc.entry_count = 0;
	stsc.version = 0;
	stsc.entry = new Array();
	stbl.boxes.push(stsc);
	var stsz = new SampleSizeBox();				//??
	stsz.flags = 0;						//??
	stsz.sample_count = 0;					//??
	stsz.sample_size = 0;					//??
	stsz.version = 0;					//??
	stbl.boxes.push(stsz);
	var stco = new ChunkOffsetBox();
	stco.entry_count = 0;
	stco.version = 0;
	stco.flags = 0;					//brak w ISO
	stco.chunk_offset = new Array();
	stbl.boxes.push(stco);
	minf.boxes.push(stbl);
	mdia.boxes.push(minf);

	trak.boxes.push(mdia);

	moov.boxes.push(trak);
    //moov.boxes.push(tmpunknown);

	var udta = new UserDataBox();
	udta.boxes = new Array();
	var meta = new MetaBox();
	meta.flags = 0;					//brak w ISO
	meta.version = 0;
	meta.boxes = new Array();
	var hdlr = new HandlerBox();
	hdlr.flags = 0;					//brak w ISO
	hdlr.handler_type = 1835297138;			//??
	hdlr.name = "";					//human-readable name for the track
	hdlr.pre_defined = 0;
	hdlr.version = 0;
	hdlr.reserved = new Array();
	hdlr.reserved[0] = 1634758764;			//w ISO jest 0
	hdlr.reserved[1] = 0;
	hdlr.reserved[2] = 0;
	meta.boxes.push(hdlr);
	var ilst = new Box();				//brak definicji box u Przemka
	meta.boxes.push(ilst);
	udta.boxes.push(meta);


    //CRACK
    /*tkhd.height = 47185920;
    tkhd.modification_time = -829434254;
    tkhd.width = 83886080;*/
    

    var my_moof = fragment.boxes[0];
    var my_mfhd = my_moof.boxes[0];
    var my_tfhd = my_moof.boxes[1].boxes[0];
    var my_trun = my_moof.boxes[1].boxes[1];
    var my_mdat = fragment.boxes[1];
    
   
    var mdat_size_change = 0;
    if (fragmentNumber == 0)
    {
       mdat_size_change = NALDatabuffer.length;
       my_mdat.data = _mergeArrays(NALDatabuffer,my_mdat.data); //uzupełnienie mdat o NALe
    }


    var moof = new MovieFragmentBox();
    moof.boxes = new Array();
    moof.boxes.push(my_mfhd);
    var traf = new TrackFragmentBox();
    moof.boxes.push(traf);
    traf.boxes = new Array();
    traf.boxes.push(my_tfhd);
    var tfdt = new TrackFragmentBaseMediaDecodeTimeBox();
    currentDecodeTime = this.getVideoFragmentStartTime( fragmentNumber );
    tfdt.baseMediaDecodeTime = currentDecodeTime;
    //console.log("BASE MEDIA DECODE TIME = "+currentDecodeTime);
    var i;
    for (i=0;i<my_trun.samples_table.length;i++)
    {
        if ('sample_duration' in my_trun.samples_table[i])
            currentDecodeTime = currentDecodeTime+my_trun.samples_table[i].sample_duration;
    } 

//200000015*fragmentNumber;
    //mdhd.timescale*fragmentNumber*2
    traf.boxes.push(tfdt);
    traf.boxes.push(my_trun);    
    fragment.boxes[0] = moof;

    my_mfhd.sequence_number = 1+fragmentNumber;
    my_tfhd.track_ID = 1;


    var ftyp = new FileTypeBox();
    ftyp.major_brand = 1769172789;
    ftyp.minor_brand = 1;
    ftyp.compatible_brands = new Array();
    ftyp.compatible_brands[0] = 1635148593;
    ftyp.compatible_brands[1] = 1769172789;
    ftyp.compatible_brands[2] = 1684108136;

    if (fragmentNumber==0) 
    {
        fragment.boxes.splice(0,0,moov); //V1   
        fragment.boxes.splice(0,0,ftyp);
    }

   




    // update size of the first sample

    my_trun.samples_table[0].sample_size = my_trun.samples_table[0].sample_size+mdat_size_change;


    /*
    Kilka zabaw z flagami, które chyba nie do końca sa potrzebne a które tez nie do końca rozumiem bo nie mam speca
    // gasimy flage first-sample-flags-present i usuwamy first sample flag

    my_trun.first_sample_flags = 0;
    my_trun.flags = my_trun.flags | (0x4);

    if ('default_sample_flags' in my_tfhd)
    {
        delete my_tfhd.default_sample_flags;
        my_tfhd.flags = my_tfhd.flags & (~0x20);    
    }
    */

    // remove sample duration (why is it incorrect? maybe invalid duration-related setup in moov?)
   /* var i;
    for (i=0;i<my_trun.samples_table.length;i++)
    {
        if ('sample_duration' in my_trun.samples_table[i])
            delete my_trun.samples_table[i].sample_duration;
    }
    my_trun.flags = my_trun.flags & (~0x100); // sample-duration-present
*/
   
    // Set up data_offset in trun.
    // We need to recount moof size, as the data offset is relative to moof start position
    // Assumption: moof directly precedes the relevant mdat

    var lcp = new LengthCounterBoxFieldsProcessor(moof);
    moof._processFields(lcp);

    my_tfhd.flags = my_tfhd.flags | 0x020000; // default-base-is-moof   // pierwszy segment działa i bez tego, pytanie jak nastepne
    my_trun.data_offset = lcp.res+8;          // +8 because of mdat fields: size(4 bytes) boxtype (4 bytes)

}



function _hexstringtoBuffer(a) {
    res = new Uint8Array(a.length/2);
    var i;
    for (i=0;i<a.length/2;i++)
        res[i] = parseInt( ""+a[i*2]+a[i*2+1], 16)
    return res;
}

function _mergeArrays(oldBuffer,newPart) {
    res = new Uint8Array(oldBuffer.length+newPart.length);
    res.set(oldBuffer,0);
    res.set(newPart,oldBuffer.length);
    return res;
}

