var express = require('express');
var app = express();
var hbs = require('hbs');
var path = require('path');
var mongo = require('mongodb');
var monk = require('monk');
var db = monk('localhost:27017/LIRSM');

var multer = require('multer');
app.use(multer({
	dest:"./uploads/"
}));

app.set('view engine', 'html');
app.engine('html', hbs.__express);

// Make our db accessible to our router
app.use(function(req,res,next){
    req.db = db;
    next();
});

app.get('/:var(|index|index.html|index.php)', function(req, res) {
    res.render('index');
});

var uploads = require('./routes/uploadcsv.js');
app.use(uploads);
 

 
app.listen(3000);