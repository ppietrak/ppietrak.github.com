

function SerializationBoxFieldsProcessor( box, buf, pos)
{
    this.box = box;
    this.buf = buf;
    this.pos = pos;
}

SerializationBoxFieldsProcessor.prototype.eat = function( fieldname, fieldtype )
{
    fieldtype.write( this.buf, this.pos, this.box[fieldname] );
}

function DeserializationBoxFieldsProcessor( box, buf, pos, end )
{
    this.box = box;
    this.buf = buf;
    this.pos = pos;
    this.bufferStart = pos;
    this.bufferEnd = end;
    this.end = end;

}

DeserializationBoxFieldsProcessor.prototype.eat = function( fieldname, fieldtype )
{
    if (fieldtype===undefined)
    {
        console.log('Undefined fieldtype for field '+fieldname);
        console.log(this);
    }

    var val = fieldtype.read( this.buf, this.pos, this.end );
    this.box[fieldname]=val;

    if (fieldname=='size')
    {
        this.end = this.bufferStart+val;
        if (this.end>this.bufferEnd)
            throw "Deserialization error: Box size exceeds buffer ("+box.boxtype+")"
    }

    this.pos+=fieldtype.getLength(val);
    // TODO support for setting largesize and size=0
}


function LengthCounterBoxFieldsProcessor( box )
{
    this.box = box;
    this.res = 0;
}

LengthCounterBoxFieldsProcessor.prototype.eat = function( fieldname, fieldtype )
{
    this.res+=fieldtype.getLength(this.box[fieldname]);
}
