// Simple Mp4 box-level manipulation library
// author: Przemyslaw Pietrak
// (C) 2013 Orange Labs Poland


// constants 

var CONTAINERS = ["moov","udta","ilst","trak","mdia","minf","moof","traf","dinf"]

var DEFINITIONS = {
"dinf":{ name:"data information box, container" },
"dref":{ name:"data reference box, declares source(s) of media data in track" },
"ftyp":{ name:"file type and compatibility" },
"free":{ name:"free space" },
"hdlr":{ name:"handler, declares the media (handler) type" },
"mvhd":{ name:"Movie Header" },
"iods":{ name:"Object Descriptor container box" },
"mdat":{ name:"media data container" },
"mdia":{ name:"media, container for the media information in a track" },
"mdhd":{ name:"media header, overall information about media" },
"minf":{ name:"media information container" },
"mehd":{ name:"media extends header box" },
"meta":{ name:"metadata container" },
"moof":{ name:"movie fragment" },
"moov":{ name:"container for all the meta-data" },
"mvex":{ name:"movie extends box" },
"mvhd":{ mame:"movie header, overall declarations" },
"mfhd":{ name:"movie fragment header" },
"mfra":{ name:"movie fragment random access" },
"mfro":{ name:"movie fragment random access offset" },
"sidx":{ name:"segment index box" },
"stbl":{ name:"sample table box, container for the time/space map" },
"tkhd":{ name:"track header" },
"trak":{ name:"track" },
"traf":{ name:"track fragment" },
"tfhd":{ name:"track fragment header" },
"tfdt":{ name:"track fragment base media decode time" },
"trun":{ name:"track fragment run" },
"udta":{ name:"user data" },
"vmhd":{ name:"video media header" },
}



// --------------------------------------------------------------
// Helper functions.
//
// This lib uses uint8array as the type for all data buffers
// A set of functions is provided to deal with buffer reads, writes and data conversion

// if logger not defined, fallback to console logging

if (typeof log===undefined) 
{
    log = function( msg ) { console.log( msg ); }
    log_indent = function( lev, msg ) { console.log( msg ); }
}

// remove object from array (not very performant)
function removeFromArray( a, o )
{
    for (var i=0;i<a.length;i++)
    {
        if (a[i]==o)
		{
            a.splice(i,1);
            return;
		}
    }
    log('removeFromArray: object '+o+'not found in array '+a);
    return a;
}

// byte per byte read rather than byte[4]->int casting, to avoid endians problems
function readInt( uint8arr, offset ) 
{
    return (uint8arr[offset]<<24)+(uint8arr[offset+1]<<16)+(uint8arr[offset+2]<<8)+uint8arr[offset+3]
}

// read string from buffer
function readString( uint8arr, offset, len ) 
{
    res = "";
    for (var i=0;i<len;i++)
    {
        res = res+String.fromCharCode(uint8arr[offset+i]);
    }
    return res;
}

// join two buffers together
function appendBuffer( buffer1, buffer2 ) 
{
  var tmp = new Uint8Array( buffer1.length + buffer2.length );
  tmp.set( buffer1 , 0 );
  tmp.set( buffer2 , buffer1.length );
  return tmp;
}

// convert string to buffer (uint8arr)
function str2u8ar(str) {
	var buf = new ArrayBuffer(str.length); // 1 byte for each char
	var bufView = new Uint8Array(buf);
	for (var i=0, strLen=str.length; i<strLen; i++) 
	{
		bufView[i] = str.charCodeAt(i);
	}
	return bufView;
}

// convert hexadecimal string to buffer (uint8arr)
function hexstr2u8ar(str) {
	var buf = new ArrayBuffer(str.length/2); // 1 byte for 2 chars
	var bufView = new Uint8Array(buf);
	for (var i=0, strLen=str.length/2; i<strLen; i++) 
    {
    	bufView[i] = parseInt(str.charAt(i*2)+str.charAt(i*2+1), 16);
	}
	return bufView;
}





// ------------------------------------------------------------------------------------
// MP4 Box object

function Box( id ) {
    this.id = id;
    this.def = DEFINITIONS[id];
    if (this.def)
        this.name = this.def.name;
    else
        this.name = "";
    this.size = 0;
}


Box.prototype.isContainer = function() 
{
    return (CONTAINERS.indexOf( this.id ) >= 0);
}


