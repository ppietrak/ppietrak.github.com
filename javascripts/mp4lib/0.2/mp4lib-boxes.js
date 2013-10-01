// ---------- File (treated similarly to box in terms of processing) ----------

function File() {}

File.prototype._processFields = function(processor) {
    processor.eat('boxes',FIELD_CONTAINER_CHILDREN)
}

// ---------- Generic Box -------------------------------

function Box() {}

Box.prototype._processFields = function(processor) {
    processor.eat('size',FIELD_UINT32);
    processor.eat('boxtype',FIELD_ID);
    if (this.size==1) {
        processor.eat('largesize',FIELD_INT641);
    }    
    if (this.boxtype=='uuid') {
        processor.eat( 'usertype', ArrayField( FIELD_INT8, 16) );
    }
}

Box.prototype.boxPrototypes = {}

Box.prototype.registerBoxType = function( boxPrototype ) {
    Box.prototype.boxPrototypes[ boxPrototype.prototype.boxtype ] = boxPrototype;
}

// ---------- Full Box -------------------------------

function FullBox() {}

FullBox.prototype._processFields = function(processor) {
    Box.prototype._processFields(processor);
    processor.eat('version',FIELD_INT8);
    processor.eat('flags',FIELD_BIT24);
}






// --------------------------- ftyp ----------------------------------

function FileTypeBox() {}

FileTypeBox.prototype.boxtype = 'ftyp';

FileTypeBox.prototype._processFields = function(processor) {
    Box.prototype._processFields(processor);
    processor.eat('major_brand',FIELD_INT32);
    processor.eat('minor_brand',FIELD_INT32);
    processor.eat('compatible_brands',FIELD_INT32);
}

Box.prototype.registerBoxType( FileTypeBox );

// --------------------------- moov ----------------------------------

function MovieBox() {};

MovieBox.prototype.boxtype = 'moov';

MovieBox.prototype._processFields = function(processor) {
   Box.prototype._processFields(processor);
   processor.eat('boxes',FIELD_CONTAINER_CHILDREN);
}

Box.prototype.registerBoxType( MovieBox );

// --------------------------- moof ----------------------------------

function MovieFragmentBox() {};

MovieFragmentBox.prototype.boxtype = 'moof';

MovieFragmentBox.prototype._processFields = function(processor) {
   Box.prototype._processFields(processor);
   processor.eat('boxes',FIELD_CONTAINER_CHILDREN);
}

Box.prototype.registerBoxType( MovieFragmentBox );

// --------------------------- mfra ----------------------------------

function MovieFragmentRandomAccessBox() {};

MovieFragmentRandomAccessBox.prototype.boxtype = 'mfra';

MovieFragmentRandomAccessBox.prototype._processFields = function(processor) {
   Box.prototype._processFields(processor);
   processor.eat('boxes',FIELD_CONTAINER_CHILDREN);
}

Box.prototype.registerBoxType( MovieFragmentRandomAccessBox );

// --------------------------- udta ----------------------------------

function UserDataBox() {};

UserDataBox.prototype.boxtype = 'udta';

UserDataBox.prototype._processFields = function(processor) {
   Box.prototype._processFields(processor);
   processor.eat('boxes',FIELD_CONTAINER_CHILDREN);
}

Box.prototype.registerBoxType( UserDataBox );

// --------------------------- trak ----------------------------------

function TrackBox() {};

TrackBox.prototype.boxtype = 'trak';

TrackBox.prototype._processFields = function(processor) {
   Box.prototype._processFields(processor);
   processor.eat('boxes',FIELD_CONTAINER_CHILDREN);
}

Box.prototype.registerBoxType( TrackBox );

// --------------------------- edts ----------------------------------

function EditBox() {};

EditBox.prototype.boxtype = 'edts';

EditBox.prototype._processFields = function(processor) {
   Box.prototype._processFields(processor);
   processor.eat('boxes',FIELD_CONTAINER_CHILDREN);
}

Box.prototype.registerBoxType( EditBox );

// --------------------------- mdia ----------------------------------

function MediaBox() {};

MediaBox.prototype.boxtype = 'mdia';

MediaBox.prototype._processFields = function(processor) {
   Box.prototype._processFields(processor);
   processor.eat('boxes',FIELD_CONTAINER_CHILDREN);
}

Box.prototype.registerBoxType( MediaBox );

// --------------------------- minf ----------------------------------

function MediaInformationBox() {};

MediaInformationBox.prototype.boxtype = 'minf';

MediaInformationBox.prototype._processFields = function(processor) {
   Box.prototype._processFields(processor);
   processor.eat('boxes',FIELD_CONTAINER_CHILDREN);
}

Box.prototype.registerBoxType( Box );

// --------------------------- dinf ----------------------------------

function DataInformationBox() {};

DataInformationBox.prototype.boxtype = 'dinf';

DataInformationBox.prototype._processFields = function(processor) {
   Box.prototype._processFields(processor);
   processor.eat('boxes',FIELD_CONTAINER_CHILDREN);
}

Box.prototype.registerBoxType( DataInformationBox );

// --------------------------- stbl ----------------------------------

function SampleTableBox() {};

SampleTableBox.prototype.boxtype = 'stbl';

SampleTableBox.prototype._processFields = function(processor) {
   Box.prototype._processFields(processor);
   processor.eat('boxes',FIELD_CONTAINER_CHILDREN);
}

Box.prototype.registerBoxType( SampleTableBox );

