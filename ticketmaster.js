const request = require('request-promise-native');
const spotify = require('./spotify');
const ticketmasterCreds = require('./config/ticketmaster-creds');
const qs= require('qs');

//let consumerKeyIndex = 0;
//let consumerKeyLength = ticketmasterCreds.consumer_key.length;

const getConcerts = (chunkOptions, location, radius, numMonths) => {
	return request.get(chunkOptions).then(data => {
		let artists = spotify.extractArtists(data);
		return artists.map(artist => {

			//consumerKeyIndex++;

			let options = {
				uri: 'https://app.ticketmaster.com/discovery/v2/attractions.json?'+qs.stringify({
					apikey: ticketmasterCreds.consumer_key,
					classificationName: 'music', 
					keyword: artist
				}),
				json: true,
			}
			
			return request.get(options).then(data => {
				if (Object.keys(data).indexOf('_embedded') != -1 && data._embedded.attractions[0].upcomingEvents._total > 0) {
					let attraction = data._embedded.attractions[0];
					if (attraction.upcomingEvents._total > 0) {
						
					}
					for (let i=0; i<data._embedded.attractions.length; i++) {
						if (data._embedded.attractions[i].name.toLowerCase() == artist.toLowerCase()) {
							attraction = data._embedded.attractions[i];
						}
					}

					let attraction_id = attraction.id;
					let d = new Date();
					let day = d.getDate();
					let month = parseInt(d.getMonth())+parseInt(numMonths);
					let addToYear = Math.floor(month / 11);
					month = month % 12 + 1;

					if (month == 2) {
						day = day > 28 ? 28 : day;
					} else {
						day = day > 30 ? 30 : day
					}

					day = parseInt(day) < 10 ? '0' + day.toString() : day.toString();

					month = month<10 ? '0'+month.toString() : month.toString();

					let year = parseInt(d.getFullYear()) + addToYear;

					let endDateTime = year + '-' + month + '-' + day + 'T00:00:00Z';
					console.log('endDateTime: '+endDateTime);
					//consumerKeyIndex++;

					let options = {
						uri: 'https://app.ticketmaster.com/discovery/v2/events.JSON?apikey='+ticketmasterCreds.consumer_key+'&unit=miles'+'&latlong='+location+'&endDateTime='+endDateTime+'&radius='+radius+'&attractionId='+attraction_id+"&classificationName=music",
						json: true,
					}
					return request.get(options);
				} else {
					return []
				}
			})
		});
	})
}

const extractConcerts = (concerts) => {
	let allConcerts = [];
	for(let i=0; i<concerts.length; i++) {
		if (Object.keys(concerts[i]).indexOf('_embedded') != -1) {
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

	for(let i=0; i<allConcerts.length; i++) {
		let concert = allConcerts[i];
		for (let j=i+1; j<allConcerts.length; j++) {
			if (concert.name == allConcerts[j].name && concert.date == allConcerts[j].date) {
				allConcerts.splice(j, 1);
			}
		}
	}

	return allConcerts
}

module.exports.getConcerts = getConcerts;
module.exports.extractConcerts = extractConcerts;