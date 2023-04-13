
//const os = require("os");
//const fs = require('fs');
//const https = require("https");
//const querystring = require("querystring");

let fetchCookie = require( 'fetch-cookie' );
let nodeFetch = require( 'node-fetch' );
const { JSDOM } = require( 'jsdom' );
 
const fetch = fetchCookie(nodeFetch);

let JSSoup = require('jssoup').default;

let APIHelper = require("./APIHelper");

// inspiration and pointers provided by
// https://github.com/ericlewis/playdate-itchio-sync/blob/main/src/playdate.js

class SideloadAPI extends APIHelper {
	constructor( llcfg ) {
		super( llcfg );

		this.save_basename = 'sideload';

		this.sl_user = llcfg.Get( 'credentials/panic.sideload/user' );
		this.sl_pass = llcfg.Get( 'credentials/panic.sideload/pass' );

		this.csrfmiddlewaretoken = '';
		this.isSignedIn = false;
		this.logintext = '';

		this.debug = false;
	}

	async SignIn( callbackfn ) {

		try {
			let body = await this.getPage( 'https://play.date/signin/' );
			
			// Get the csrf token
			const dom = new JSDOM(body);
			this.csrfmiddlewaretoken = dom.window.document
				.querySelector(`input[name="csrfmiddlewaretoken"]`)
				.getAttribute("value");

			console.log( 'csrf=', this.csrfmiddlewaretoken );

			// send the form to log in
			console.log( "Sending login form..." );
			this.logintext = await this.__submitLoginForm(this.sl_user, this.sl_pass);
			console.log( "Got signin response" );

			const dom_loggedin = new JSDOM( this.logintext );
			this.save( "https://play.date/signin/", this.logintext, 'raw' );

			let data = {
				message: 'Login OK',
				username: dom_loggedin.window.document
					.querySelector(`input[name="username"]`)
					.getAttribute("value"),
				cover_url: dom_loggedin.window.document
					.querySelector(`link[rel="apple-touch-icon"]`)
					.getAttribute("href"),
			};
			return callbackfn( true, data );
		}
		catch(exception){
			console.log(exception);
			return callbackfn( false, "Couldn't Sign in" );
		}
	}

	async __submitLoginForm(username, password) {
		const body = new URLSearchParams();
		body.append("csrfmiddlewaretoken", this.csrfmiddlewaretoken);
		body.append("username", username);
		body.append("password", password);
	  
		const response = await fetch("https://play.date/signin/", {
		  body: body.toString(),
		  method: "POST",
		  headers: {
			Referer: "https://play.date/signin/",
			"Content-Type": "application/x-www-form-urlencoded",
		  },
		});

		let bodyText = await response.text();
		this.isSignedIn = true;

		return bodyText;
	}

	async getPage( url ) {
		let pageContent = '';
		try {
			let response = await fetch( url );
			pageContent = await response.text();
		} catch( err ) {
			pageContent = err;
		}

		return pageContent;
	}
	
	__scrape_account_sideload( pageText )
	{
		let records = [];

		let dom = new JSDOM( pageText );
		let cards = dom.window.document.querySelector( "ul.sideloadGameCards" ).children;

		for( let idx = 0; idx < cards.length; idx++ ) {
			let card = cards[idx];
			let record = {};

			// get the game id
			record.gameid = card.getAttribute( 'id' );
			//if( record.gameid != 'game44819' ) { continue; }

			// now get the game link.
			let card_a = card.querySelector( 'a' );
			record.game_details_href = card_a.getAttribute( 'href' );

			records.push( record );
		}
		return records;
	}


