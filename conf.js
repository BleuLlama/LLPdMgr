
const os = require("os");
const fs = require('fs');


class LLSettings {
	constructor() {
		// load in the internal config file
		var internal_cfg = this.LoadConfig( "./config.json" );
		// attempt to load in the user config file
		var user_cfg = this.LoadConfig( internal_cfg.app.config );

		// merge them together
		this.cfg = Object.assign({}, internal_cfg, user_cfg )  
	}

	LoadConfig( fn, mergeFrom ) {
		var the_cfg = {}

		fn = fn.replace( "@HOME@", os.homedir() );
		if( !fs.existsSync( fn )) {
			console.log( "File not found: ", fn );
			return the_cfg;
		}

		try {
			const data = fs.readFileSync(fn, 'utf8');
			the_cfg = JSON.parse(data);
		} catch (err) {
			console.error(err);
		}
		return( the_cfg );
	}

	Get( key, defval )
	{
		// ignore initial slash
		if( key[0] == '/' ) {
			key = key.slice( 1 );
		}

		// split apart the key at / 
		var keysplitted = key.split( '/' );

		// load in the first object
		var v = this.cfg;

		// nest down iteratively
		for( var ki = 0 ; ki < keysplitted.length ; ki++ ) {
			if( !v.hasOwnProperty( keysplitted[ ki ] )) {
				// invalid key. return defval.
				return defval;
			}
			v = v[ keysplitted[ ki ] ]; // nest down
		}
		// got it. return it!
		return v;
	}


	test()
	{
		console.log( "LLsettings ", this.cfg );
		console.log( {
			"notthere" : this.Get( 'notthere', 'zero' ),
			"app/config" : this.Get( 'app/config', 'one' ),
			"app/conxxxfig" : this.Get( 'app/conxxxfig', 'two' ),
			"awwwpp/conxxxfig" : this.Get( 'awwwpp/conxxxfig', 'three' ),
			"/app/config" : this.Get( '/app/config', 'four' ),
			"app" : this.Get( 'app', 'five' ),
		});
	}
}
module.exports = LLSettings;