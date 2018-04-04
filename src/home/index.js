import './index.scss';
import {Index} from './index-component.js';
import React from 'react';
import ReactDOM from 'react-dom';
import $ from 'jquery';

$(document).ready(() => {
	const img = document.getElementById('background-image');
	let imgProps = img.getBoundingClientRect();

	if (document.body.clientWidth/document.body.clientHeight < 1.5) {
		img.style.height = "100vh";
		img.style.width = "auto";
	} else if (document.body.clientWidth/document.body.clientHeight >= 1.5) {
		img.style.width = "100vw";
		img.style.height = "auto";
	}

	window.addEventListener('resize', () => {
		if (document.body.clientWidth/document.body.clientHeight < 1.5) {
			img.style.height = "100vh";
			img.style.width = "auto";
		} else if (document.body.clientWidth/document.body.clientHeight >= 1.5) {
			img.style.width = "100vw";
			img.style.height = "auto";
		}
	})
})



ReactDOM.render(<Index />, document.getElementById('index'));