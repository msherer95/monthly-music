import React from 'react';

// different error screens based on error type
export const Error = (props) => {

	if (props.error == 429) {
		return (<div>
				<h1 className="error-header">Sorry! We've reached our ticketmaster call limit.</h1>
				<p className="error-text-429">Try again in 24 hours when ticketmaster will reset our daily limit</p>
			</div> )
	} else if (props.error == 401) {
		return (<div>
			<h1 className="error-header">Sorry! We couldn't authenticate you.</h1>
			<p className="error-text-401">Please go back to the home page to reauthenticate</p>
		</div> )
	} else if (props.error == 443) {
		return (<div>
			<h1 className="error-header">Sorry! We couldn't connect to ticketmaster.</h1>
			<p className="error-text-443">Try refreshing the page. If this doesn't work, wait a couple minutes, then try again.</p>
		</div> )
	} else if (props.error == 600) {
		return (<div>
			<h1 className="error-header">You don't have any upcoming concerts</h1>
		</div> )
	} else {
		return (<div>
				<h1 className="error-header">Sorry! We encountered an error.</h1>
				<p className="error-text-general">We likely had trouble connecting to ticketmaster, or our requests got timed out for taking too long. Try refreshing the page or going back to the home page. We're working on better error handling in the meantime.</p>
			</div>)
	}
}