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
    console.log('processing box:'+this.boxtype);
    if (this.size==1) {
        processor.eat('largesize',FIELD_INT64);
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
    Box.prototype._processFields.call(this,processor);
    processor.eat('version',FIELD_INT8);
    processor.eat('flags',FIELD_BIT24);
}






// --------------------------- ftyp ----------------------------------

function FileTypeBox() {}

FileTypeBox.prototype.boxtype = 'ftyp';

FileTypeBox.prototype._processFields = function(processor) {
    Box.prototype._processFields.call(this,processor);
    processor.eat('major_brand',FIELD_INT32);
    processor.eat('minor_brand',FIELD_INT32);
    processor.eat('compatible_brands',FIELD_INT32);
}

Box.prototype.registerBoxType( FileTypeBox );

// --------------------------- moov ----------------------------------

function MovieBox() {};

MovieBox.prototype.boxtype = 'moov';

MovieBox.prototype._processFields = function(processor) {
   Box.prototype._processFields.call(this,processor);
   processor.eat('boxes',FIELD_CONTAINER_CHILDREN);
}

Box.prototype.registerBoxType( MovieBox );

// --------------------------- moof ----------------------------------

function MovieFragmentBox() {};

MovieFragmentBox.prototype.boxtype = 'moof';

MovieFragmentBox.prototype._processFields = function(processor) {
   Box.prototype._processFields.call(this,processor);
   processor.eat('boxes',FIELD_CONTAINER_CHILDREN);
}

Box.prototype.registerBoxType( MovieFragmentBox );

// --------------------------- mfra ----------------------------------

function MovieFragmentRandomAccessBox() {};

MovieFragmentRandomAccessBox.prototype.boxtype = 'mfra';

MovieFragmentRandomAccessBox.prototype._processFields = function(processor) {
   Box.prototype._processFields.call(this,processor);
   processor.eat('boxes',FIELD_CONTAINER_CHILDREN);
}

Box.prototype.registerBoxType( MovieFragmentRandomAccessBox );

// --------------------------- udta ----------------------------------

function UserDataBox() {};

UserDataBox.prototype.boxtype = 'udta';

UserDataBox.prototype._processFields = function(processor) {
   Box.prototype._processFields.call(this,processor);
   processor.eat('boxes',FIELD_CONTAINER_CHILDREN);
}

Box.prototype.registerBoxType( UserDataBox );

// --------------------------- trak ----------------------------------

function TrackBox() {};

TrackBox.prototype.boxtype = 'trak';

TrackBox.prototype._processFields = function(processor) {
   Box.prototype._processFields.call(this,processor);
   processor.eat('boxes',FIELD_CONTAINER_CHILDREN);
}

Box.prototype.registerBoxType( TrackBox );

// --------------------------- edts ----------------------------------

function EditBox() {};

EditBox.prototype.boxtype = 'edts';

EditBox.prototype._processFields = function(processor) {
   Box.prototype._processFields.call(this,processor);
   processor.eat('boxes',FIELD_CONTAINER_CHILDREN);
}

Box.prototype.registerBoxType( EditBox );

// --------------------------- mdia ----------------------------------

function MediaBox() {};

MediaBox.prototype.boxtype = 'mdia';

MediaBox.prototype._processFields = function(processor) {
   Box.prototype._processFields.call(this,processor);
   processor.eat('boxes',FIELD_CONTAINER_CHILDREN);
}

Box.prototype.registerBoxType( MediaBox );

// --------------------------- minf ----------------------------------

function MediaInformationBox() {};

MediaInformationBox.prototype.boxtype = 'minf';

MediaInformationBox.prototype._processFields = function(processor) {
   Box.prototype._processFields.call(this,processor);
   processor.eat('boxes',FIELD_CONTAINER_CHILDREN);
}

Box.prototype.registerBoxType( MediaInformationBox );

// --------------------------- dinf ----------------------------------

function DataInformationBox() {};

DataInformationBox.prototype.boxtype = 'dinf';

