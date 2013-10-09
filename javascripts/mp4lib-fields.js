

function NumberField(bits,signed) {
    this.bits = bits;
    this.signed = signed;
}

NumberField.prototype.read = function(buf,pos){
    var res = 0; 
    for (var i=0;i<this.bits/8;i++) {
        res = res<<8;
        res = res+buf[pos]
        pos++;
    }   
    return res; 
}

NumberField.prototype.write = function(buf,pos,val){
    for (var i=0;i<this.bits/8;i++) {        
        buf[pos] = val%0xff;
        val = val>>8;
        pos++;
    }    
}

NumberField.prototype.getLength = function(val) {
    return this.bits/8;
}

function FixedLenStringField(size) {
    this.size = size;
}

FixedLenStringField.prototype.read = function(buf,pos){
    var res = "";
    for (var i=0;i<this.size;i++)
    {
        res = res+String.fromCharCode(buf[pos+i]);
    }
    return res;
}

FixedLenStringField.prototype.write = function(buf,pos,val){
    for (var i=0;i<this.size;i++)
    {
        buf[pos+i] = val.charCodeAt(i);
    }
    return res;
}

FixedLenStringField.prototype.getLength = function(val){
    return this.size;
}

function StringField() {
}

StringField.prototype.read = function(buf,pos,end){
    var res = "";
    //console.log('reading string')
    //console.log('pos:'+pos)
    //console.log('end:'+end)

    for (var i=pos;i<end;i++)
    {
        res = res+String.fromCharCode(buf[i]);
        if (buf[i]==0)
        {
            //console.log('string read:'+res+', letters read:'+i);
            return res;
        }
    }
    throw 'expected null-terminated string, but end of field reached without termination, read so far:'+res
    return res;
}

StringField.prototype.write = function(buf,pos,val){
    for (var i=0;i<val.length;i++)
    {
        buf[pos+i] = val.charCodeAt(i);
    }
    buf[pos+val.length] = 0;
    return res;
}

StringField.prototype.getLength = function(val){
    return val.length+1; // +1 for null-termination
}

function BoxFillingDataField() {
}

BoxFillingDataField.prototype.read = function(buf,pos,end){
    var res = buf.subarray(pos,end-pos);
    return res;
}

BoxFillingDataField.prototype.write = function(buf,pos,val){
    buf.set(val,pos);
}

BoxFillingDataField.prototype.getLength = function(val){
    return val.length;
}


function DataField(len) {
    this.len = len
}

DataField.prototype.read = function(buf,pos,end){
    var res = buf.subarray(pos,this.len);
    return res;
}

DataField.prototype.write = function(buf,pos,val){
    buf.set(val,pos);
}

DataField.prototype.getLength = function(val){
    return this.len;
}



function ArrayField(innerField,size) {
    this.innerField = innerField;
    this.innerFieldLength=innerField.getLength();
    this.size = size;
}

ArrayField.prototype.read = function(buf,pos){   
    var res = [];
    for (var i=0;i<this.size;i++)
    {
        res.push(this.innerField.read(buf,pos));
        pos+=this.innerFieldLength;
    }
    return res;
}

ArrayField.prototype.write = function(buf,pos,val){
    for (var i=0;i<this.size;i++)
    {
        this.innerField.write(buf,pos,val[i]);
        pos+=this.innerFieldLength;
    }
}

ArrayField.prototype.getLength = function(val) {
    return this.size*this.innerFieldLength;
}

function StructureField( _processStructureFields ) {
    this._processStructureFields = _processStructureFields;    
}

StructureField.prototype.read = function(buf,pos,end){
    var struct = {}
	var p = new DeserializationBoxFieldsProcessor(struct,buf,pos,end);
    //this._processStructureFields(p);
    this._processStructureFields.call(struct,p)
    return struct;
}


StructureField.prototype.write = function(buf,pos,val){
   // zrzucamy wszystkie dzieci do bufora
   
}

StructureField.prototype.getLength = function(val) {
}


function BoxesListField() {
}

BoxesListField.prototype.read = function(buf,pos,end){
    // czytamy z bufora dzieci i dodajemy je do rodzica
    var res = [];
    while (pos<end)
    {
        // look ahead to check the boxtype
        var boxtype = readString( buf, pos+4, 4 );
        //console.log("Buffer pos "+pos+"/"+end+" look ahead boxtype:"+boxtype);

        var box;
        if (boxtype in Box.prototype.boxPrototypes) 
            box = new Box.prototype.boxPrototypes[ boxtype ]();
        else  {
            console.log('Unknown boxtype:'+boxtype+', parsing as generic box');
            box = new Box()
        }

        // process to read size


		var p = new DeserializationBoxFieldsProcessor(box,buf,pos,end);
		box._processFields(p);
        res.push(box);
		//console.log(box);
        pos+=box.size;
        if (box.size==0)
        {
            console.log('Invalid size (0) of a box with boxtype '+box.boxtype+', deserialization of children stopped');
            return;
        }
    }
    return res;
}

BoxesListField.prototype.write = function(buf,pos,val){
   // zrzucamy wszystkie dzieci do bufora
   
}

BoxesListField.prototype.getLength = function(val) {
}



// pre-defined shortcuts for common fields 
// ( it is recommended to use these shortcuts to avoid constructors being called for every field processing action)
FIELD_INT8   = new NumberField(8,true);
FIELD_INT16  = new NumberField(16,true);
FIELD_INT32  = new NumberField(32,true);
FIELD_INT64  = new NumberField(64,true);
FIELD_UINT8  = new NumberField(8,false);
FIELD_UINT16 = new NumberField(16,false);
FIELD_UINT32 = new NumberField(32,false);
FIELD_UINT64 = new NumberField(64,false);
FIELD_BIT8   = new NumberField(8,false);
FIELD_BIT16  = new NumberField(16,false);
FIELD_BIT24  = new NumberField(24,false);
FIELD_BIT32  = new NumberField(32,false);
FIELD_BIT64  = new NumberField(64,false);
FIELD_ID = new FixedLenStringField(4);
FIELD_CONTAINER_CHILDREN = new BoxesListField();
FIELD_STRING = new StringField();
FIELD_BOX_FILLING_DATA = new BoxFillingDataField();

