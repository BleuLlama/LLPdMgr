
const HELPAPI_VERSION = "v0.01 / 2023-04-14";

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
		this.forceFromCache = llcfg.Get( 'app/forceFromCache');

		fs.mkdirSync( this.cachedir, { recursive: true }, (err) => {
			if (err) throw err;
		});
	}

	version( child_name, child_version )
	{
		let v = { 'APIHelper' : HELPAPI_VERSION };
		v[ child_name ] = child_version;

		return JSON.stringify( v, JSON );
	}

	slugify( txt ) 
	{
		let slug = txt.toLowerCase()
			.trim()
			.replace( /\//g, '-' )		// slashes become dashes
			.replace( /http[s]:/g, '' )	// remove http(s): remove
			.replace( /--/g, '-' )		// --+ becomes -
			.replace( /^-/, '' ) 		// remove - at beginning
			.replace( /-$/, '' )		// remove - at end
			;

		return slug;
	}

	filePathClean( filename ) 
	{
		let fn = filename
			.replace( /\/\//g, '/' )	// remove repeated slashes
			.replace( /\.\./g, '.' );	// remove repeted dottts
		return fn;
	}

	load( key, type )
	{
		if( type == undefined ) { type = 'json'; }

		// if not set, default to json
		if( type == undefined ) { type = 'json'; }

		// if the key starts with / take everything after that.
		if( key[0] == '/' ) { key = key.slice( 1 ) };

		// make the key a slugified form
		key = this.slugify( key );

		// build the destination path
		let filename = this.cachedir + '/';
		if( type == 'raw' ) {
			// raw is really text, but sidesteps the basename
			type = 'txt';
			filename += key + '.' + type;

		} else {
			//key = key.replace( '/', '-' );
			filename += this.save_basename + '-ajax-' 
						+ key + '.' + type;
		}

		// and clean the path.
		filename = this.filePathClean( filename );
		let filedata = undefined;

		try {
			filedata = fs.readFileSync( filename );
		} catch {
			filedata = undefined;
		}
		return filedata;
	}

	save( key, data, type )
	{
		// if not set, default to json
		if( type == undefined ) { type = 'json'; }

		// if the key starts with / take everything after that.
		if( key[0] == '/' ) { key = key.slice( 1 ) };

		// make the key a slugified form
		key = this.slugify( key );

		// build the destination path
		let filename = this.cachedir + '/';
		if( type == 'raw' ) {
			// raw is really text, but sidesteps the basename
			type = 'txt';
			filename += key + '.' + type;

		} else {
			//key = key.replace( '/', '-' );
			filename += this.save_basename + '-ajax-' 
						+ key + '.' + type;
		}
		// and clean the path.
		filename = this.filePathClean( filename );

		// data conversions.
		// if type is json, store it as such
		if( type == 'json' ) {
			data = JSON.stringify(data, null, 4);
		}

		// now write out the cache file
		//console.log( "Saving " + data.length + " bytes to " + filename );
		fs.writeFile( filename, data, err => {
			if (err) {
				console.error(err);
			}
		});
	}

	loadFromCache( key, callbackfn )
	{
		if( this.forceFromCache != true ) {
			return false;
		}

		console.log( "Loading from itch cache", key );

		var data = this.load( key );
		callbackfn( true, data );

		return true;
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


/*
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
	*/

	//-------------

	test()
	{
		console.log( "------ API TESTS -------" );
	}
}

module.exports = APIHelper;