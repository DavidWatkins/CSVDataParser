var express = require('express'); 
var router = express.Router(); 
var util = require("util"); 
var fs = require("fs"); 
var fastcsv = require("fast-csv");
var babyparse = require("babyparse");
require('string.prototype.startswith');
var fs = require('fs');
var utf8 = require('utf8');

var addGroupStudy = function(groupstudy, group, study) {
	groupstudy.update({"study":study, "group":group}, {"study":study, "group":group}, {upsert:true, safe:false}, function(err, data) {
		if(err)
			console.log(err);
	});
}

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
	string = cleanr(string);
	if(string.toLowerCase().startsWith("essay")) {
		return {type:"ESSAY", text: string, index: i};
	} else if(string.toLowerCase().startsWith("eq")) {
		return {type:"EQ", text: string, index: i};
	} else if(string.toLowerCase().startsWith("file path")) {
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

var insert = function(data, headers, collection, res, groupstudy) {
	var object = {};
	var intervention = "";
	var position = 5;
	
	if(data[0] != null && data[1] != null && data[2] != null && data[3] != null && data[4] != null) {
		object.ID = data[0].trim();
		object.Study = data[1].trim();
		object.Group = data[2].trim();
		object.Ethnicity = data[3].trim();
		object.Gender = data[4].trim();
	} else {
		return;
	}

	for (position; position < data.length && data[position] != ""; position++) {}

		var lastObserved = [];

	for (var i = 0; i < headers.length; i++) {
		if(headers[i].type === "Intervention") {
			intervention = headers[i].text;
		} else if(headers[i].index >= position) {
			data[headers[i].index] = cleanr(data[headers[i].index]);
			if(data[headers[i].index] == "") {

				if(headers[i].type === "ESSAY" || headers[i].type === "EQ") {
					if(lastObserved.Essays == null) 
						lastObserved.Essays = [];

					lastObserved.Essays.push({Intervention: intervention, Body: "", header: headers[i].text, index: headers[i].index});
				} else if(headers[i].type === "File_path") {
					if(lastObserved.File_path == null) 
						lastObserved.File_path = [];

					lastObserved.File_path.push({header: headers[i].text, file_path:'', index: headers[i].index});
				} else if(headers[i].type === "Mark") {
					if(lastObserved.Mark == null) 
						lastObserved.Mark = [];

					lastObserved.Mark.push({header: headers[i].text, mark:'', index: headers[i].index});
				}

			} else {

				if(object.Essays != null)
					for(var e in lastObserved.Essays)
						object.Essays.push(e);
				if(object.File_path != null)
					for(var f in lastObserved.File_path)
						object.File_path.push(f);
				if(object.Mark != null)
					for(var m in lastObserved.Mark)
						object.Mark.push(m);
				lastObserved = [];

				if(headers[i].type === "ESSAY" || headers[i].type === "EQ") {
					if(object.Essays == null) 
						object.Essays = [];

					object.Essays.push({Intervention: intervention, Body: data[headers[i].index], header: headers[i].text, index: headers[i].index});
				} else if(headers[i].type === "File_path") {
					if(object.File_path == null) 
						object.File_path = [];

					object.File_path.push({header: headers[i].text, file_path: data[headers[i].index], index: headers[i].index});
				} else if(headers[i].type === "Mark") {
					if(object.Mark == null) 
						object.Mark = [];

					object.Mark.push({header: headers[i].text, mark: data[headers[i].index], index: headers[i].index});
				} else if(headers[i].type === "Condition") {
					object.Condition = data[headers[i].index];
				} 
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

    if(groupstudy == null)
    	console.log("ERROR: " + groupstudy);
    addGroupStudy(groupstudy, object.Group, object.Study);
};

var readFile = function(path, res, req) {
	// Set our internal DB variable
	var db = req.db;

    // Get our form values. These rely on the "name" attributes
    var userName = req.body.username;
    var userEmail = req.body.useremail;

    // Set our collection
    var collection = db.get('subjects');
    var groupstudy = db.get('groupstudy');
    groupstudy.drop();
    collection.drop();
    collection.index('Study Group ID');
    groupstudy.index('study group');

    var headers = [];
    var lines = babyparse.parse(fs.readFileSync(path, 'ascii')).data;
    for (var i = 1; i < lines.length; i++) {
    	if(i == 1) {
    		var titles = lines[i];
    		for (var j = 1; j < titles.length; j++) {
    			if(titles[j].toString() != "" && (header = startsWithAny(titles[j].toString(), j)) != null) {
    				headers.push(header);
    			}
    		}
    	} else {
    		insert(lines[i], headers, collection, res, groupstudy);
    	}
    };
    console.log("Inserted " + (lines.length - 1) + " entries into \'subjects\'");
};

// Change straight quotes to curly and double hyphens to em-dashes.
function cleanr(a) {
  a = a.replace(/[\u2018\u2019]/g, "'");
  a = a.replace(/[\u201C\u201D]/g, '"');
  return a;
};

router.get('/:var(upload|uploadcsv|uploadcsv.php)', function(req, res) {
	res.render('uploadcsv');
});

router.post('/:var(upload|uploadcsv|uploadcsv.php)', function(req, res, next){ 
	checkValid(req.files);

	readFile(req.files.file.path, res, req);

	fs.unlink(req.files.file.path, function(err) {
		if(err) throw err;
	});
	res.render('uploadcsv', {message: "OK"});
});
module.exports = router;

