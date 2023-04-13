
// handler for the app finishing loading
window.electronAPI.appFinishedStartup( (event, value ) => {

    //ShowStatus( 'sideload', 'red', 'Sideload: Not connected.' );
    ShowIcon( 'o' );

    // on app startup... get itch data
    INVOKE_ON_MAIN( 'refresh-itch-owned-data' );
});



// handler for itch login success
window.electronAPI.handleItchLoginSuccess((event, value) => {
    ElSetContent( 'itch-user-name', value.user.username );
    ElSetAttribute( 'itch-user-image', 'src', value.user.cover_url );
    ShowStatus( 'itch', 'transparent', 'Itch.io: ready.' );
    ShowIcon( '' );
});

// handler for itch login failure
window.electronAPI.handleItchLoginFail((event, value) => {
    ShowStatus( 'itch', 'red', 'Itch.IO: login failure.' );
    ShowIcon( '!' );
});


const refresh_itch_button = document.getElementById( 'refresh-itch' );
refresh_itch_button.onclick = function() {
    //INVOKE_ON_MAIN( 'refresh-itch-me' );
    console.log( 'refresh itch' );

    ShowIcon( 'o' );
    ShowStatus( 'itch', 'cyan', 'Refreshing Itch.io...' );
    INVOKE_ON_MAIN( 'refresh-itch-owned-data' );
}

window.electronAPI.handleItchOwnedDataFail((event, data) => {

    ShowIcon( '!' );
    ShowStatus( 'itch', 'red', 'Itch.io: list load failure.' );
});

// handler for itch data
window.electronAPI.handleItchOwnedData((event, data) => {

    //var target = document.getElementById( 'itch-list' );
    var target = document.querySelector('#itch-list');

    target.innerHTML = MultiTemplatier( 
        'template-itch-list-item',   // template ID
        data.owned_key,            // array of records
        function( idx, record, dataRecordArray) { // data tweaking callback
            // minor data tweaks
            record.idx = idx;

            // some conditional stuff
            record[ 'game.author' ] = record[ 'game.user.display_name' ];
            if( record[ 'game.author' ] == undefined ) { 
                record[ 'game.author' ] = record[ 'game.user.username' ];
            }
            
            return record;
        }
    );


    ShowIcon( '' );
    ShowStatus( 'itch', 'transparent', 'Itch.io: ready.' );
});


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


function clickedItchItem( itemid )
{
    var button_sel = "itch-item-" + itemid;

    var toggled = ElToggleClass( button_sel, 'selected' );
    if( toggled ) { 
        console.log( "Itch: Is Now Selected", itemid );
    } else {
        console.log( "Itch: Is Now unselected", itemid );
    }
}

/////////////////

const refresh_sideload_button = document.getElementById( 'refresh-sideload' );
refresh_sideload_button.onclick = function() {
    ShowIcon( 'o' );
    ShowStatus( 'sideload', 'cyan', 'Refreshing Sideloads...' );
    INVOKE_ON_MAIN( 'refresh-sideloads' );
}


window.electronAPI.handleSideloadLoginSuccess((event, data) => {
    
    ElSetContent( 'sideload-user-name', data.username );
    ElSetAttribute( 'sideload-user-image', 'src', data.cover_url );

    ShowStatus( 'sideload', 'transparent', 'Sideload: ready' );
    ShowIcon( '' );
});

window.electronAPI.handleSideloadLoginFail((event, data) => {
    ShowIcon( '!' );
    ShowStatus( 'sideload', 'red', 'Sideload: login failure.' );
});

window.electronAPI.handleSideloadGameList((event, data) => {
    ShowIcon( '' );
    ShowStatus( 'sideload', 'transparent', 'Sideload: ready.' );
    //console.log( "Sideload games", flatten_object( data ));
    //console.log( "Sideload games", data );

    //var target = document.getElementById( 'itch-list' );
    var target = document.querySelector('#sideload-list');
    
    target.innerHTML = MultiTemplatier( 
        'template-sideload-list-item',   // template ID
        data,            // array of records
        function( idx, record, dataRecordArray) { // data tweaking callback
            console.log( record );
            // minor data tweaks
            record.idx = idx;
/*
            // some conditional stuff
            record[ 'game.author' ] = record[ 'game.user.display_name' ];
            if( record[ 'game.author' ] == undefined ) { 
                record[ 'game.author' ] = record[ 'game.user.username' ];
            }
     */       
            return record;
        }
    );


});

window.electronAPI.handleSideloadGameListFail((event, data) => {
    ShowIcon( '!' );
    ShowStatus( 'sideload', 'red', 'Sideload: game list failure.' );
});


function clickedSideloadItem( itemid )
{
    var button_sel = "sideload-item-" + itemid;

    var toggled = ElToggleClass( button_sel, 'selected' );
    if( toggled ) { 
        console.log( "SL: Is Now Selected", itemid );
    } else {
        console.log( "SL: Is Now unselected", itemid );
    }
}

