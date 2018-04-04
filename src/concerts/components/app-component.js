import $ from 'jquery';
import React from 'react';
import {Loader} from './loader-component';
import {ConcertBlock} from './concert-block-component'
import {Error} from './error-component';

export class App extends React.Component {

	constructor(props) {
		super(props);
		this.state = {concerts: null}
	}

	componentDidMount() {
		$.get('/getConcerts', (data) => {
			console.log(data);
			this.setState({concerts: data})
		})
	}

	render() {

		let toBeRendered;

		if (!this.state.concerts) {
			toBeRendered = (<div>
				<h1 id="title">Upcoming Concerts</h1>
				<p id="subtitle">Try refreshing if this page is taking too long</p>
				<Loader />
			</div>)
		} else if (this.state.concerts.name == "StatusCodeError") {
			toBeRendered = <Error error={this.state.concerts.statusCode} />
		} else if (this.state.concerts.name == "RequestError") {
			toBeRendered = <Error error={443} />
		} else if (this.state.concerts.error) {
			toBeRendered = <Error error={500} />
		} else {
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