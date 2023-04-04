

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
    window.api.invoke('refresh-itch-data', [1,2,3]);
}
// handler for itch data
window.electronAPI.handleItchData((event, data) => {
    console.log( "renderer Handle Itch Data", data );
    games = data.games;

    for( var i = 0 ; i < games.length ; i++ ) {    

        games[i].idx = i;
        console.log( games[i].user );

        var itm = templatier( 'templte-itch-list-item',games[i ] );
        console.log( itm );
    }
});

function templatier( template_sel, data )
{
    var template =  document.getElementById( template_sel );

}