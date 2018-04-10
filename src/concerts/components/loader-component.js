import React from 'react';

// loading screen with 3 bouncing circles
export class Loader extends React.Component {

	render() {
		return (
			<div className="loader-wrapper">
				<div id="circle-left" className="loader-circle"></div>
				<div id="circle-middle" className="loader-circle"></div>
				<div id="circle-right" className="loader-circle"></div>
			</div>
		)
	}
}