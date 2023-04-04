

// call your main.js function here
/*
console.log("I'm going to call main.js's 'myfunc'");
window.api.invoke('myfunc', [1,2,3])
    .then(function(res) {
        console.log(res); // will print "This worked!" to the browser console
    })
    .catch(function(err) {
        console.error(err); // will print "This didn't work!" to the browser console.
    });


setInterval( function() {
    console.log( "ping" );
}, 2000 );
*/

/*
const counter = document.getElementById('counter')

window.electronAPI.handleCounter((event, value) => {
    const oldValue = Number(counter.innerText)
    const newValue = oldValue + value
    counter.innerText = newValue
    event.sender.send('counter-value', newValue)
    console.log( newValue );
})
*/

//// End of test/example code stuff


// handler for itch login success
window.electronAPI.handleItchLoginSuccess((event, value) => {
    const sel_iun = document.getElementById('itch-user-name');
    sel_iun.innerText = value.user.username;

    const sel_iui = document.getElementById('itch-user-image');
    sel_iui.setAttribute( 'src', value.user.cover_url );

    const sel_isp = document.getElementById( 'itch-status-pill' );
    sel_isp.classList.remove("text-bg-info");
    sel_isp.classList.add("text-bg-success");
    sel_isp.innerText = "Itch.IO ready.";
});

// handler for itch login failure
window.electronAPI.handleItchLoginFail((event, value) => {
    const sel_isp = document.getElementById( 'itch-status-pill' );
    sel_isp.classList.remove("text-bg-info");
    sel_isp.classList.add("text-bg-danger");
    sel_isp.innerText = "Itch.IO failure.";
});


console.log( "333" );
const refresh_itch_button = document.getElementById( 'refresh-itch' );
refresh_itch_button.onclick = function() {
    console.log( "renderer refresh-itch-data");
    window.api.invoke('refresh-itch-me', [1,2,3]);
    window.api.invoke('refresh-itch-owned-data', [1,2,3]);
}

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

// handler for itch data
window.electronAPI.handleItchOwnedData((event, data) => {
    owned_keys = data.owned_keys;

    //var target = document.getElementById( 'itch-list' );
    var target = document.querySelector('#itch-list');
    target.innerHTML = "";

    for( var i = 0 ; i < owned_keys.length ; i++ ) {    
        //console.log( owned_keys[i] );
        owned_keys[i].idx = i;
        var flat_data = flatten_object( owned_keys[i] );
        flat_data[ 'game.author' ] = flat_data[ 'game.user.display_name' ];
        if( flat_data[ 'game.author' ] == undefined ) { 
            flat_data[ 'game.author' ] = flat_data[ 'game.user.username' ];
        }

        var itm = templatier( 'templte-itch-list-item', flat_data );
        target.innerHTML += itm;
    }
});

function templatier( template_sel, props )
{
    // jquery version:  $( template_sel ).html()

    var template_element = document.getElementById( template_sel );
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
/*
{
    "game.type": "default",
    "game.has_demo": false,
    "game.created_at": "2020-11-24 14:56:05",
    "game.cover_url": "https://img.itch.zone/aW1nLzQ2NjMzNzEucG5n/315x250%23c/YFwnfe.png",
    "game.title": "Grid Pix Advent (C64)",
    "game.p_windows": false,
    "game.p_linux": false,
    "game.url": "https://thalamusdigital.itch.io/grid-pix-advent",
    "game.p_android": false,
    "game.min_price": 0,
    "game.published_at": "2020-11-24 15:41:49",
    "game.can_be_bought": true,
    "game.classification": "game",
    "game.user.display_name": "Thalamus Digital Publishing Ltd.",
    "game.user.username": "thalamusdigital",
    "game.user.id": 1056525,
    "game.user.url": "https://thalamusdigital.itch.io",
    "game.user.cover_url": "https://img.itch.zone/aW1hZ2UyL3VzZXIvMTA1NjUyNS8xMzYyMTg1LnBuZw==/100x100%23/aOwaDh.png",
    "game.id": 832237,
    "game.p_osx": false,
    "game.in_press_system": false,
    "game.short_text": "A **FREE** Xmas version of Grid Pix",
    "game_id": 832237,
    "created_at": "2021-09-06 14:55:48",
    "id": 56588436,
    "purchase_id": 8208080,
    "updated_at": "2021-09-06 14:55:48",
    "downloads": 1,
    "idx": 18
}
*/


function clickedListItem( itemid )
{
    var button_sel = "itch-item-" + itemid;

    var button_element = document.getElementById( button_sel );

    if( button_element.classList.contains( "selected" ) ) {
        console.log( "isn't Selected", itemid );
        button_element.classList.remove("selected");
    } else {
        console.log( "is Selected", itemid );
        button_element.classList.add("selected");
    }


}