Box.prototype.removeChild = function( childBox )
{
	var s=childBox.size;
	removeFromArray( this.children, childBox );
    p = this;
    while (p!=null)
    {
        p.size = p.size - s;
        p = p.parent;
    }
}


Box.prototype.addChild = function( childBox )
{
	this.size = this.size + childBox.size;
	this.children.push(childBox);
}

Box.prototype.serialize = function( buf )
{
	console.log('serialization:'+this.id);
    buf[0] = (this.size&0xff000000)>>24;
	buf[1] = (this.size&0x00ff0000)>>16;
	buf[2] = (this.size&0x0000ff00)>>8;
	buf[3] = (this.size&0x000000ff);

	buf.set( str2u8ar(this.id), 4 );    

	if (this.data) 
    {
		//console.log('serialization of '+this.id+': copying '+this.data.length+' bytes into '+(buf.length-8)+' bytes buffer');
		buf.set( this.data , 8 );
	}
	else 
    {
		if (this.children) 
        {
            var offset = 8;
			for (var i=0;i<this.children.length;i++) 
            {			
				//console.log('butruncated from parent '+this.id+' ('+buf.length+') to child '+this.children[i].id+', to size '+this.children[i].size);
				this.children[i].serialize(buf.subarray(offset, offset+this.children[i].size));
                offset = offset+this.children[i].size;
            }
		}
	}
}



// MP4 Boxes array manipulator. 
// It would be of course more OOP-like to inherit from Array object,
// but we will avoid that to save us from side effects explained here:
// http://perfectionkills.com/how-ecmascript-5-still-does-not-allow-to-subclass-an-array/
//
// Instead, there is a handler class that holds all the Box Array manipulation functions

function Mp4BoxArrayHandler() {};

// call it with level=0, parent=null
// these parameters are set to non-zero values during recursive calling
Mp4BoxArrayHandler.prototype.parse = function( buf, offset, offset1, level, parent ) 
{    
    var res=[]
    while (offset < offset1)        
    {
        var atomsize = readInt( buf, offset );
        var atomtype = readString( buf, offset+4, 4 );
        if (atomsize==0)
            return;

        //log_indent(level,atomtype+' (size '+atomsize+')')

        var newbox = new Box(atomtype);
        newbox.parent = parent;
        newbox.size = atomsize;

        if (newbox.isContainer())                 
            newbox.children = this.parse(buf, offset+8, offset+atomsize, level+1, newbox)        
        else
            newbox.data = buf.subarray(offset+8,offset+atomsize);
        
        res.push(newbox);
        offset+=atomsize;
    }
    return res
}

// find the first box of a given id in a box array
// we may do recursive search here
Mp4BoxArrayHandler.prototype.findBox = function( boxes, id, recursive )
{
    for (var i=0;i<boxes.length;i++)
    {
        if (boxes[i].id == id)
            return boxes[i];

        if ((recursive) && (boxes[i].children))
        {
            r = findBox( boxes[i].children, id, recursive );
            if (r!=null) return r;
        }

    }

    return null;
}

// remove box from boxes array. 
// if the removed box had a parent, parent is notified to update its size
Mp4BoxArrayHandler.prototype.removeBox = function( boxes, box )
{
     if (box.parent!=null)
         box.parent.removeChild( box );     
     else
         removeFromArray( boxes, box );     
}

// serialize boxes array to buffer (uint8arr)
Mp4BoxArrayHandler.prototype.serialize = function( boxes )
{
   var totalSize = 0;

   for (var i=0;i<boxes.length;i++) 
   {			
       totalSize = totalSize+boxes[i].size;
   }

   var buf = new Uint8Array( totalSize );		
	
   for (var i=0;i<boxes.length;i++) 
   {			
        var offset = 0;
		for (var i=0;i<boxes.length;i++) 
        {			
			boxes[i].serialize(buf.subarray(offset,offset+boxes[i].size));
            offset = offset+boxes[i].size;
	    }
	}

    return buf;
}


/*
// create a data box (may be mdat or other) with a given buffer as contents
// the buffer should not include box length and id, these will be added
function createDataBox( id, data )
{
	datasize = data.length+8;
	var tmp = new Uint8Array( datasize );
	tmp.set( data , 8 );
	tmp.set( str2u8ar(id), 4 );

    tmp[0] = (datasize&0xff000000)>>24;
	tmp[1] = (datasize&0x00ff0000)>>16;
	tmp[2] = (datasize&0x0000ff00)>>8;
	tmp[3] = (datasize&0x000000ff);
    return tmp;
}*/
