const request = require('request-promise-native');
const spotify = require('./spotify');
const ticketmasterCreds = require('./config/ticketmaster-creds');
const qs= require('qs');
const formatDate = require('./util/formatDate');

/*  Ticketmaster has a quota of 5,000 requests per day. To increase
 quota, getConcerts cycles through an array of API keys, all of which
 give an extra 5,000 requests per day.  */

let consumerKeyIndex = 0; // start with first API key
let consumerKeyLength = ticketmasterCreds.consumer_key_all.length; // total number of API keys


/** 
 * Requests a chunk of tracks from a Spotify playlist. Then requests
 * ticketmaster artist IDs for all artists from those tracks, and requests
 * all concerts for those artists.
 * @param {Object} chunkOptions request options to fetch a chunk of tracks from one playlist
 * @param {string} location (lat,lng) user location, converted from zipcode
 * @param {string} radius how many miles around zipcode to search for concerts
 * @param {string} numMonths number of months to limit farthest possible concert date 
*/
const getConcerts = (chunkOptions, location, radius, numMonths) => {

	// request chunk of tracks for single Spotify playlist
	return request.get(chunkOptions).then(tracks => {
		let artists = spotify.extractArtists(tracks); // array of artist names

		// request artist_ID, then concert data for each artist
		return artists.map(artist => {
			consumerKeyIndex++; // use next API key
			let options = {
				uri: 'https://app.ticketmaster.com/discovery/v2/attractions.json?'+qs.stringify({
					apikey: ticketmasterCreds.consumer_key_all[consumerKeyIndex % consumerKeyLength],
					classificationName: 'music', 
					keyword: artist
				}),
				json: true,
			}
			
			// request artist_ID for an artist
			return request.get(options).then(artists => {

				// check if ticketmaster found any artists
				let artistsExist = Object.keys(artists).indexOf('_embedded') !== -1;

				// check if there's any upcoming events for the artists, given the artist exists
				let hasUpcomingEvents = artistsExist ? artists._embedded.attractions[0].upcomingEvents._total > 0 : false;

				// request concert information if an artist was found with upcoming events
				if (artistsExist && hasUpcomingEvents) {
					let attraction_id = extractArtistID(artists, artist); // find proper ticketmaster artist whose name exactly matches Spotify artist
					let endDateTime = formatDate(numMonths);
					consumerKeyIndex++;

					let options = {
						uri: 'https://app.ticketmaster.com/discovery/v2/events.JSON?apikey='+ticketmasterCreds.consumer_key_all[consumerKeyIndex % consumerKeyLength]+'&unit=miles'+'&latlong='+location+'&endDateTime='+endDateTime+'&radius='+radius+'&attractionId='+attraction_id+"&classificationName=music",
						json: true,
					}
					return request.get(options); // Promise for concert data
				} else {
					// empty array will instantly resolve in a Promise.all
					// without returning empty array, Promise.all will fail to
					// resolve "undefined" created by .map method
					return []
				}
			})
		});
	})
}

/**
 * Finds artist_ID for correct tickmaster artist. Searching ticketmaster
 * for a Spotify artist returns multiple matching and semi-matching 
 * artists. This finds which ticketmaster result exactly matches the Spotify artist name. 
 * @param {Array} ticketmasterArtists Ticketmaster artist search results 
 * @param {string} artist Spotify artist name
 * @returns {string} artist ID of best-matching Ticketmaster artist
*/
const extractArtistID = (ticketmasterArtists, artist) => {
	let attraction = ticketmasterArtists._embedded.attractions[0]; // assume first result best matches Spotify artist name
	let totalAttractions = ticketmasterArtists._embedded.attractions.length;

	// check all Ticketmaster results for a better match
	for (let i=0; i<totalAttractions; i++) {
		let ticketmasterName = ticketmasterArtists._embedded.attractions[i].name;

		// save Ticketmaster artist if Ticketmaster and Spotify artist names match
		if (ticketmasterName.toLowerCase() == artist.toLowerCase()) {
			attraction = ticketmasterArtists._embedded.attractions[i];
		}
	}

	return attraction.id; // ID of perfectly matching Ticketmaster artist
}

/**
 * Extracts specific concert information from array of objects containing
 * all concert information from Ticketmaster.
 * @param {Array} concerts concerts found for each artist
 * @returns {Array} event information for each upcoming concert
 */
const extractConcerts = (concerts) => {
	let allConcerts = [];

	// loop through concerts for each artist
	for(let i=0; i<concerts.length; i++) {
		let concertsExist = Object.keys(concerts[i]).indexOf('_embedded') != -1;
		if (concertsExist) {
			// save event info for all events for a single artist
			for (let j=0; j<concerts[i]._embedded.events.length; j++) {
				let event = concerts[i]._embedded.events[j];

				let eventInfo = {
					name: event.name,
					url: event.url, 
					distance: event.distance,
					image: event.images[0].url,
					date: event.dates.start.dateTime,
					link: concerts[i]._links.self.href
				}

				allConcerts.push(eventInfo);
			}
		}
	}

	// make sure all concerts are unique, matching by name & date
	for(let i=0; i<allConcerts.length; i++) {
		let concert = allConcerts[i];
		for (let j=i+1; j<allConcerts.length; j++) {
			if (concert.name == allConcerts[j].name && concert.date == allConcerts[j].date) {
				allConcerts.splice(j, 1); // remove concert if it's not unique
			}
		}
	}

	return allConcerts // array of info for all unique concerts
}

module.exports.getConcerts = getConcerts;
module.exports.extractConcerts = extractConcerts;