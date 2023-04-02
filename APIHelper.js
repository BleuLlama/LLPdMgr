
const os = require("os");
const fs = require('fs');
const https = require("https");
const querystring = require("querystring");
var JSSoup = require('jssoup').default;


class APIHelper {
	constructor( llcfg ) {
		this.debug = false;
		this.save_basename = "XXXX";

		this.cachedir = llcfg.Resolve( 'app/cachedir' );
		fs.mkdirSync( this.cachedir, { recursive: true }, (err) => {
			if (err) throw err;
		});
	}

	save( key, data, type )
	{
		if( type == undefined ) { type = 'json'; }

		if( key[0] == '/' ) { key = key.slice( 1 ) };

		key = key.replace( '/', '-' );
		var filename = this.cachedir + '/' + this.save_basename + '-ajax-' + key + '.json';
		filename = filename.replace( '//', '/' );
		
		if( type == 'json' ) {
			data = JSON.stringify(data, null, 4);
		}

		fs.writeFile( filename, data, err => {
			if (err) {
				console.error(err);
			}
		});
	}

	objectToURLQuery( myData )
	{
		var out = [];

		for (var key in myData) {
			if (myData.hasOwnProperty(key)) {
				out.push(key + '=' + encodeURIComponent(myData[key]));
			}
		}

		return out.join('&');
	}

	OnSignIn( callbackfn ){

		// if we're already signed in, just call it.
		if( this.isSignedIn ) {
			callbackfn();
			return;
		}
		this.OnSignInFn = callbackfn;
	}

	SignIn( callbackfn )
	{
		// Sign in steps:
		//  1. GET the /signin/ page
		//  2. from there, get the value for "csrfmiddlewaretoken"
		//  3. POST to /signin/ page with:
		//  {
        //    "csrfmiddlewaretoken" : self.csrfmiddlewaretoken,
        //    "username" : self.conf[ 'sideload_user' ],
        //    "password" : self.conf[ 'sideload_pass' ]
        //  }
		//	 with headers:
		//	{
        //    "Referer": "https://play.date/signin/",
        //    "Content-Type": "application/x-www-form-urlencoded",
        // }
		//	4. retain the cookie/csrf for future use. (it sets a cookie that we pass around for api calls)
		var self = this;
		var page = this.getPdPage( '/signin/', function( success, data ) {
			if( success == false ) {
				//console.log( "Sideload: Failed initial connection." );
				callbackfn( false, 'Failed initial connection' );
				return;
			}

			// scrape the signin page for the token
			var soup = new JSSoup( data );
			var tags = soup.findAll( 'input' ).forEach( function( el ) {
				if( el.attrs.name == 'csrfmiddlewaretoken') {
					self.csrfmiddlewaretoken = el.attrs.value;
				}
			});

			if( self.csrfmiddlewaretoken == '' ) {
				callbackfn( false, 'Token not found on page.' );
				return;

			} else {
				self.postPdPage( "/signin/", function( success, data ) {

					if( self.isSignedIn == true ) {
						// ignore response
						callbackfn( false,  "Already signed in." );
						return;
					}

					if( !success ) {
						callbackfn( false, 'Signin failed' );
						return;

					} else {
						self.isSignedIn = true; // do this BEFORE the callback.  oops.
						callbackfn( true, 'Logged in ok.' );
						if( self.OnSignInFn ) {
							self.OnSignInFn();
						}
					}
				} );
			}
		} );
	}



	postPdPage( path, callbackfn )
	{
		this.postResponseAccumulator = ''; // reset the accumulator
		this.postResponse_contentlength = -1;

		if( this.debug ) console.log( "+++ postPdPage", path );
		var self = this;
		var postData = '';

		var formData = {
				"csrfmiddlewaretoken" : encodeURIComponent( this.csrfmiddlewaretoken ),
				"username" : encodeURIComponent( this.sl_user ),
				"password" : encodeURIComponent( this.sl_pass ),
				'DEBUG' : 'True'
			};
		
		postData = JSON.stringify(formData);
		postData = self.objectToURLQuery( formData );
			
		var options = {
			host: "play.date",
			port: 443,
			path: path,
			method: 'POST',
			headers: {
				"Cookie": "csrftoken=" + this.csrfmiddlewaretoken,
				"Referer": "https://play.date" + path,
				"Content-Type": "application/x-www-form-urlencoded",
				'Content-Length': Buffer.byteLength(postData),
				'DEBUG':'True'
			}
		};

		var request = https.request(options, function(response) {
			self.postResponse_contentlength = response.headers['content-length'];

			response.on('end', () => {
				callbackfn( true, self.postResponseAccumulator );
			});

			response.on('data', function(chunk) {
				if (!chunk) {
					return;
				}
				// accumulate page data returned...
				self.postResponseAccumulator += chunk.toString('utf8');
			});

		}).on("error", function(e) {
			// Some error handling
			callbackfn( false, e );
			return;
		});

		//optionally Timeout Handling
		request.on('socket', function(socket) {
			socket.setTimeout(5000);
			socket.on('timeout', function() {
				request.destroy();
			});
		});

		request.write(postData);
		request.end();
	}


	getPdPage( path, callbackfn )
	{
		this.getResponseAccumulator = ''; // reset the accumulator
		this.getResponse_contentlength = -1;

		if( this.debug ) console.log( "+++ getPdPage", path );

		var self = this;
		var options = {
			host: "play.date",
			port: 443,
			path: path,
			method: 'GET',
			headers: {
				"Referer": "https://play.date/" + path,
				//"Content-Type": "application/x-www-form-urlencoded",
				"Cookie": "csrftoken=" + this.csrfmiddlewaretoken,
				"DEBUG": "True"
			}
		};

		var request = https.get(options, function(response) {
			self.getResponse_contentlength = response.headers['content-length'];

			response.on('end', () => {
				callbackfn( true, self.getResponseAccumulator );
			});

			response.on('data', function(chunk) {
				console.log( "CHUNK", chunk.length );
				// accumulate page data returned...
				self.getResponseAccumulator += chunk.toString('utf8');
			});

		}).on("error", function(e) {
			// Some error handling
			callbackfn( false, e );
		});

		//optionally Timeout Handling
		request.on('socket', function(socket) {
			socket.setTimeout(5000);
			socket.on('timeout', function() {
				request.destroy();
			});
		});
		request.end();
	}

	//-------------

	test()
	{
		console.log( "------ API TESTS -------" );
	}
}

module.exports = APIHelper;