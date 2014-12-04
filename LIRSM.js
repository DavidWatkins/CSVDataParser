var express = require('express');
var app = express();
var jade = require('jade');
var path = require('path');
var mongo = require('mongodb').MongoClient;
var monk = require('monk');
var db = monk('localhost:27017/LIRSM');

var multer = require('multer');
app.use(multer({
	dest:"./uploads/"
}));

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



app.listen(3000);