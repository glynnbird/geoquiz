// app.js

var express = require('express'),
  proxy = require('./lib/proxy.js'),
  app = express(),
  url = "http://127.0.0.1:5984";
  
//setup static public directory
app.use(express.static(__dirname + '/public')); 

// use the jade templating engine
app.set('view engine', 'jade');

// parse BlueMix  configuration from environment variables, if present
var services = process.env.VCAP_SERVICES
if(typeof services != 'undefined') {
  services = JSON.parse(services);
  url = services.cloudantNoSQLDB[0].credentials.url
}

// set up the Cloudant proxy
app.use(proxy('proxy', url));

// render index page
app.get('/', function(req, res){
  res.render('index',{ });
});

// render index page
app.get('/quiz/:quizid', function(req, res){
  res.render('quiz', req.params);
});

// The IP address of the Cloud Foundry DEA (Droplet Execution Agent) that hosts this application:
var host = (process.env.VCAP_APP_HOST || 'localhost');
// The port on the DEA for communication with the application:
var port = (process.env.VCAP_APP_PORT || 3000);
// Start server
app.listen(port, host);
console.log('App started on port ' + port);