DataInformationBox.prototype._processFields = function(processor) {
   Box.prototype._processFields.call(this,processor);
   processor.eat('boxes',FIELD_CONTAINER_CHILDREN);
}

Box.prototype.registerBoxType( DataInformationBox );

// --------------------------- stbl ----------------------------------

function SampleTableBox() {};

SampleTableBox.prototype.boxtype = 'stbl';

SampleTableBox.prototype._processFields = function(processor) {
   Box.prototype._processFields.call(this,processor);
   processor.eat('boxes',FIELD_CONTAINER_CHILDREN);
}

Box.prototype.registerBoxType( SampleTableBox );

// --------------------------- mvex ----------------------------------

function MovieExtendsBox() {};

MovieExtendsBox.prototype.boxtype = 'mvex';

MovieExtendsBox.prototype._processFields = function(processor) {
   Box.prototype._processFields.call(this,processor);
   processor.eat('boxes',FIELD_CONTAINER_CHILDREN);
}

Box.prototype.registerBoxType( MovieExtendsBox );

// --------------------------- traf ----------------------------------

function TrackFragmentBox() {};

TrackFragmentBox.prototype.boxtype = 'traf';

TrackFragmentBox.prototype._processFields = function(processor) {
   Box.prototype._processFields.call(this,processor);
   processor.eat('boxes',FIELD_CONTAINER_CHILDREN);
}

Box.prototype.registerBoxType( TrackFragmentBox );

// --------------------------- meta ----------------------------------

function MetaBox() {};

MetaBox.prototype.boxtype = 'meta';

MetaBox.prototype._processFields = function(processor) {
   FullBox.prototype._processFields.call(this,processor);
   processor.eat('boxes',FIELD_CONTAINER_CHILDREN);
}

Box.prototype.registerBoxType( MetaBox );


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
    FullBox.prototype._processFields.call(this,processor);
    if (this['version']==1)
    {
        processor.eat('creation_time',FIELD_UINT64);
        processor.eat('modification_time',FIELD_UINT64);
        processor.eat('timescale',FIELD_UINT32);
        processor.eat('duration',FIELD_UINT64);
    }
    else
    {
        processor.eat('creation_time',FIELD_UINT32);
        processor.eat('modification_time',FIELD_UINT32);
        processor.eat('timescale',FIELD_UINT32);
        processor.eat('duration',FIELD_UINT32);
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
    Box.prototype._processFields.call(this,processor);
    processor.eat('data',FIELD_BOX_FILLING_DATA);
}

Box.prototype.registerBoxType( MediaDataBox );

// --------------------------- free ----------------------------------

function FreeSpaceBox() {}

FreeSpaceBox.prototype.boxtype = 'free';

FreeSpaceBox.prototype._processFields = function(processor) {
    Box.prototype._processFields.call(this,processor);
    processor.eat('data',FIELD_BOX_FILLING_DATA);
}

Box.prototype.registerBoxType( FreeSpaceBox );


// --------------------------- sidx ----------------------------------

function SegmentIndexBox() {}

SegmentIndexBox.prototype.boxtype = 'sidx';

