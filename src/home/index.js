import './index.scss';
import {Index} from './index-component.js';
import React from 'react';
import ReactDOM from 'react-dom';
import $ from 'jquery';

$(document).ready(() => {

	/*
		Background image has dimensions of ~ 1.5x1.

		If screen is thinner than 1.5x1, image has to take up entire height,
		and adjust width to maintain image dimensions. For screens wider than 1.5x1, 
		image takes up entire width instead, and adjusts height to maintain dimensions. 
		Without these adjustments, the background image would leave white space depending
		on screen size.

		E.g. if image always took up entire width and adjusted height, on a 1x1 screen, 
		image height would be smaller than screen height and leave white space. 
		
	*/

	const img = document.getElementById('background-image');

	// scale image on load based on initial screen dimensions
	if (document.body.clientWidth/document.body.clientHeight < 1.5) {
		img.style.height = "100vh";
		img.style.width = "auto";
	} else if (document.body.clientWidth/document.body.clientHeight >= 1.5) {
		img.style.width = "100vw";
		img.style.height = "auto";
	}

	// change image dimensions based on screen dimensions on window resize
	window.addEventListener('resize', () => {

		// if screen dimensions are thinner than background image
		if (document.body.clientWidth/document.body.clientHeight < 1.5) {
			img.style.height = "100vh"; // take up entire height
			img.style.width = "auto"; // adjust width to maintain dimensions
		} else if (document.body.clientWidth/document.body.clientHeight >= 1.5) {
			img.style.width = "100vw"; // take up entire width
			img.style.height = "auto"; // adjust height to maintain dimensions
		}
	})
})



ReactDOM.render(<Index />, document.getElementById('index'));