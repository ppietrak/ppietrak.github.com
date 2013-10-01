---
layout: post
title: 'New architecture for Mp4Lib'
author: 'Przemyslaw Pietrak'
published: true
---

We have completely reshaped the architecture of mp4Lib, to face the challenges which we signalled in the previous post.

<!--more-->

Architectural goals
-------------------

* Full (programmable) control over the box structure during box parsing / serialization; in order to cope with dynamic box structure

* Every box that is a result of parsing, should be represented as javascript object

* Each field of box should be loaded into it's object as an attribute

* Manipulation on such box objects should be straightforward, f.eg. setting a value of a field should be done just by setting an attribute value; removing a child should be done just by removing an object from array etc.

* Programming of various types of mp4 boxes should be as straightforward and self-documenting as possible; the programmed definition should closely resemble ISO definition

What we propose
---------------

The architecture consists of three classes of objects:

<h3>Boxes</h3>

Boxes represent mp4 boxes. The box prototypes ('classes') are directly corresponding to the ISO definitions:

  * Box
  * FullBox
  * FreeSpaceBox
  * FileTypeBox  
  * MediaDataBox
  * MovieBox
  * ... 

Each Box keeps the fields as object attribute. In case of container boxes, all sub-boxes are kept in 'boxes' attribute. 

<h3>BoxFields</h3>

A boxfield is a simple object that represents single field. There are several generic boxfields pre-defined, but each box may define and use its own boxfield.

The following boxfields are predefined:

  * NumberField (various types)
  * FixedSizeStringField
  * BoxFillingStringField
  * ArrayField (fixed-size)
  * BoxFillingDataField 
  * BoxesListField (nested boxes in conatiner boxes)
  
<h3>BoxFieldProcessors</h3>

BoxFieldProcessors are used to perform some action on a box field. 

The following boxfieldprocessors may be used:

  * DeserializationBoxFieldProcessor
  * SerializationBoxFieldProcessor
  * LengthCounterBoxFieldProcessor

How it works
------------

Each box has a special function <i>_processFields</i> which is used to iterate the box fields. This one single function may be used both to serialize and deserialize box (or for other purposes), depending on the fieldprocessor passed as an argument. 

Let's look at the example <i>_processFields</i> function of FileTypeBox:

<pre>
FileTypeBox.prototype._processFields = function(processor) {
    Box.prototype._processFields(processor);
    processor.eat('major_brand',FIELD_INT32);
    processor.eat('minor_brand',FIELD_INT32);
    processor.eat('compatible_brands',FIELD_INT32);
}
</pre>

Such box can be serialized and deserialized as follows:

<pre>
function serialize( fileTypeBox, buffer )  {
    var processor = new SerializationBoxFieldProcessor( buffer )
    fileTypeBox._processFields( processor );
}

function deserializeFileTypeBox( buffer )  {
    var processor = new DeserializationBoxFieldProcessor( buffer )
    var fileTypeBox = new fileTypeBox();
    fileTypeBox._processFields( processor );
}
</pre>

Please note, that we have used the same <i>_processFields</i> function for both tasks. This is the fundamental idea of the proposed architecture. Typically, the <i>_processFields</i> function defines the structure of each box just like ISO definition does. The advantage of such architecture is that whenever processFields is called, it may process the fields conditionally, depending on the data of the fields already processed - exactly the result we wanted to achieve.


The beauty of it: Box Definitions
-------------------------------------

Let's look at the definition of Movie Header box and compare it with ISO spec. As you will see, the javascript code is very close to the ISO definition (which is the goal we wanted to achieve). Please note the conditional structure definition of Movide Header Box.

javascript code:

<pre>
MovieHeaderBox.prototype._processFields = function(processor) {
    FullBox.prototype._processFields(processor);

    // Fullbox _processFields function processes version, 
    // so it is available now

    if (this['version']==1) {
        processor.eat('creation_time',FIELD_INT64);
        processor.eat('modification_time',FIELD_INT64);
        processor.eat('timescale',FIELD_INT32);
        processor.eat('duration',FIELD_INT64);
    }
    else { // version==0
        processor.eat('creation_time',FIELD_INT32);
        processor.eat('modification_time',FIELD_INT32);
        processor.eat('timescale',FIELD_INT32);
        processor.eat('duration',FIELD_INT32);
    }

    processor.eat('rate',FIELD_INT32);
    processor.eat('volume',FIELD_INT16);
    processor.eat('reserved',FIELD_INT16);
    processor.eat('reserved',new ArrayField(FIELD_INT32,2));
    processor.eat('matrix',new ArrayField(FIELD_INT32,9));
    processor.eat('pre_defined',new ArrayField(FIELD_BIT32,9));
    processor.eat('next_track_ID',FIELD_UINT32);
}
</pre>

ISO spec:

![](/images/mvhd-iso.png)

The beauty  of it: Box Objects
----------------------------------

After loading the file, in javascript you get a clean and nice File object, with several mp4 boxes inside:

![](/images/file-object.png)

Let's now take a look how does the complex Movie Header Box object look like after loading from file. (it is a result of running _processFields function shown above.) All the fields are loaded to object attributes and all the data structures are kept. There are absolutely no unneeded items in the object, all the data has correct type (eg. strings are strings, numbers are numbers and arrays are arrays) and accessing/mainpluating the fields is straightforward because these are simply object attributes:

![](/images/mvhd-object.png)

<script type="text/javascript" src="/javascripts/mp4lib/0.2/mp4lib.js"></script>
<script type="text/javascript" src="/javascripts/mp4lib/0.2/mp4lib-fieldProcessors.js"></script>
<script type="text/javascript" src="/javascripts/mp4lib/0.2/mp4lib-fields.js"></script>
<script type="text/javascript" src="/javascripts/mp4lib/0.2/mp4lib-helpers.js"></script>
<script type="text/javascript" src="/javascripts/mp4lib/0.2/mp4lib-boxes.js"></script>
<script type="text/javascript" src="/javascripts/mp4lib/0.2/SmoothPlayer.js"></script>
<script src="//ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js" ></script>


<h2>Try it</h2>

This demo loads the predefined mp4 file and shows the resulting File object on the console.
<input type="button" onclick="runDemo2('/images/video-dash-01.mp4');" value="Run Demo"/>



<script>
/*
var movie = new SmMediaObject();

function movieLoadFail( error )
{
    alert( error );
}


function movieLoaded()
{
    console.log("Movie loaded!");
}



function runDemo()
{    
	//var video = document.querySelector('video');    
    movie.onload = movieLoaded;
    movie.onerror = movieLoadFail;
    console.log("Calling movie.open");
    //url = "http://cdn-ott.rd.tp.pl/TVE/Smooth/pr_ottRE9jozxq/pr_ott.ism/manifest";  
    movie.open('/images/manifest.xml');
}*/

function GET(url, callback) {
  var xhr = new XMLHttpRequest();
  xhr.open('GET', url, true);
  xhr.responseType = 'arraybuffer';
  xhr.send();

  xhr.onload = function(e) {
    if (xhr.status != 200) {
      alert("Unexpected status code " + xhr.status + " for " + url);
      return false;
    }
    callback(new Uint8Array(xhr.response));
  };
}


function runDemo2(url)
{
    GET(url, function(uInt8Array) {
		u = uInt8Array;		
        f = new File();
        p = new DeserializationBoxFieldsProcessor(f,u,0,u.length);
	    f._processFields(p);
        console.log('loaded');
        console.log(f);
        alert('Please observe the result at the console');
	  });

}


</script>



