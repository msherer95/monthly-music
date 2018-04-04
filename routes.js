const routes = require('express').Router();
const spotifyCreds = require('./config/spotify-creds');
const request = require('request-promise-native');
const querystring = require('querystring');
const generateRandomString = require('./util/generateRandomString');
const spotify = require('./spotify');
const ticketmaster = require('./ticketmaster');
const mapquestCreds = require('./config/mapquest-creds');

const stateKey = 'spotify_auth_state';
let user_id;
let access_token;

routes.get('/', (req, res) => {
	res.sendFile(__dirname + '/dist/index.html');
})

routes.get('/login', (req, res) => {

	let state = generateRandomString(16);
	res.cookie(stateKey, state);

	// request authorization
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

routes.get('/options', (req, res) => {
	// request refresh and access tokens
	// after checking the state parameter
	let code = req.query.code || null;
	let state = req.query.state || null;
	let storedState = req.cookies ? req.cookies[stateKey] : null;

	if (state === null || state !== storedState) {
		res.redirect('/#' +
			querystring.stringify({
				error: 'state_mismatch'
			}));
	} else {
		res.clearCookie(stateKey);
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

		request.post(authOptions, (error, response, body) => {
			if (!error && response.statusCode === 200) {

				access_token = body.access_token,
					refresh_token = body.refresh_token;

				let options = {
					url: 'https://api.spotify.com/v1/me',
					headers: {
						'Authorization': 'Bearer ' + access_token
					},
					json: true
				};

				// use the access token to access the Spotify Web API
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

routes.get('/refresh_token', (req, res) => {

	// requesting access token from refresh token
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

// 42.276029,-71.244543
routes.get('/getConcerts', (req, res) => {
	request.get('https://www.mapquestapi.com/geocoding/v1/address?key='+mapquestCreds.consumer_key+'&inFormat=kvp&outFormat=json&location='+info.location+'&thumbMaps=false')
		.then(data => {
			let lat = JSON.parse(data).results[0].locations[0].latLng.lat.toString();
			let lng = JSON.parse(data).results[0].locations[0].latLng.lng.toString();
			let location = lat+','+lng;
			spotify.getAllPlaylists(user_id, access_token, location, info.radius, info.numMonths)
				.then(concerts => {
					let allConcerts = ticketmaster.extractConcerts(concerts);
					res.send(allConcerts);
				}, reason => {
					res.send(reason);
				}) 
		})
})

let info = {
	location: null,
	radius: null,
	numMonths: null
}

routes.get('/concerts', (req, res) => {
	info.location = req.query.location.toString();
	info.radius = req.query.radius.toString();
	info.numMonths = req.query.numMonths.toString();
	res.sendFile(__dirname+'/dist/concerts.html')
})

module.exports = routes;