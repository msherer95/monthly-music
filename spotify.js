const request = require('request-promise-native');
const ticketmaster = require('./ticketmaster');

let storedArtists = []; // empty array of artists

/** 
* Extracts artist names from object containing track information for one Spotify request.
* The request will be for 0-100 songs. 
* @param {object} tracksData object containing track data for multiple tracks
*/
const extractArtists = (tracksData) => {

	let artistNames = [];

	let playlistItems = tracksData.items; // array of tracks

	// loop through each all tracks
	for (let j=0; j<playlistItems.length; j++) {
		let trackArtists = playlistItems[j].track.album.artists // array of artists for each track

		// loop through all artists of one track
		for (let a=0; a<trackArtists.length; a++) {
			let artistName = trackArtists[a].name; // artist name
			// add artist name to tracks array as long as it's not "Various Artists"
			// these come up when Spotify has deleted a track, but a user still has it saved
			if (artistName != "Various Artists") {
				artistNames.push(artistName);
			}
		}
	}
	
	// add all extracted artist names to stored array of artists from previous Spotify requests
	// remove all duplicate artist names 
	// creates completely unique array of artist names to prevent multiple concert searches for the same artist
	let uniqueTracks = [...new Set(storedArtists.concat(artistNames))];
	let storedArtistCount = storedArtists.length; // length of stored artists before new artist names were added
	storedArtists = uniqueTracks.slice(0); // store new array of unique tracks

	// returns unique array of artist names, including only artists from current Spotify request
	// artist names from previous requests (found in storedArtists array) are excluded
	return uniqueTracks.slice(storedArtistCount)
}

/** 
* Spotify limits the number of tracks that can be fetched with a single request to either 50 or 100,
* for 'saved tracks' and all other playlists, respectively. This method uses a loop to fetch all
* chunks of a single playlist, via multiple requests. It aggregates an array of Promises for all 
* ticketmaster artist IDs (which themselves return Promises for all ticketmaster concerts) for all
* artists in all chunks of a playlist.  
* @param {integer} total total number of songs on a playlist
* @param {string} access_token spotify token for all authenticated requests
* @param {string} url endpoint for tracks of a specific playlist
* @param {integer} limit maximum number of tracks to fetch in single request (limited by Spotify)
* @param {string} location (lat,lng) user location, converted from zipcode
* @param {string} radius how many miles around zipcode to search for concerts
* @param {string} numMonths number of months to limit farthest possible concert date 
*/
const getAllChunks = (total, access_token, url, limit=100, location, radius, numMonths) => {
    let allConcertPromises = []; // empty allConcertPromises
    let offset = 0; // start at first track of playlist

	// loop through playlist until all chunks are fetched
	while (total > offset) {
		let chunkOptions = {
			url: url + "?limit=" + limit + "&offset=" + offset,
			headers: { 'Authorization': 'Bearer ' + access_token },
			json: true
		}

		// get Promise for all concerts for one chunk of artists
		let concertPromises = ticketmaster.getConcerts(chunkOptions, location, radius, numMonths);
		allConcertPromises.push(concertPromises); // add all concert Promises to one array
		offset +=limit; // increase starting track to fetch next chunk
	}
	
	return allConcertPromises
}

/** 
* Sends requests for all concerts for all artists on a user's Saved Tracks
* @param {string} location (lat,lng) user location, converted from zipcode
* @param {string} radius how many miles around zipcode to search for concerts
* @param {string} numMonths number of months to limit farthest possible concert date 
*/
const getSavedTracks = (access_token, location, radius, numMonths) => {

    savedTrackOptions = {
        url: 'https://api.spotify.com/v1/me/tracks?limit=50',
        headers: { 'Authorization': 'Bearer ' + access_token },
		json: true,
    }

	// makes initial request to saved tracks to determine playlist size
	return request.get(savedTrackOptions).then(body => {
		// then get all chunks of saved tracks (all songs on saved tracks playlist)
		return getAllChunks(body.total, access_token, 'https://api.spotify.com/v1/me/tracks', 50, location, radius, numMonths)
	})
}

/** 
* Main spotify function. Sends requests for all playlist, artist names,
* and eventually ticketmaster concerts for those artists. Collects a set
* of nested Promise arrays that eventually resolve to an array of all concert data.
* Nested promises are used to minimize any synchronicity and instead send out all 
* requests as soon as possible and capture their results as soon as they're all available. 
* @param {string} user_id spotify account userID 
* @param {string} access_token spotify token for all authenticated requests
* @param {string} location (lat,lng) user location, converted from zipcode
* @param {string} radius how many miles around zipcode to search for concerts
* @param {string} numMonths number of months to limit farthest possible concert date 
*/
const getAllPlaylists =  (user_id, access_token, location, radius, numMonths) => {

	storedArtists = []; // make sure storedArtists are empty

	// Spotify saved tracks have a different endpoint from all other playlists
	// Get all artists from saved tracks
	let savedTracks = getSavedTracks(access_token, location, radius, numMonths);

	let options = {
        url: 'https://api.spotify.com/v1/users/'+user_id+'/playlists',
        headers: { 'Authorization': 'Bearer ' + access_token },
		json: true,
	}
	
	// Get all concerts for artists from all Spotify playlists
	// First request array of all playlist endpoints
	let allConcerts = request.get(options).then(body => {
		let playlists = body.items; // array of playlists

		// request tracks for each playlist
		// returns array of promises, each promising to get all chunks of each playlist 
		return playlists.map(playlist => {

			let options = {
				url: playlist.href +'/tracks',
				headers: { 'Authorization': 'Bearer ' + access_token },
				json: true,
			};

			// make initial request for playlist tracks to figure out playlist size
			return request.get(options).then(body => {
				// then get all playlist chunks (all playlist tracks) 
				return getAllChunks(body.total, access_token, options.url, 100, location, radius, numMonths);
			})
		}).concat(savedTracks) // concat Promise to get all chunks of saved tracks
	})

	// allConcerts first returns array of Promises to process each playlist
	return allConcerts.then(playlistPromises => {
		// those Promises return another array of Promises to process all chunks (tracks) of each playlist
		return Promise.all(playlistPromises).then(chunks => {
			// those Promises then return an array of Promises for all concerts for all artists
			return Promise.all([].concat.apply([], chunks)).then(ticketmasterConcertPromises => {
				// last Promise.all finally returns a single Promise for an array of all ticketmaster concerts
				return Promise.all([].concat.apply([], ticketmasterConcertPromises))
			})
		})
	})
}

module.exports.extractArtists = extractArtists;
module.exports.getAllPlaylists = getAllPlaylists;