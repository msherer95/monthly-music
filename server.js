const express = require('express');
const compression = require('compression');
const app = express();
const bodyParser = require('body-parser');
const morgan = require('morgan');
const methodOverride = require('method-override');
const routes = require('./routes'); // all routes
const cookieParser = require('cookie-parser');
const request = require('request'); 
const querystring = require('querystring');

app.use(compression()); // enable gzip compression
app.use(cookieParser());

// listen to environmental port, or 8080 for localhost testing
const port = process.env.PORT || 8080;
app.listen(port, () => {
    console.log('Our app is running on http://localhost:' + port);
});

// EXPRESS MIDDLEWARE
app.use(morgan('dev')); // logger middleware for requests
app.use(bodyParser()); // body parsing middleware
app.use(bodyParser.urlencoded({'extended':'true'}));
app.use(bodyParser.json());
app.use(bodyParser.json({ type: 'application/vnd.api+json' }));
app.use(methodOverride()); // allow usage of all HTTP verbs, even when not supported by client

// inject routes
app.use('/', routes);

// use dist/public as static directory for public html/css files
app.use(express.static(__dirname + '/dist'));