SegmentIndexBox.prototype._processFields = function(processor) {
    FullBox.prototype._processFields.call(this,processor);
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


// --------------------------- tkhd ----------------------------------

function TrackHeaderBox() {}

TrackHeaderBox.prototype.boxtype = 'tkhd';

TrackHeaderBox.prototype._processFields = function(processor) {
    FullBox.prototype._processFields.call(this,processor);
    if (this['version']==1)
    {
        processor.eat('creation_time',FIELD_UINT64);
        processor.eat('modification_time',FIELD_UINT64);
        processor.eat('track_id',FIELD_UINT32);
        processor.eat('reserved',FIELD_UINT32);
        processor.eat('duration',FIELD_UINT64);
    }
    else
    {
        processor.eat('creation_time',FIELD_UINT32);
        processor.eat('modification_time',FIELD_UINT32);
        processor.eat('track_id',FIELD_UINT32);
        processor.eat('reserved',FIELD_UINT32);
        processor.eat('duration',FIELD_UINT32);
    }

    processor.eat('reserved',new ArrayField(FIELD_UINT32,2));
    processor.eat('layer',FIELD_INT16);
    processor.eat('alternate_group',FIELD_INT16);
    processor.eat('volume',FIELD_INT16);
    processor.eat('reserved',FIELD_INT16);
    processor.eat('matrix',new ArrayField(FIELD_INT32,9));
    processor.eat('width',FIELD_INT32);
    processor.eat('height',FIELD_INT32);
}
Box.prototype.registerBoxType( TrackHeaderBox );

// --------------------------- mdhd ----------------------------------

function MediaHeaderBox() {}

MediaHeaderBox.prototype.boxtype = 'mdhd';

MediaHeaderBox.prototype._processFields = function(processor) {
    FullBox.prototype._processFields.call(this,processor);
    if (this['version']==1)
    {
        processor.eat('creation_time',FIELD_UINT64);
        processor.eat('modification_time',FIELD_UINT64);
        processor.eat('timescale',FIELD_UINT32);
        processor.eat('duration',FIELD_UINT64);
    }
    else
    {
        processor.eat('creation_time',FIELD_UINT32);
        processor.eat('modification_time',FIELD_UINT32);
        processor.eat('timescale',FIELD_UINT32);
        processor.eat('duration',FIELD_UINT32);
    }

    processor.eat('language',FIELD_UINT16);
    processor.eat('reserved',FIELD_UINT16);
}
Box.prototype.registerBoxType( MediaHeaderBox );

// --------------------------- mehd ----------------------------------

function MovieExtendsHeaderBox() {}

MovieExtendsHeaderBox.prototype.boxtype = 'mehd';

MovieExtendsHeaderBox.prototype._processFields = function(processor) {
    FullBox.prototype._processFields.call(this,processor);
    if (this['version']==1)
    {
        processor.eat('fragment_duration',FIELD_UINT64);
    }
    else
    {
        processor.eat('fragment_duration',FIELD_UINT32);
    }
}
Box.prototype.registerBoxType( MovieExtendsHeaderBox );

// --------------------------- hdlr ----------------------------------

function HandlerBox() {}

HandlerBox.prototype.boxtype = 'hdlr';

HandlerBox.prototype._processFields = function(processor) {
    FullBox.prototype._processFields.call(this,processor);
    processor.eat('pre_defined',FIELD_UINT32);
    processor.eat('handler_type',FIELD_UINT32);
    processor.eat('reserved',new ArrayField(FIELD_UINT32,3));
    processor.eat('name',FIELD_STRING);
}
Box.prototype.registerBoxType( HandlerBox );

// --------------------------- dinf ----------------------------------
/*
function Box() {}

Box.prototype.boxtype = 'hdlr';

Box.prototype._processFields = function(processor) {
    Box.prototype._processFields(processor);
    processor.eat('data',FIELD_BOX_FILLING_DATA);
}
Box.prototype.registerBoxType( Box );

// --------------------------- dref ----------------------------------

function Box() {}

Box.prototype.boxtype = 'hdlr';

Box.prototype._processFields = function(processor) {
    Box.prototype._processFields(processor);
    processor.eat('data',FIELD_BOX_FILLING_DATA);
}
Box.prototype.registerBoxType( Box );

// --------------------------- stsd ----------------------------------

function Box() {}

Box.prototype.boxtype = 'hdlr';

Box.prototype._processFields = function(processor) {
    Box.prototype._processFields(processor);
    processor.eat('data',FIELD_BOX_FILLING_DATA);
}
Box.prototype.registerBoxType( Box );
*/
// --------------------------- stts ----------------------------------

function TimeToSampleBox() {};

TimeToSampleBox.prototype.boxtype = 'stsc';

TimeToSampleBox.prototype._processFields = function(processor) {
    Box.prototype._processFields.call(this,processor);
    processor.eat('entry_count',FIELD_UINT_32);
    var entryField = new StructureField(TimeToSampleBox.prototype._processEntry);
    var a = new ArrayField( entryField, this.entry_count );
    processor.eat('entry',a);    
}

TimeToSampleBox.prototype._processEntry = function(processor) {
    processor.eat('sample_count',FIELD_UINT32);
    processor.eat('sample_delta',FIELD_UINT32);
}

Box.prototype.registerBoxType( TimeToSampleBox );


// --------------------------- stsc ----------------------------------

function SampleToChunkBox() {}

SampleToChunkBox.prototype.boxtype = 'stsc';

SampleToChunkBox.prototype._processFields = function(processor) {
    Box.prototype._processFields.call(this,processor);
    processor.eat('entry_count',FIELD_UINT32);
    var entryField = new StructureField(SampleToChunkBox.prototype._processEntry);
    var a = new ArrayField( entryField, this.entry_count );
    processor.eat('entry',a);    
}

SampleToChunkBox.prototype._processEntry = function(processor) {
    processor.eat('first_chunk',FIELD_UINT32);
    processor.eat('samples_per_chunk',FIELD_UINT32);
    processor.eat('samples_description_index',FIELD_UINT32);
}

Box.prototype.registerBoxType( SampleToChunkBox );

// --------------------------- stco ----------------------------------

function ChunkOffsetBox() {}

ChunkOffsetBox.prototype.boxtype = 'stco';

ChunkOffsetBox.prototype._processFields = function(processor) {
    FullBox.prototype._processFields.call(this,processor);
    processor.eat('entry_count',FIELD_UINT32);
    var a = new ArrayField( FIELD_UINT32, this.entry_count );
    processor.eat('chunk_offset',a); 
    
}
Box.prototype.registerBoxType( ChunkOffsetBox );

// --------------------------- trex ----------------------------------

function TrackExtendsBox() {}

TrackExtendsBox.prototype.boxtype = 'trex';

TrackExtendsBox.prototype._processFields = function(processor) {
    Box.prototype._processFields.call(this,processor);
    processor.eat('track_ID',FIELD_UINT32);
    processor.eat('default_sample_description_index',FIELD_UINT32);
    processor.eat('default_sample_duration',FIELD_UINT32);
    processor.eat('default_sample_size',FIELD_UINT32);
    processor.eat('default_sample_flags',FIELD_UINT32);
}
Box.prototype.registerBoxType( TrackExtendsBox );

// --------------------------- vmhd ----------------------------------

function VideoMediaHeaderBox() {}

VideoMediaHeaderBox.prototype.boxtype = 'vmhd';

VideoMediaHeaderBox.prototype._processFields = function(processor) {
    Box.prototype._processFields.call(this,processor);
    processor.eat('graphicsmode',FIELD_INT16);
    processor.eat('opcolor',new ArrayField(FIELD_UINT16,3));
}

Box.prototype.registerBoxType( VideoMediaHeaderBox );

// --------------------------- smhd ----------------------------------

function SoundMediaHeaderBox() {}

SoundMediaHeaderBox.prototype.boxtype = 'smhd';

SoundMediaHeaderBox.prototype._processFields = function(processor) {
    Box.prototype._processFields.call(this,processor);
    processor.eat('balance',FIELD_INT16);
    processor.eat('reserved',FIELD_UINT16);
}

Box.prototype.registerBoxType( SoundMediaHeaderBox );

// --------------------------- dref ----------------------------------

function DataReferenceBox() {};

DataReferenceBox.prototype.boxtype = 'dref';

DataReferenceBox.prototype._processFields = function(processor) {
   FullBox.prototype._processFields.call(this,processor);
   processor.eat('entry_count',FIELD_UINT32);
   processor.eat('boxes',FIELD_CONTAINER_CHILDREN);
}

Box.prototype.registerBoxType( DataReferenceBox );

// --------------------------- url  ----------------------------------

function DataEntryUrlBox() {}

DataEntryUrlBox.prototype.boxtype = 'url ';

DataEntryUrlBox.prototype._processFields = function(processor) {
    Box.prototype._processFields.call(this,processor);
    processor.eat('location',FIELD_STRING);
}

Box.prototype.registerBoxType( DataEntryUrlBox );

// --------------------------- urn  ----------------------------------

function DataEntryUrnBox() {}

DataEntryUrnBox.prototype.boxtype = 'urn ';

DataEntryUrnBox.prototype._processFields = function(processor) {
    Box.prototype._processFields.call(this,processor);
    processor.eat('name',FIELD_STRING);
    processor.eat('location',FIELD_STRING);
}

Box.prototype.registerBoxType( DataEntryUrnBox );

// --------------------------- mfhd ----------------------------------

function MovieFragmentHeaderBox() {}

MovieFragmentHeaderBox.prototype.boxtype = 'mfhd';

MovieFragmentHeaderBox.prototype._processFields = function(processor) {
    FullBox.prototype._processFields.call(this,processor);
    processor.eat('sequence_number',FIELD_UINT32);
}

Box.prototype.registerBoxType( MovieFragmentHeaderBox );

// --------------------------- tfhd ----------------------------------

function TrackFragmentHeaderBox() {}

TrackFragmentHeaderBox.prototype.boxtype = 'tfhd';

TrackFragmentHeaderBox.prototype._processFields = function(processor) {
    FullBox.prototype._processFields.call(this,processor);
    processor.eat('track_ID',FIELD_UINT32);
    processor.eat_optional('base_date_offset',FIELD_UINT64);
    processor.eat_optional('sample_description_index',FIELD_UINT32);
    processor.eat_optional('default_sample_duration',FIELD_UINT32);
    processor.eat_optional('default_sample_size',FIELD_UINT32);
    processor.eat_optional('default_sample_flags',FIELD_UINT32);
}

Box.prototype.registerBoxType( TrackFragmentHeaderBox );

// --------------------------- tfdt ----------------------------------

function TrackFragmentBaseMediaDecodeTimeBox() {}

TrackFragmentBaseMediaDecodeTimeBox.prototype.boxtype = 'tfdt';

TrackFragmentBaseMediaDecodeTimeBox.prototype._processFields = function(processor) {
    FullBox.prototype._processFields.call(this,processor);
    if (this.version==1) {
        processor.eat('baseMediaDecodeTime',FIELD_UINT64);
    }
    else {
        processor.eat('baseMediaDecodeTime',FIELD_UINT32);
    }
}

Box.prototype.registerBoxType( TrackFragmentBaseMediaDecodeTimeBox );

// --------------------------- trun ----------------------------------

function TrackRunBox() {}

TrackRunBox.prototype.boxtype = 'trun';

TrackRunBox.prototype._processFields = function(processor) {
    Box.prototype._processFields.call(this,processor);
    processor.eat('sample_count',FIELD_UINT32);
    processor.eat_optional('data_offset',FIELD_INT32);
    processor.eat_optional('first_sample_flags',FIELD_UINT32);

    // todo: I don't fully understand the correct way of coding of the optional table which goes here,
    //       in which all the fields are optional accrording to the spec. 
    //       How do we know which of optional fields are actually used?
}

Box.prototype.registerBoxType( TrackRunBox );

// --------------------------- stts ----------------------------------

function TimeToSampleBox() {}

TimeToSampleBox.prototype.boxtype = 'stts';

TimeToSampleBox.prototype._processFields = function(processor) {
    FullBox.prototype._processFields.call(this,processor);
    processor.eat('entry_count',FIELD_UINT32);
    var entryField = new StructureField(TimeToSampleBox.prototype._processEntry);
    var a = new ArrayField( entryField, this.entry_count );
    processor.eat('entry',a);    
}

TimeToSampleBox.prototype._processEntry = function(processor) {
    processor.eat('sample_count',FIELD_UINT32);
    processor.eat('sample_delta',FIELD_UINT32);
}

Box.prototype.registerBoxType( TimeToSampleBox );

// --------------------------- stsd ----------------------------------

function SampleDescriptionBox() {}

SampleDescriptionBox.prototype.boxtype = 'stsd';

SampleDescriptionBox.prototype._processFields = function(processor) {
    FullBox.prototype._processFields.call(this,processor);
    processor.eat('entry_count',FIELD_UINT32);
    processor.eat('boxes',FIELD_CONTAINER_CHILDREN);
}

Box.prototype.registerBoxType( SampleDescriptionBox );


// --------------------------- abstract SampleEntry ----------------------------------

function SampleEntryBox() {}

SampleEntryBox.prototype._processFields = function(processor) {
    Box.prototype._processFields.call(this,processor);
    processor.eat('reserved',new ArrayField(FIELD_UINT8,6));
    processor.eat('data_reference_index',FIELD_UINT16);
}

// --------------------------- abstract VisualSampleEntry ----------------------------------

function VisualSampleEntryBox() {}

VisualSampleEntryBox.prototype._processFields = function(processor) {
    SampleEntryBox.prototype._processFields.call(this,processor);
    processor.eat('pre_defined',FIELD_UINT16);    
    processor.eat('reserved_2',FIELD_UINT16); // there is already field called reserved from SampleEntry!
    processor.eat('pre_defined_2',new ArrayField(FIELD_UINT32,3));    
    processor.eat('width',FIELD_UINT16);
    processor.eat('height',FIELD_UINT16);
    processor.eat('horizresolution',FIELD_UINT32);
    processor.eat('vertresolution',FIELD_UINT32);
    processor.eat('reserved_3',FIELD_UINT32);
    processor.eat('frame_count',FIELD_UINT16);
    processor.eat('compressorname',new FixedLenStringField(32));
    processor.eat('depth',FIELD_UINT16);
    processor.eat('pre_defined_3',FIELD_INT16);
    processor.eat('boxes',FIELD_CONTAINER_CHILDREN);

    console.log('AVC1:');
    console.log(this);

}


// --------------------------- avc1 ----------------------------------

function AVC1VisualSampleEntryBox() {}

AVC1VisualSampleEntryBox.prototype.boxtype = 'avc1';

AVC1VisualSampleEntryBox.prototype._processFields = function(processor) {
    VisualSampleEntryBox.prototype._processFields.call(this,processor);
}

Box.prototype.registerBoxType( AVC1VisualSampleEntryBox );


function AVCConfigurationBox() {}

AVCConfigurationBox.prototype.boxtype = 'avcC';

AVCConfigurationBox.prototype._processFields = function(processor) {
    FullBox.prototype._processFields.call(this,processor);
    processor.eat('profile',FIELD_UINT8);
    processor.eat('compatible_profiles',FIELD_UINT8);
    processor.eat('level',FIELD_UINT8);
    processor.eat('temp',FIELD_UINT8);  // 6 bits for reserved =63 and two bits for NAL length = 2-bit length byte size type
    var lengthSizeMinusOne = self.temp & 3;
    processor.eat('number_of_SPS',FIELD_UINT8); 
    this.real_number_of_SPS = this.number_of_SPS & 31;
    console.log('!!!!!!!!!!!!!!!!!!!!!!!!!111111po zandowaniu:'+this.real_number_of_SPS);
    processor.eat('SPS_NAL', new ArrayField( new StructureField(AVCConfigurationBox.prototype._processNAL), this.real_number_of_SPS ));
    processor.eat('number_of_PPS',FIELD_UINT8); 
    processor.eat('PPS_NAL', new ArrayField( new StructureField(AVCConfigurationBox.prototype._processNAL), this.number_of_PPS ));    


        /*int temp = IsoTypeReader.readUInt8(content);
        lengthSizeMinusOne = temp & 3;
        long numberOfSeuqenceParameterSets = IsoTypeReader.readUInt8(content) & 31;
        for (int i = 0; i < numberOfSeuqenceParameterSets; i++) {
            int sequenceParameterSetLength = IsoTypeReader.readUInt16(content);

            byte[] sequenceParameterSetNALUnit = new byte[sequenceParameterSetLength];
            content.get(sequenceParameterSetNALUnit);
            sequenceParameterSets.add(sequenceParameterSetNALUnit);
        }
        long numberOfPictureParameterSets = IsoTypeReader.readUInt8(content);
        for (int i = 0; i < numberOfPictureParameterSets; i++) {
            int pictureParameterSetLength = IsoTypeReader.readUInt16(content);
            byte[] pictureParameterSetNALUnit = new byte[pictureParameterSetLength];
            content.get(pictureParameterSetNALUnit);
            pictureParameterSets.add(pictureParameterSetNALUnit);
        }
        if (content.remaining() < 4) {
            hasExts = false;
        }
        if (hasExts && (avcProfileIndicaation == 100 || avcProfileIndicaation == 110 || avcProfileIndicaation == 122 || avcProfileIndicaation == 144)) {
            chromaFormat = IsoTypeReader.readUInt8(content) & 3;
            bitDepthLumaMinus8 = IsoTypeReader.readUInt8(content) & 7;
            bitDepthChromaMinus8 = IsoTypeReader.readUInt8(content) & 7;
            long numOfSequenceParameterSetExt = IsoTypeReader.readUInt8(content);
            for (int i = 0; i < numOfSequenceParameterSetExt; i++) {
                int sequenceParameterSetExtLength = IsoTypeReader.readUInt16(content);
                byte[] sequenceParameterSetExtNALUnit = new byte[seque
nceParameterSetExtLength];
                content.get(sequenceParameterSetExtNALUnit);
                sequenceParameterSetExts.add(sequenceParameterSetExtNALUnit);
            }
        } else {
            chromaFormat = -1;
            bitDepthLumaMinus8 = -1;
            bitDepthChromaMinus8 = -1;
        }*/

}

AVCConfigurationBox.prototype._processNAL = function(processor) {
    processor.eat('NAL_length',FIELD_UINT8);
    console.log('READING NAL, len'+this.NAL_length);
    processor.eat('NAL',new DataField(this.NAL_length));
}


Box.prototype.registerBoxType( AVCConfigurationBox );

/*
1 byte version = 8-bit hex version  (current = 1)
                    -> 1 byte H.264 profile = 8-bit unsigned stream profile
                    -> 1 byte H.264 compatible profiles = 8-bit hex flags
                    -> 1 byte H.264 level = 8-bit unsigned stream level
                    -> 1 1/2 nibble reserved = 6-bit unsigned value set to 63
                    -> 1/2 nibble NAL length = 2-bit length byte size type
                      - 1 byte = 0 ; 2 bytes = 1 ; 4 bytes = 3
                    -> 1 byte number of SPS = 8-bit unsigned total
                    -> 2+ bytes SPS length = short unsigned length
                    -> + SPS NAL unit = hexdump
                    -> 1 byte number of PPS = 8-bit unsigned total
                    -> 2+ bytes PPS length = short unsigned length
                    -> + PPS NAL unit = hexdump*/
// --------------------------- xxxx ----------------------------------
/*
function Box() {}

Box.prototype.boxtype = '';

Box.prototype._processFields = function(processor) {
    Box.prototype._processFields.call(this,processor);
    processor.eat('data',FIELD_BOX_FILLING_DATA);
}

Box.prototype.registerBoxType( Box );
*/
// --------------------------- xxxx ----------------------------------
/*
function Box() {}

Box.prototype.boxtype = '';

Box.prototype._processFields = function(processor) {
    Box.prototype._processFields.call(this,processor);
    processor.eat('data',FIELD_BOX_FILLING_DATA);
}

Box.prototype.registerBoxType( Box );
*/


// --------------------------- xxxx ----------------------------------
/*
function Box() {}

Box.prototype.boxtype = '';

Box.prototype._processFields = function(processor) {
    Box.prototype._processFields.call(this,processor);
    processor.eat('data',FIELD_BOX_FILLING_DATA);
}

Box.prototype.registerBoxType( Box );
*/
