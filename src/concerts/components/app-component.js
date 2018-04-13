import $ from 'jquery';
import React from 'react';
import {Loader} from './loader-component'; // loading screen component
import {ConcertBlock} from './concert-block-component' // concert blocks
import {Error} from './error-component'; // error screen components

export class App extends React.Component {

	constructor(props) {
		super(props);
		this.state = {concerts: null} // intialize empty concerts state
	}

	// get concerts data once App is mounted
	componentDidMount() {
		let urlParams = new URLSearchParams(window.location.search); // query parameters
		let location = urlParams.get('location'); // location parameter
		let radius = urlParams.get('radius'); // radius parameter
		let numMonths = urlParams.get('numMonths'); // numMonths parameter
		let url = '/getConcerts?location=' + location + "&radius=" + radius + "&numMonths=" + numMonths;
		$.get(url, (data) => {
			console.log(data);
			this.setState({concerts: data}) // change state.concerts to concerts array
		})
	}

	render() {

		let toBeRendered; // initialize empty block for JSX to be rendered

		if (!this.state.concerts) { // if concerts data is still empty

			// render loading screen
			toBeRendered = (<div>
				<h1 id="title">Upcoming Concerts</h1>
				<p id="subtitle">Try refreshing if this page is taking too long</p>
				<Loader />
			</div>)
			// display different error screens if an error occurs
		} else if (this.state.concerts.name == "StatusCodeError") {
			toBeRendered = <Error error={this.state.concerts.statusCode} />
		} else if (this.state.concerts.name == "RequestError") {
			toBeRendered = <Error error={443} />
		} else if (this.state.concerts.error) {
			toBeRendered = <Error error={500} />
		} else if (this.state.concerts == "") {
			toBeRendered = <Error error={600} />
		} else { // display concerts if concerts data is succesfully fetched
			toBeRendered = (<div>
				<h1 id="title">Upcoming Concerts</h1>
				<p id="subtitle">Click to redirect to ticketmaster.com</p>
				{this.state.concerts.map((concert, index) => {
				return <ConcertBlock concert={concert} key={index} index={index} />
				})}
			</div>)
		}

		return toBeRendered;
	}
}