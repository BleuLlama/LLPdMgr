
const ITCHAPI_VERSION = "v0.01 / 2023-04-14";


//const os = require("os");
//const fs = require('fs');
const https = require("https");
const querystring = require("querystring");
var APIHelper = require("./APIHelper");


class ItchAPI extends APIHelper {
	constructor( llcfg ) {
		super( llcfg );

		this.save_basename = 'itch';
		this.itch_api = llcfg.Get( 'credentials/itch.io/iapikey' );
	}

	version()
	{
		return super.version( this.constructor.name, ITCHAPI_VERSION );
	}

	api( endpoint, callbackfn, getOrPost, querydata )
	{
		if( this.loadFromCache( endpoint, callbackfn )) {
			return;
		}
		if( getOrPost == undefined ) { getOrPost = 'GET'; }
		if( querydata == undefined ) { querydata = {}; }

		var self = this;
		var postData = querystring.stringify( querydata );

		// Your Request Options
		var options = {
			host: "itch.io",
			port: 443,
			path: "/api/1/" + this.itch_api + endpoint, //"/me",
			method: getOrPost,
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
				'Content-Length': Buffer.byteLength(postData)
			}
		};

		// The Request
		var request = https.request(options, function(response) {
			response.on('data', function(chunk) {
				if (chunk) {
					var rxdata = chunk.toString('utf8');
					var ob =  JSON.parse( rxdata );
					self.save( endpoint, ob );

					callbackfn( true, ob );

				}
			});

		}).on("error", function(e) {
			// Some error handling
			callbackfn( false, e );
		});

		//optionally Timeout Handling
		request.on('socket', function(socket) {
			socket.setTimeout(5000);
			socket.on('timeout', function() {
				request.abort();
			});
		});

		request.write(postData);
		request.end();
	}


	// https://itch.io/docs/api/serverside
	GetMe( callbackfn ) {
		this.api( '/me', function( success, data ) {
			callbackfn( success, data );
		});
	}


	GetMyGames( callbackfn ) {
		// these seem to be games that the user published
		this.api( '/my-games', function( success, data ) {
			callbackfn( success, data );
		});
	}

	GetMyOwnedKeys( callbackfn ) {
		// these seem to be games that the user published
		this.api( '/my-owned-keys', function( success, data ) {
			console.log( data.owned_keys[0].title );

			var sorted = [];

			// sort by .title
			let sorted_game_records = data.owned_keys.sort(function(a,b){
				if( a.title == undefined || b.title == undefined ) { return 0; }
				// here a , b is whole object, you can access its property
				//convert both to lowercase
				let x = a.title.toLowerCase();
				let y = b.title.toLowerCase();
			
				//compare the word which is comes first
				if(x>y){return 1;} 
				if(x<y){return -1;}
				return 0;
			});

			
			data.owned_keys = sorted_game_records;
			callbackfn( true, sorted_game_records );

			/*
			data.owned_keys.forEach( function( val, idx ) {
				console.log( idx, val  );
			});
			*/

		});
	}

	// get owned keys
	// get owned game
	// get game data via game id


	//https://itch.io/api/1/KEY/game/GAME_ID/download_keys
	GetMyDownloadKeys( callbackfn ) {
		this.api( '/game/ID/download_keys', function( success, data ) {
			callbackfn( success, data );
		});
	}

	// https://itch.io/api/1/KEY/game/GAME_ID/purchases

	test()
	{
		this.GetMe( function( success, data ) {
			if( success ) { 
				console.log( "++ GetMe", data );
			} else {
				console.log( "-- GetMe FAIL." );
			}
		});

		this.GetMyOwnedKeys( function( success, data ) {
			if( success ) { 
				console.log( "++ GetMyOwnedKeys", data );
			} else {
				console.log( "-- GetMyOwnedKeys Fail." );
			}
		});

		this.GetMyDownloadKeys( function( success, data ) {
			if( success ) { 
				console.log( "++ GetMyDownloadKeys", data );
			} else {
				console.log( "-- GetMyDownloadKeys Fail." );
			}
		});

		/*
		this.api( '/me', function( success, data ) {
			if( success ) { 
				console.log( "++ SUCCESS", data );
			} else {
				console.log( "-- ANTISUCCESS" );
			}
		});
		*/
	}

	test2()
	{
		//console.log( "itch api test " , this.itch_user, this.itch_pass );

		// You Key - Value Pairs
		var postData = querystring.stringify({

			username: this.itch_user,
			password: this.itch_pass,
			source: "desktop"

		});


		// Your Request Options
		var options = {

			host: "itch.io",
			port: 443,
			path: "/api/1/" + this.itch_api + "/me",
			method: 'GET',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
				'Content-Length': Buffer.byteLength(postData)
			}
		};


		// The Request
		var request = https.request(options, function(response) {
			response.on('data', function(chunk) {
				if (chunk) {
					var data = chunk.toString('utf8');
					// holds your data
					console.log( "RECEIVE", data );
				}
			});

		}).on("error", function(e) {
			// Some error handling
			console.log( "ERROR" );

		});


		//optionally Timeout Handling
		request.on('socket', function(socket) {
			socket.setTimeout(5000);
			socket.on('timeout', function() {
				request.abort();
			});
		});

		request.write(postData);
		request.end();

 
	}
}

module.exports = ItchAPI;