// --------------------------- mvex ----------------------------------

function MovieExtendsBox() {};

MovieExtendsBox.prototype.boxtype = 'mvex';

MovieExtendsBox.prototype._processFields = function(processor) {
   Box.prototype._processFields(processor);
   processor.eat('boxes',FIELD_CONTAINER_CHILDREN);
}

Box.prototype.registerBoxType( MovieExtendsBox );

// --------------------------- traf ----------------------------------
/*
function TrackFragmentBox() {};

TrackFragmentBox.prototype.boxtype = 'traf';

TrackFragmentBox.prototype._processFields = function(processor) {
   Box.prototype._processFields(processor);
   processor.eat('boxes',FIELD_CONTAINER_CHILDREN);
}

Box.prototype.registerBoxType( TrackFragmentBox );
*/
// --------------------------- meta ----------------------------------
/*
function MetaBox() {};

MetaBox.prototype.boxtype = 'meta';

MetaBox.prototype._processFields = function(processor) {
   Box.prototype._processFields(processor);
   processor.eat('boxes',FIELD_CONTAINER_CHILDREN);
}

Box.prototype.registerBoxType( MetaBox );
*/

/*  container box template
// ---------------------------  ----------------------------------

function Box() {};

Box.prototype.boxtype = '';

Box.prototype._processFields = function(processor) {
   Box.prototype._processFields(processor);
   processor.eat('boxes',FIELD_CONTAINER_CHILDREN);
}

Box.prototype.registerBoxType( Box );
*/

// --------------------------- mvhd ----------------------------------

function MovieHeaderBox() {}

MovieHeaderBox.prototype.boxtype = 'mvhd';

MovieHeaderBox.prototype._processFields = function(processor) {
    FullBox.prototype._processFields(processor);
    if (this['version']==1)
    {
        processor.eat('creation_time',FIELD_INT64);
        processor.eat('modification_time',FIELD_INT64);
        processor.eat('timescale',FIELD_INT32);
        processor.eat('duration',FIELD_INT64);
    }
    else
    {
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

Box.prototype.registerBoxType( MovieHeaderBox );


// --------------------------- mdat ----------------------------------

function MediaDataBox() {}

MediaDataBox.prototype.boxtype = 'mdat';

MediaDataBox.prototype._processFields = function(processor) {
    Box.prototype._processFields(processor);
    processor.eat('data',FIELD_BOX_FILLING_DATA);
}

Box.prototype.registerBoxType( MediaDataBox );

// --------------------------- free ----------------------------------

function FreeSpaceBox() {}

FreeSpaceBox.prototype.boxtype = 'free';

FreeSpaceBox.prototype._processFields = function(processor) {
    Box.prototype._processFields(processor);
    processor.eat('data',FIELD_BOX_FILLING_DATA);
}

Box.prototype.registerBoxType( FreeSpaceBox );


// --------------------------- sidx ----------------------------------

function SegmentIndexBox() {}

SegmentIndexBox.prototype.boxtype = 'sidx';

SegmentIndexBox.prototype._processFields = function(processor) {
    FullBox.prototype._processFields(processor);
    processor.eat('reference_ID',FIELD_UINT32);
    processor.eat('timescale',FIELD_UINT32);
    if (this.version==0) {
	    processor.eat('earliest_presentation_time',FIELD_UINT32);
	    processor.eat('first_offset',FIELD_UINT32);
    }
    else {
	    processor.eat('earliest_presentation_time',FIELD_UINT64);
	    processor.eat('first_offset',FIELD_UINT64);
    }
    processor.eat('reserved',FIELD_UINT16);
    processor.eat('reference_count',FIELD_UINT16);

    var referenceField = new StructureField(SegmentIndexBox.prototype._processReference);
    var a = new ArrayField( referenceField, this.reference_count );
    processor.eat('references',a);    
}

SegmentIndexBox.prototype._processReference = function(processor) {
    processor.eat('reference_info',FIELD_UINT64);
    processor.eat('SAP',FIELD_UINT32);
}

Box.prototype.registerBoxType( SegmentIndexBox );

// --------------------------- trak ----------------------------------
/*
function Box() {}

Box.prototype.boxtype = '';

Box.prototype._processFields = function(processor) {
    Box.prototype._processFields(processor);
    processor.eat('data',FIELD_BOX_FILLING_DATA);
}
*/

// --------------------------- udta ----------------------------------
/*
function Box() {}

Box.prototype.boxtype = '';

Box.prototype._processFields = function(processor) {
    Box.prototype._processFields(processor);
    processor.eat('data',FIELD_BOX_FILLING_DATA);
}
*/


// --------------------------- moof ----------------------------------
/*
function Box() {}

Box.prototype.boxtype = '';

Box.prototype._processFields = function(processor) {
    Box.prototype._processFields(processor);
    processor.eat('data',FIELD_BOX_FILLING_DATA);
}
*/

// --------------------------- mvex ----------------------------------
/*
Box() {}

Box.prototype.boxtype = '';

Box.prototype._processFields = function(processor) {
    Box.prototype._processFields(processor);
    processor.eat('data',FIELD_BOX_FILLING_DATA);
}
*/


// --------------------------- xxxx ----------------------------------
/*
Box() {}

Box.prototype.boxtype = '';

Box.prototype._processFields = function(processor) {
    Box.prototype._processFields(processor);
    processor.eat('data',FIELD_BOX_FILLING_DATA);
}
*/
