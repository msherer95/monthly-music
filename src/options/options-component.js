import React from 'react';

export class Options extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			location: null, 
			radius: null, 
			numMonths: null
		}
		this.styleMaker = this.styleMaker.bind(this);
		this.handleFocus = this.handleFocus.bind(this);
		this.handleFocusOut = this.handleFocusOut.bind(this);
		this.handleType = this.handleType.bind(this);
		this.validateZipcode = this.validateZipcode.bind(this);
		this.validateRadiusAndMonth = this.validateRadiusAndMonth.bind(this);
	}

	styleMaker(inputState) {
		let rejectColor = "#ff6961";
		let acceptColor = "#446F9B";
		let labelTransform;
		let labelColor;
		let labelFontWeight;
		let underlineOpacity;
		let underlineTransform;
		let underlineColor;
		let descriptionOpacity;
		let descriptionTransform;

		switch (inputState) {
			case null: 
				labelColor = acceptColor;
				labelTransform = "none";
				labelFontWeight = "300";
				underlineOpacity = 0;
				underlineTransform = "none";
				underlineColor = acceptColor;
				descriptionOpacity = 0;
				descriptionTransform = "translateY(-10px)";
				break;
			case 'typing': 
				labelColor = acceptColor;
				labelTransform = "translateY(-24px) scale(0.7)";
				labelFontWeight = "400";
				underlineOpacity = 1;
				underlineTransform = "scaleX(150)";
				underlineColor = acceptColor;
				descriptionOpacity = 1;
				descriptionTransform = "none";
				break;
			case 'typing-accept': 
				labelColor = acceptColor;
				labelTransform = "translateY(-24px) scale(0.7)";
				labelFontWeight = "400";
				underlineOpacity = 1;
				underlineTransform = "scaleX(150)";
				underlineColor = acceptColor;
				descriptionOpacity = 1;
				descriptionTransform = "none";
				break;	
			case 'typing-reject': 
				labelColor = rejectColor;
				labelTransform = "translateY(-24px) scale(0.7)";
				labelFontWeight = "400";
				underlineOpacity = 1;
				underlineTransform = "scaleX(150)";
				underlineColor = rejectColor;
				descriptionOpacity = 1;
				descriptionTransform = "none";
				break;
			case 'accept': 
				labelColor = acceptColor;
				labelTransform = "translateY(-24px) scale(0.7)";
				labelFontWeight = "400";
				underlineOpacity = 0;
				underlineTransform = "none";
				underlineColor = acceptColor;
				descriptionOpacity = 0;
				descriptionTransform = "translateY(-10px)";
				break;
			case 'reject': 
				labelColor = rejectColor;
				labelTransform = "translateY(-24px) scale(0.7)";
				labelFontWeight = "400";
				underlineOpacity = 1;
				underlineTransform = "scaleX(150)";
				underlineColor = rejectColor;
				descriptionOpacity = 0;
				descriptionTransform = "translateY(-10px)";
				break;
			case 'leftEmpty':
				labelColor = rejectColor;
				labelTransform = "none";
				labelFontWeight = "300";
				underlineOpacity = 1;
				underlineTransform = "scaleX(150)";
				underlineColor = rejectColor;
				descriptionOpacity = 0;
				descriptionTransform = "translateY(-10px)";
		}

		let inputStyles = {
			labelStyle: {
				fontWeight: labelFontWeight,
				color: labelColor,
				transform: labelTransform
			},
			underlineStyle: {
				opacity: underlineOpacity,
				backgroundColor: underlineColor,
				transform: underlineTransform
			},
			descriptionStyle: {
				opacity: descriptionOpacity,
				transform: descriptionTransform
			}
		}

		return inputStyles
	}

	validateZipcode(zipcode) {
		return zipcode.match(/(^\d{5}$)|(^\d{5}-\d{4}$)/) ? true : false;
	}

	validateRadiusAndMonth(value) {
		return value.match(/^\d+$/) ? true : false;
	}

	handleFocus(e) {
		let inputType = e.target.name;
		let inputState = eval('this.state.'+inputType);
		
		if (e.target.value == "") {
			if (inputState == null) {
				this.setState({[inputType]: 'typing'})
			} else {
				this.setState({[inputType]: 'typing-reject'})
			}
		} else {
			if (e.target.name == 'location' && this.validateZipcode(e.target.value)) {
				this.setState({[inputType]: 'typing-accept'})
			} else if (e.target.name == 'location' && !this.validateZipcode(e.target.value)) {
				this.setState({[inputType]: 'typing-reject'})
			} else if(e.target.name != 'location' && this.validateRadiusAndMonth(e.target.value)) {
				this.setState({[inputType]: 'typing-accept'})
			} else if(e.target.name != 'location' && !this.validateRadiusAndMonth(e.target.value)) {
				this.setState({[inputType]: 'typing-reject'})
			}
		}
	}

	handleFocusOut(e) {
		let inputType = e.target.name;
		
		if (e.target.value == "") {
			this.setState({[inputType]: 'leftEmpty'})
		} else {
			if (e.target.name == 'location' && this.validateZipcode(e.target.value)) {
				this.setState({[inputType]: 'accept'})
			} else if (e.target.name == 'location' && !this.validateZipcode(e.target.value)) {
				this.setState({[inputType]: 'reject'})
			} else if(e.target.name != 'location' && this.validateRadiusAndMonth(e.target.value)) {
				this.setState({[inputType]: 'accept'})
			} else if(e.target.name != 'location' && !this.validateRadiusAndMonth(e.target.value)) {
				this.setState({[inputType]: 'reject'})
			}
		}
	}

	handleType(e) {
		let inputType = e.target.name;
		let inputState = eval('this.state.'+inputType);
	
		if (e.target.name == 'location' && this.validateZipcode(e.target.value)) {
			this.setState({[inputType]: 'typing-accept'})
		} else if(e.target.name == 'location' && !this.validateZipcode(e.target.value) && inputState != null && inputState != 'typing') {
			this.setState({[inputType]: 'typing-reject'})
		} else if(e.target.name != 'location' && this.validateRadiusAndMonth(e.target.value)) {
			this.setState({[inputType]: 'typing-accept'})
		} else if(e.target.name != 'location' && !this.validateRadiusAndMonth(e.target.value) && inputState != null && inputState != 'typing') {
			this.setState({[inputType]: 'typing-reject'})
		}
	}

	render() {

		let locationStyle = this.styleMaker(this.state.location);
		let radiusStyle = this.styleMaker(this.state.radius);
		let monthsStyle = this.styleMaker(this.state.numMonths);

		let locationValidated = this.state.location == 'accept' || this.state.location == 'typing-accept'
		let radiusValidated = this.state.radius == 'accept' || this.state.radius == 'typing-accept'
		let numMonthsValidated = this.state.numMonths == 'accept' || this.state.numMonths == 'typing-accept'
		let btnEnabled = locationValidated && radiusValidated && numMonthsValidated;

		return (
			<div>
				<div className="options-wrap">
					<h1>Give us some info</h1>
					<form method="GET" action="/concerts">
						<div className="input-wrap">
							<input className="input" type="text" name="location" onFocus={this.handleFocus} onBlur={this.handleFocusOut} onKeyUp={this.handleType} />
							<div className="selected-underline" style={locationStyle.underlineStyle}></div>
							<p className="label" style={locationStyle.labelStyle}>Zip Code</p>
							<p className="description" style={locationStyle.descriptionStyle}>Where do you live?</p>
						</div>
						<div className="input-wrap">
							<input className="input" type="text" name="radius" onFocus={this.handleFocus} onBlur={this.handleFocusOut} onKeyUp={this.handleType} />
							<div className="selected-underline" style={radiusStyle.underlineStyle}></div>
							<p className="label" style={radiusStyle.labelStyle}>Radius (miles)</p>
							<p className="description" style={radiusStyle.descriptionStyle}>How far are you willing to drive?</p>
						</div>
						<div className="input-wrap">
							<input className="input" type="text" name="numMonths" onFocus={this.handleFocus} onBlur={this.handleFocusOut} onKeyUp={this.handleType} />
							<div className="selected-underline" style={monthsStyle.underlineStyle}></div>
							<p className="label" style={monthsStyle.labelStyle}>Months Ahead</p>
							<p className="description" style={monthsStyle.descriptionStyle}>How many months in the future?</p>
						</div>
						{btnEnabled ? <input type="submit" value="Search" /> : <input type="submit" value="Search" style={{opacity: "0.2"}} disabled />}
					</form>
				</div>
				<div className="options-shadow"></div>
			</div>
		)
	}
}