const request = require('request-promise-native');
const ticketmaster = require('./ticketmaster');

let storedArtists = [];

const extractArtists = (data) => {

	let tracks = [];

	let playlistItems = data.items;
	for (let j=0; j<playlistItems.length; j++) {
		let trackArtists = playlistItems[j].track.album.artists

		for (let a=0; a<trackArtists.length; a++) {
			let artistName = trackArtists[a].name;
			if (artistName != "Various Artists") {
				tracks.push(artistName);
			}
		}
	}
	
	let uniqueTracks = [...new Set(storedArtists.concat(tracks))];
	let storedArtistCount = storedArtists.length;
	storedArtists = uniqueTracks.slice(0);
	return uniqueTracks.slice(storedArtistCount)
}

const getAllChunks = (total, access_token, url, limit=100, location, radius, numMonths) => {
    let allConcertPromises = [];
    let offset = 0;


	while (total > offset) {
		let chunkOptions = {
			url: url + "?limit=" + limit + "&offset=" + offset,
			headers: { 'Authorization': 'Bearer ' + access_token },
			json: true
		}

		let concertPromises = ticketmaster.getConcerts(chunkOptions, location, radius, numMonths);
		allConcertPromises.push(concertPromises);
		offset +=limit;
	}
	
	return allConcertPromises
}

const getSavedTracks = (access_token, location, radius, numMonths) => {

    savedTrackOptions = {
        url: 'https://api.spotify.com/v1/me/tracks?limit=50',
        headers: { 'Authorization': 'Bearer ' + access_token },
		json: true,
    }

	return request.get(savedTrackOptions).then(body => {
		return getAllChunks(body.total, access_token, 'https://api.spotify.com/v1/me/tracks', 50, location, radius, numMonths)
	})
}

const getAllPlaylists =  (user_id, access_token, location, radius, numMonths) => {

	storedArtists = [];
	let savedTracks = getSavedTracks(access_token, location, radius, numMonths);

	let options = {
        url: 'https://api.spotify.com/v1/users/'+user_id+'/playlists',
        headers: { 'Authorization': 'Bearer ' + access_token },
		json: true,
	}
	
	let allConcerts = request.get(options).then(body => {
		let playlists = body.items;
		return playlists.map(playlist => {

			let options = {
				url: playlist.href +'/tracks',
				headers: { 'Authorization': 'Bearer ' + access_token },
				json: true,
			};

			return request.get(options).then(body => {
				return getAllChunks(body.total, access_token, options.url, 100, location, radius, numMonths);
			})
		}).concat(savedTracks)
	})

	return allConcerts.then(data => {
		return Promise.all(data).then(newData => {
			return Promise.all([].concat.apply([], newData)).then(moreData => {
				return Promise.all([].concat.apply([], moreData))
			})
		})
	})
}

module.exports.extractArtists = extractArtists;
module.exports.getAllPlaylists = getAllPlaylists;