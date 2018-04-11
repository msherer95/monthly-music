
module.exports = (numMonths) => {
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
	
	return endDateTime;
}