	async getSingleGameDetails( url, grec )
	{
		let grec_url = "https://play.date/" + (grec.game_details_href).replace( /^\//, '' );
		let gameInfoText = this.load( grec_url, 'raw' );

		if( gameInfoText == undefined ) {
			// couldn't load it.  retrieve it from the website
			gameInfoText = await this.getPage( grec_url );
			this.save( grec_url, gameInfoText, 'raw' );
		}

		let dom = new JSDOM( gameInfoText );
		let section = dom.window.document.querySelector( "section.sideloadGame.solo" );

		grec.id = section.getAttribute( 'id' );
		grec.title = section.querySelector( 'h2.sideloadGameTitle' )
						.textContent		// text!
						.trim();			// chop whitespace before and after

		grec.developer = section.querySelector( '.sideloadGameDeveloper' )
						.textContent			// text!
						.trim()					// chop whitespace before and after
						.replace( /^by /, '' ); // want only the name(s)
			// note: this tag is misbalanced.  <h3> ... </h2>

		// get the thumbnail image url
		grec.imageUrl = section.querySelector( '.sideloadGameCardImage' )
			.getAttribute( 'style' ) 	// image url is background in style="...."
			.split( "url('" )[1]		// everything after "url'"
			.split( "'" )[0];		    // everything before "'"
			// note: the page is generated without the trailing single quote. url('htt...)

		// now get the list of builds available
		let pageBuilds = section.querySelector( 'div.dashboard.game-list' ).children;
		let builds = [];

		for( let bidx=0 ; bidx < pageBuilds.length ; bidx++ )
		{
			let bbb = pageBuilds[ bidx ];

			let build = {
				date: bbb.querySelector( 'dd.game-date' ).textContent.trim(),
				version: bbb.querySelector( 'dd.game-version' ).textContent.trim(),
				removeurl: bbb.querySelector( 'a.action.remove' ).getAttribute( 'href')
			};
			builds.push( build );
		}

		// and add it to the grec!
		grec.builds = builds;

		return grec;
	}

	async __fillInSideloadDetails( game_records )
	{
		for( let idx = 0 ; idx < game_records.length ; idx++ ) {
			if( this.debug && idx > 10 ) { continue; }
			//if( game_records[idx].gameid != 'game44819' ) { continue; }
			let newRec = await this.getSingleGameDetails( game_records[idx].game_details_href, game_records[idx] );

			game_records[ idx ] = await newRec;
		}
		return await game_records;
	}

	dumpGrecs( grecs )
	{
		for( let gidx = 0 ; gidx < grecs.length ; gidx++ ) {
			let grec = grecs[gidx];

			console.log( "====== " + grec.title );
			console.log( "     id: " + grec.id );
			console.log( "    dev: " + grec.developer );
			console.log( "  image: " + grec.imageUrl );
			console.log( " builds: "  );
			for( let idx=0 ; idx < grec.builds.length ; idx++ ) {
				let b = grec.builds[ idx ];
				console.log( "        ", b.date, b.version, b.removeurl );
			}
		}
	}
	
	async getSideloads( callbackfn ) {
		let games = [];
		console.log( "in getSideLoads()" );

		let url =  "https://play.date/account/sideload/";
		let pageText = await this.getPage( url );
		//callbackfn( true, pageText );
		this.save( url, pageText, 'raw' );
		let sideload_records = await this.__scrape_account_sideload( pageText );

		sideload_records = await this.__fillInSideloadDetails( sideload_records );
		
		// sort by .title
		let sorted_game_records = sideload_records.sort(function(a,b){
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

		this.save( "sorted_game_records", sorted_game_records );
		callbackfn( true, sorted_game_records );
		
		return sorted_game_records;
	}


	uploadGame(path) {
	  const token = this.csrfmiddlewaretoken; //this.getCSRF("https://play.date/account/sideload/");
	
	  const body = new FormData();
	  body.set("csrfmiddlewaretoken", token);
	  body.set("file", fileFromPath(path));
	
	  return fetch("https://play.date/account/sideload/", {
		method: "POST",
		body,
		headers: {
		  Referer: "https://play.date/account/sideload/",
		},
	  });
	}

	
	//-------------


	async test()
	{
		console.log( "------ SIDELOAD TESTS -------" );
		let self = this;

		console.log( "signing in..." );

		let siret = await this.SignIn( function( status, message ) {
			console.log( "Signin() callback" );
			console.log( "SignIn: ", status );
			console.log( "Message: ", message );
			console.log( "Is Signed In", self.isSignedIn );

		} );
		
		console.log( "Logged in done!" );

		let games = self.getSideloads( function( status, message ) {
			console.log( "GSL ", status, message );
		});

		//console.log( games );
		
	}
}

module.exports = SideloadAPI;
