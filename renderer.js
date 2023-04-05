
// handler for the app finishing loading
window.electronAPI.appFinishedStartup( (event, value ) => {

    // on app startup... get itch data
    INVOKE_ON_MAIN( 'refresh-itch-owned-data' );

});



// handler for itch login success
window.electronAPI.handleItchLoginSuccess((event, value) => {
    ElSetContent( 'itch-user-name', value.user.username );
    ElSetAttribute( 'itch-user-image', 'src', value.user.cover_url );
    ElRemoveClass( 'itch-status-pill', 'text-bg-info' );
    ElAddClass( 'itch-status-pill', 'text-bg-success' );
    ElSetContent( 'itch-status-pill', 'Itch.IO ready' );
});

// handler for itch login failure
window.electronAPI.handleItchLoginFail((event, value) => {
    ElRemoveClass( 'itch-status-pill', 'text-bg-info' );
    ElAddClass( 'itch-status-pill', 'text-bg-danger' );
    ElSetContent( 'itch-status-pill', 'Itch.IO login failure.' );
});


const refresh_itch_button = document.getElementById( 'refresh-itch' );
refresh_itch_button.onclick = function() {
    //INVOKE_ON_MAIN( 'refresh-itch-me' );
    INVOKE_ON_MAIN( 'refresh-itch-owned-data' );
}


window.electronAPI.handleItchOwnedDataFail((event, data) => {
    console.log( "updated fail" );
});

// handler for itch data
window.electronAPI.handleItchOwnedData((event, data) => {

    //var target = document.getElementById( 'itch-list' );
    var target = document.querySelector('#itch-list');

    target.innerHTML = MultiTemplatier( 
        'templte-itch-list-item',   // template ID
        data.owned_keys,            // array of records
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


function clickedListItem( itemid )
{
    var button_sel = "itch-item-" + itemid;

    var toggled = ElToggleClass( button_sel, 'selected' );
    if( toggled ) { 
        console.log( "Is Now Selected", itemid );
    } else {
        console.log( "Is Now unselected", itemid );
    }

}