var express = require('express'); 
var router = express.Router(); 
var util = require("util"); 
var fs = require("fs"); 
var fastcsv = require("fast-csv");
var babyparse = require("babyparse");
require('string.prototype.startswith');

var checkValid = function(files) {
	if (files) { 
		//console.log(util.inspect(files));
		if (files.file.size === 0) {
			return next(new Error("Hey, first would you select a file?"));
		}
		fs.exists(files.file.path, function(exists) { 
			if(exists) { 
				return "Got your file!"; 
			} else { 
				return "Well, there is no magic for those who don’t believe in it!"; 
			} 
		}); 
	} 
};

var startsWithAny = function(string, i) {
	//console.log("STRING: " + string);
	if(string.toLowerCase().startsWith("essay")) {
		return {type:"ESSAY", text: string, index: i};
	} else if(string.toLowerCase().startsWith("eq")) {
		return {type:"EQ", text: string, index: i};
	} else if(string.toLowerCase().startsWith("file_path")) {
		return {type:"File_path", text: string, index: i};
	} else if(string.toLowerCase().startsWith("mark")) {
		return {type:"Mark", text: string, index: i};
	} else if(string.toLowerCase().startsWith("condition")) {
		return {type:"Condition", text: string, index: i};
	} else if(string.toLowerCase().startsWith("intervention")) {
		return {type:"Intervention", text: string, index: i};
	} else {
		return null;
	}
};

var insert = function(data, headers, collection, res) {
	var object = {};
	var intervention = "";
	var position = 5;

	object.ID = data[0];
	object.Study = data[1];
	object.Group = data[2];
	object.Ethnicity = data[3];
	object.Gender = data[4];

	for (position; position < data.length && data[position] != ""; position++) {

	}

	for (var i = 0; i < headers.length; i++) {
		if(headers[i].type === "Intervention") {
			intervention = data[headers[i].index];
		} else if(headers[i].index >= position && data[headers[i].index] != "") {
			if(headers[i].type === "ESSAY" || headers[i].type === "EQ") {
				if(object.Essays == null) 
					object.Essays = [];
				
				object.Essays.push({Intervention: intervention, Body: data[headers[i].index], Question: headers[i].text});
			} else if(headers[i].type === "File_path") {
				if(object.File_path == null) 
					object.File_path = [];
				
				object.File_path.push(data[headers[i].index]);
			} else if(headers[i].type === "Mark") {
				if(object.Mark == null) 
					object.Mark = [];
				
				object.Mark.push(data[headers[i].index]);
			} else if(headers[i].type === "Condition") {
				object.Condition = data[headers[i].index];
			} 
		}
	};

	//console.log(object);
    // Submit to the DB
    collection.insert(object, function (err, doc) {
    	if (err) {
    		console.log("ERROR WITH DB" + err);
    	}
    });
};

var readFile = function(path, res, req) {
	// Set our internal DB variable
	var db = req.db;

    // Get our form values. These rely on the "name" attributes
    var userName = req.body.username;
    var userEmail = req.body.useremail;

    // Set our collection
    db.get('sessions',
    	function(err, collection){
    		collection.remove({},function(err, removed){
    		});
    	});
    var collection = db.get('subjects');
    collection.drop();
    collection.index('Study Group ID');

    var headers = [];
    var lines = babyparse.parse(fs.readFileSync(path, 'utf-8')).data;
    for (var i = 1; i < lines.length; i++) {
    	if(i == 1) {
    		var titles = lines[i];
    		for (var j = 1; j < titles.length; j++) {
    			if(titles[j].toString() != "" && (header = startsWithAny(titles[j].toString(), j)) != null) {
    				headers.push(header);
    			}
    		}
    	} else {
    			insert(lines[i], headers, collection, res);
    	}
    };
    console.log("Inserted " + (lines.length - 1) + " entries into \'subjects\'");
};

router.get('/:var(upload|uploadcsv|uploadcsv.php)', function(req, res) {
	res.render('uploadcsv');
});

router.post('/:var(upload|uploadcsv|uploadcsv.php)', function(req, res, next){ 
	checkValid(req.files);

	readFile(req.files.file.path, res, req);

	res.render('uploadcsv', {message: "OK"});
});
module.exports = router;

