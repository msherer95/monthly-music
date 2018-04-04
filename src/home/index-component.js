import React from 'react';
import artistImage from './monthly_music.jpg';
import {Loader} from '../concerts/components/loader-component';

export class Index extends React.Component {
	constructor(props) {
		super(props);
		this.state = {loaded: false, loaderAction: 'bounce'};
		this.handleLoad = this.handleLoad.bind(this);
	}

	handleLoad() {
		this.setState({loaded: true})
	}

	render() {
		const homeScreen = (
			<div>
				<div className="home-loader" style={{display: this.state.loaded ? 'none' : 'block'}}>
					<h1 className="home-loader-text">Connecting to Monthly Music . . .</h1>
					<Loader />
				</div>
				<div id="index-wrap" style={{display: this.state.loaded ? 'block' : 'none'}}>
					<h1>Monthly Music</h1>
					<p>Find concerts  for all your Spotify artists</p>
					<form method="GET" action="/login">
						<input type="submit" value="Login to Spotify"/>
					</form>
					<img id='background-image' src={artistImage} onLoad={this.handleLoad} />
				</div>
			</div>
		);

		return homeScreen;
	}
}
