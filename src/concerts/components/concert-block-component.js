import React from 'react';
import $ from 'jquery';

// each individual concert block component
export class ConcertBlock extends React.Component {
	constructor(props) {
		super(props);
		this.state = {focused: false, loaded: false};
		this.handleMouseOver = this.handleMouseOver.bind(this);
		this.handleMouseLeave = this.handleMouseLeave.bind(this);
	}

	handleMouseOver() {
		this.setState({focused: true});
	}

	handleMouseLeave() {
		this.setState({focused: false});
	}

	componentDidMount() {
		setTimeout(() => {
			this.setState({loaded: true})
		}, 100+200*this.props.index)
	}

	render() {

		let concert = this.props.concert;
		let concertWrapperTransform;
		let concertWrapperZIndex;
		let imageFilter;

		if (document.body.clientWidth >= 480) {
			concertWrapperTransform = this.state.loaded ? this.state.focused ? "perspective(500px) translateZ(30px)" : "none" : "translateY(-30px)"; // move to front if focused, move up if NOT loaded
			concertWrapperZIndex = this.state.focused ? "100" : "1"; // move to front
			imageFilter = this.state.focused ? "brightness(30%)" : "brightness(10%) blur(5px)";
		} else {
			concertWrapperTransform = "perspective(500px) translateZ(50px)";
			concertWrapperZIndex = "1";
			imageFilter = " brightness(20%) blur(3px)";
		}

		let concertWrapperStyle = {
			zIndex: concertWrapperZIndex,
			transform: concertWrapperTransform,
			opacity: this.state.loaded ? 1 : 0 // show when loaded
		}

		let imageStyle = {
			filter: imageFilter
		}

		return (
			<div className="concert-wrapper" style={concertWrapperStyle} onMouseOver={this.handleMouseOver} onMouseLeave={this.handleMouseLeave}>
				<a href={concert.url} target="_blank">
					<h1 className="concert-name">{concert.name}</h1>
					<div className="concert-date-distance" style={{justifyContent: concert.date ? 'space-between' : 'center'}}>
						{ concert.date && <p>{concert.date.substr(0,10)}</p> }
						<p>{Math.floor(concert.distance)} miles away</p>
					</div>
					<img style={imageStyle} src={concert.image} />
				</a>
				<div className="hover-shadow"></div>
			</div>
		)
	}
}