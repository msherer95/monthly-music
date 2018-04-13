const routes = require('express').Router(); // express router
const spotifyCreds = require('./config/spotify-creds'); // spotify API credentials
const request = require('request-promise-native'); // HTTP request module with built-in support for Promises
const querystring = require('querystring'); // helps with forming queries properly
const generateRandomString = require('./util/generateRandomString');
const spotify = require('./spotify'); // all spotify-related functions
const ticketmaster = require('./ticketmaster'); // all ticketmaster-related functions
const mapquestCreds = require('./config/mapquest-creds'); // mapquest API credentials

const stateKey = 'spotify_auth_state'; // required to maintain spotify session after login
// FIXME: remove all user_id variables, replace with 'me' string -- should work the same way for spotify requests
let user_id; // will store spotify userID
let access_token; // token for spotify requests

// send landing page
routes.get('/', (req, res) => {
	res.sendFile(__dirname + '/dist/index.html');
})

// login to spotify
routes.get('/login', (req, res) => {

	let state = generateRandomString(16); // store random string for state
	res.cookie(stateKey, state); // set stateKey cookie to random string

	// request authorization from spotify (user has to login with spotify)
	const scope = 'user-library-read user-read-email playlist-read-private playlist-read-collaborative';
	res.redirect('https://accounts.spotify.com/authorize?' +
		querystring.stringify({
			response_type: 'code',
			client_id: spotifyCreds.client_id,
			scope,
			redirect_uri: spotifyCreds.redirect_uri,
			state
		}));
});

// get concert options page (radius, location, time frame)
routes.get('/options', (req, res) => {

	let code = req.query.code || null; // code returned by spotify for all future requests
	let state = req.query.state || null; // state returned by spotify
	let storedState = req.cookies ? req.cookies[stateKey] : null; // state returned by cookie

	if (state === null || state !== storedState) {
		// handle missing state or cookie/spotify state mismatch
		res.redirect('/#' +
			querystring.stringify({
				error: 'state_mismatch'
			}));
	} else {
		res.clearCookie(stateKey); // remove state cookie
		let authOptions = {
			url: 'https://accounts.spotify.com/api/token',
			form: {
				code,
				redirect_uri: spotifyCreds.redirect_uri,
				grant_type: 'authorization_code'
			},
			headers: {
				'Authorization': 'Basic ' + (new Buffer(spotifyCreds.client_id + ':' + spotifyCreds.client_secret).toString('base64'))
			},
			json: true
		};

		// request access_token and refresh_token from spotify for all other requests
		request.post(authOptions, (error, response, body) => {
			if (!error && response.statusCode === 200) {
				access_token = body.access_token;
				let refresh_token = body.refresh_token;

				let options = {
					url: 'https://api.spotify.com/v1/me',
					headers: {
						'Authorization': 'Bearer ' + access_token
					},
					json: true
				};

				// get user_id for future requests and send options page
				request.get(options, (error, response, body) => {
					res.sendFile(__dirname+'/dist/options.html');
					user_id = body.id;
				});
			} else {
				res.redirect('/#' +
					querystring.stringify({
						error: 'invalid_token'
					}));
			}
		});
	}
});

// get refresh token from spotify to maintain session, Spotify boilerplate
routes.get('/refresh_token', (req, res) => {

	let refresh_token = req.query.refresh_token;
	let authOptions = {
		url: 'https://accounts.spotify.com/api/token',
		headers: {
			'Authorization': 'Basic ' + (new Buffer(spotifyCreds.client_id + ':' + spotifyCreds.client_secret).toString('base64'))
		},
		form: {
			grant_type: 'refresh_token',
			refresh_token
		},
		json: true
	};

	request.post(authOptions, (error, response, body) => {
		if (!error && response.statusCode === 200) {
			access_token = body.access_token;
			res.send({
				'access_token': access_token
			});
		}
	});
});

// get all concerts data
routes.get('/getConcerts', (req, res) => {

	// get lat/lng info from mapquest for user-entered zipcode 
	request.get('https://www.mapquestapi.com/geocoding/v1/address?key='+mapquestCreds.consumer_key+'&inFormat=kvp&outFormat=json&location='+req.query.location+'&thumbMaps=false')
		.then(data => {
			let lat = JSON.parse(data).results[0].locations[0].latLng.lat.toString(); // extract latitude
			let lng = JSON.parse(data).results[0].locations[0].latLng.lng.toString(); // extract longitude
			let location = lat+','+lng; // convert to comma separated string for ticketmaster requests
			
			// request concerts for all spotify artists -- returns Promise with ticketmaster concert data
			spotify.getAllPlaylists(user_id, access_token, location, req.query.radius, req.query.numMonths)
				.then(concerts => {
					let allConcerts = ticketmaster.extractConcerts(concerts); // cleanup concert data, transform into array of objects
					console.log('allConcerts: '+allConcerts);
					res.send(allConcerts); // respond with concert data
				}, reason => { // send error instead if error occurs
					res.send(reason);
				}) 
		})
})

// get concerts page 
routes.get('/concerts', (req, res) => {
	res.sendFile(__dirname+'/dist/concerts.html')
})

module.exports = routes;