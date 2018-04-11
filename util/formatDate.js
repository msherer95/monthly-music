
/**
 * Formats date some numMonths from today's date for Ticketmaster requests.
 * @param {string} numMonths number of months to limit farthest possible concert date 
 * @returns {string} formatted date some numMonths in the future
 */
module.exports = (numMonths) => {
	let d = new Date();
	let day = d.getDate(); 
	let month = parseInt(d.getMonth())+parseInt(numMonths); // month in the future (0-11)
	let addToYear = Math.floor(month / 11); // in case end date is not in current year
	month = month % 12 + 1; // accounts for months in future years, now using (1-12) system

	// account for February and months with 31 days
	if (month == 2) {
		day = day > 28 ? 28 : day;
	} else {
		day = day > 30 ? 30 : day
	}

	// convert month and day to 2-digit format if <10 (e.g. 02 vs. 2)
	day = parseInt(day) < 10 ? '0' + day.toString() : day.toString();
	month = month < 10 ? '0'+month.toString() : month.toString();

	let year = parseInt(d.getFullYear()) + addToYear; // make sure future year is used if necessary
	let endDateTime = year + '-' + month + '-' + day + 'T00:00:00Z'; // format for Ticketmaster
	
	return endDateTime;
}