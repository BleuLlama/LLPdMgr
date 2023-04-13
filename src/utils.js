/*
 Various utility functions, unspecific to this project.
*/


// ------ IPC Helpers ------


/* 
    simple wrapper to clean up some code a bit 
*/
function INVOKE_ON_MAIN( channel, params )
{
    if( channel == undefined ) { return; }
    if( params == undefined ) { data = "nil"; }

    return window.api.invoke( channel, params );
}



// ------ jquery-esque stuff ------

// set the content of selector with new text, optionally change the field to use to set the text
function ElSetContent( selectorid, newText, field )
{
    if( IsEmpty( field )) { field = 'innerText'; }
    const theEl = document.getElementById( selectorid );
    if( IsEmpty( theEl )) { return; }

    theEl[ field ] = newText;
    return newText;
}

// set an attribute on an element
function ElSetAttribute( selectorid, attribute, newText )
{
    if( IsEmpty( attribute )) { return newText; }
    const theEl = document.getElementById( selectorid );
    if( IsEmpty( theEl )) { return; }

    theEl.setAttribute( attribute, newText );
    return newText;
}

// remove an attribute on an element
function ElRemoveAttribute( selectorid, attribute )
{
    const theEl = document.getElementById( selectorid );
    if( IsEmpty( theEl )) { return; }

    theEl.removeAttribute( attribute );
    return newText;
}

// add a class to an element
function ElAddClass( selectorid, classname )
{
    if( IsEmpty( classname )) { return classname; }
    const theEl = document.getElementById( selectorid );
    if( IsEmpty( theEl )) { return classname; }

    theEl.classList.add( classname );
    return classname;
}

// remove a class from an element
function ElRemoveClass( selectorid, classname )
{
    if( IsEmpty( classname )) { return classname; }
    const theEl = document.getElementById( selectorid );
    if( IsEmpty( theEl )) { return classname; }

    theEl.classList.remove( classname );
    return classname;
}

// element has a class?

function ElHasClass( selectorid, classname ) {

    if( IsEmpty( classname )) { return false; } // can't have it if it doesn't exist to be haved

    const theEl = document.getElementById( selectorid );
    if( IsEmpty( theEl )) { return false; } // can't have it if it doesn't exist itself.

    if( theEl.classList.contains( classname ) ) {
        return true;
    }
    return false;
}

// toggle a class.  If it becomes selected, return true.
function ElToggleClass( selectorid, classname ) {
    if( ElHasClass( selectorid, classname )) {
        ElRemoveClass( selectorid, classname );
        return false;
    }
    ElAddClass( selectorid, classname );
    return true;
/*
    var button_element = document.getElementById( button_sel );
    if( button_element.classList.contains( "selected" ) ) {
        console.log( "isn't Selected", itemid );
        button_element.classList.remove("selected");
    } else {
        console.log( "is Selected", itemid );
        button_element.classList.add("selected");
    }
    */
}


// ------ General Library Helpers ------

// returns true if the value is empty.
// this means "", undefined, false, etc
function IsEmpty( value )
{
    // empty value
    if( value == undefined ) { return true; }

    // empty array
    if( typeof( value ) == 'array' ) {
        if( value.length == 0 ) { return true;}

    // empty object (?)
    } else if( typeof( value ) == 'object' ) {
        if( !value ) { return true; }
        //if( Object.keys( value ).length == 0 ) { return true; } // not correct

    // empty string, or empty quantity equivalent
    } else {
        if( value == '' || value == false || value == 0 ) { 
            return true;
        }
    }
    return false;
}

function ShowIcon( which )
{
    if( which == 'exclamation' || which == '!' ) {
        ElAddClass( 'js-status-ring', 'd-none' );
        ElRemoveClass( 'js-status-exclamation', 'd-none' );
    } else if( which == 'ring' || which == 'o' ) {
        ElRemoveClass( 'js-status-ring', 'd-none' );
        ElAddClass( 'js-status-exclamation', 'd-none' );
    } else {
        ElAddClass( 'js-status-ring', 'd-none' );
        ElAddClass( 'js-status-exclamation', 'd-none' );
    }
}

function ShowStatus( iors, color, text )
{
    const sel = iors + '-status';
    console.log( sel );

    ElRemoveClass( sel, 'status-black' );
    ElRemoveClass( sel, 'status-red' );
    ElRemoveClass( sel, 'status-orange' );
    ElRemoveClass( sel, 'status-yellow' );
    ElRemoveClass( sel, 'status-green' );
    ElRemoveClass( sel, 'status-cyan' );
    ElRemoveClass( sel, 'status-purple' );
    ElAddClass( sel, 'status-' + color );

    ElSetContent( sel, text );
}



// recursively go through an object and move all of the sub properties down
// to the base object with key/separator based names.
function flatten_object( kobj, prekey, ret, separator ) {

    if( prekey == undefined ) { prekey = ''; }
    if( ret == undefined ) { ret = {}; }
    if( separator == undefined ) { separator = "."; }

    for (const property in kobj) {
        var target_key = prekey + property;

        var property_type = typeof( kobj[ property ] );

        if( property_type == 'object' ) { 
            ret = flatten_object( kobj[ property ], target_key + separator, ret, separator);

        } else if( property_type == 'string'  
            || property_type == 'boolean' 
            || property_type == 'number' ) { 
            ret[ target_key ] = kobj[ property ];
        } else { 
            console.log( "ERROR: FLATTEN: Unsupported type: " + property_type );
        }
    }

    return ret;
}


/// Templatier
//  an adaptation of a jquery templating function i use a lot
//  template_sel should be an id for an element containing the template
//  template text like ${moose}  gets replaed frm the 'props'
//  object passed in's property "moose"  essentially having
//  effect like:  
//      "I like cheese, and i like <em> ${moose} </em>. ".substr( "${moose}", props.moose );
// and for best use, in the page's html, store the templates in script:text/template tags:
/*
    <script type="text/template" id="moose">
        <p> I like cheese, and i like <em> ${moose} </em>.</p>
    </script>
*/
function Templatier( template_id, props )
{
    // jquery version:  $( template_sel ).html()
    // but jquery you would pass in "#moose" for an id, or ".moose" for
    // the selector, but in this case, it only works on an ID, and would
    // be passed in as "moose"
    var template_element = document.getElementById( template_id );
    if( template_element == undefined ) {
        return template_element;
    }

    var ttt = template_element.innerHTML;
    
    // get and split the template
    var itemTpl = ttt.split(/\$\{(.+?)\}/g);

    //return function(tok, i) { return (i % 2) ? props[tok] : tok; };

    var toklist = itemTpl.map( function( key, idx ) {
            return( idx%2 ) ? props[ key ] : key ;
    } );

    return toklist.join( '' );
}


// MT is a version of the above that handles a lot of the code
// normally that has to be done in loops when applying lots of records of data.
// it will go through each record in the dataRecordArray, flatten it, then call the callbackfn
// for additional changes/tweaks.  Next it uses Templatier() to apply that data to 
// the template in template_id, and then appends that to a string it will return.
function MultiTemplatier( template_id, dataRecordArray, callbackfn )
{
    var return_content = '';
    
    for( var i = 0 ; i < dataRecordArray.length ; i++ ) {

        // flatten the record
        var record = flatten_object( dataRecordArray[ i ] );

        // if there's a callback processing function, call that.
        if( callbackfn != undefined ) {
            record = callbackfn( i, record, dataRecordArray );
        }

        // get the template, and apply it with this data
        var itm = Templatier( template_id, record );

        // append it to the return content
        return_content += itm;
    }
    return return_content;
}
