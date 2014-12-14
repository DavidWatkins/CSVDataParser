//Imports for viewing and app
var express = require('express');
var app = express();
var jade = require('jade');
var forever = require('forever-monitor');

//Imports for database management
var mongo = require('mongodb').MongoClient;
var db = require('monk')('localhost:27017/LIRSM');

//Multiple action forms for file upload
var multer = require('multer');
app.use(multer({
	dest:"./uploads/"
}));

//Set jade as templating engine
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));

app.set('view engine', 'html');
app.engine('html', jade.__express);

// Make our db accessible to our router
app.use(function(req,res,next){
	req.db = db;
	mongo.connect('mongodb://localhost:27017/LIRSM', function(err, newDatabase) {
		if(!err) {
			req.mongodb = newDatabase;
			next();
		} else {
			console.log(err);
		}
	});
});

var index = require('./routes/index.js');
app.use(index);

var uploads = require('./routes/uploadcsv.js');
app.use(uploads);

app.use(express.static(__dirname + '/public'));

app.listen(3000);