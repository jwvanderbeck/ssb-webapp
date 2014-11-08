// Setup packages
var http = require('http'),
	express = require('express'),
	app = express(),
	bodyParser = require('body-parser'),
	mongoose = require('mongoose'),
	domain = require('domain'),
	cookieParser = require('cookie-parser'),
	session = require('express-session'),
	flash = require('connect-flash');

// setup Jade as our templating language
app.locals.pretty = true;
app.set('views', __dirname + '/app/components');
app.set('view engine', 'jade');
app.use(express.static(__dirname + '/public'));
// Configure bodyParser which allows use of POST data
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(cookieParser());

// Bring in configuration settings
var	config = require('./config/config'),
	passportConfig = require('./config/security');

app.use(session({ secret: passportConfig.sessionSecret }));
app.use(flash());
// Setup an error domain for all requests
app.use(function(req, res, next){
	var requestDomain = domain.create();
	requestDomain.on('error', function(err){
		console.error('REQUEST DOMAIN ERROR CAUGHT\n', err.stack);
		try {
			// perform a failsafe shutdown
			setTimeout(function(){
				console.error('Failsafe shutdown');
				process.exit(1);
			}, 5000);
			// disconnect from cluster
			var worker = require('cluster').worker;
			if (worker)
				worker.disconnect();
			server.close();
			try {
				// use our custom Express 500 error route
				next(err);
			}
			catch(err) {
				// otherwise use the standard Node server to pass the 500
				console.err('Express error route failed.\n', err.stack);
				res.statusCode = 500;
				res.setHeader('content-type', 'text/plain');
				res.end('Internal Server Error');
			}
		}
		catch(err) {
			console.error('Unable to send 500 response.\n', err.stack);
		}
	});
	// Add the request and response objects to the domain
	requestDomain.add(req);
	requestDomain.add(res);
	// execute the rest of the request in the domain
	requestDomain.run(next);
});

// configure Mongoose
var db = mongoose.connect(config.mongo.uri, config.mongo.options);

var	passwordless = require('./app/passwordless')(app, passportConfig, config),
	routes = require('./app/routes')(app,express, passwordless);

// client testing middleware
app.use(function(req, res, next) {
	res.locals.showTests = req.query.test == '1';
	next();
});

// custom 404
app.use(function(req, res){
	res.type('text/plain');
	res.status(404);
	res.send('404 - Not Found');
});
// custom 500
app.use(function(err, req, res, next){
	console.error(err.stack);
	res.status(500);
	res.send('500 - Server Error');
});

// Start server
// var server = http.createServer(app).listen(config.port, config.ip, function () {
//   console.log('Express server listening on %s:%d, in %s mode', config.ip, config.port, app.get('env'));
// });

app.listen(config.port);
