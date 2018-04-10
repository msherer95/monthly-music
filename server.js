const express = require('express'); // express framework
const compression = require('compression'); // gzip compression module
const app = express();
const bodyParser = require('body-parser'); // parse request bodies
const morgan = require('morgan'); // request logger
const methodOverride = require('method-override'); // allow usage of all HTTP verbs, even when not supported by client
const routes = require('./routes'); // all routes
const cookieParser = require('cookie-parser'); // handle cookies

app.use(compression()); // enable gzip compression
app.use(cookieParser()); // use cookie parser for handling cookies

// listen to environmental port, or 8080 for local testing
const port = process.env.PORT || 8080;
app.listen(port, () => {
    console.log('Our app is running on http://localhost:' + port);
});

// EXPRESS MIDDLEWARE
app.use(morgan('dev'));
app.use(bodyParser()); 
app.use(bodyParser.urlencoded({'extended':'true'}));
app.use(bodyParser.json());
app.use(bodyParser.json({ type: 'application/vnd.api+json' }));
app.use(methodOverride());

// inject routes
app.use('/', routes);

// use dist as static directory for all html/css files
app.use(express.static(__dirname + '/dist'));