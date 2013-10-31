// Simple logging library
// author: Przemyslaw Pietrak
// (C) 2013 Orange Labs Poland

var INDENTS = [ '  ','    ','      ','        ','          ','            ','              ','                ']
var logger = null;

function initLogger(id) 
{
    logger = document.getElementById('log');
}

function log(msg) 
{  
	if (logger)
    {
	    var fragment = document.createDocumentFragment();
		fragment.appendChild(document.createTextNode(msg));
		fragment.appendChild(document.createElement('br'));
		logger.appendChild(fragment);
    }
}

function log_indent( lev, msg )
{
    log(INDENTS[lev]+msg);
}


function log_clear()
{
    logger.textContent = '';
};

