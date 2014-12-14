var express = require('express'); 
var router = express.Router(); 
var jade = require('jade');
var path = require('path');
var mongo = require('mongodb');
var http = require('http');
var bodyParser = require('body-parser');
var jsonParser = bodyParser.json();

function arrNoDup(a) {
	var temp = {};
	for (var i = 0; i < a.length; i++)
		temp[a[i]] = true;
	var r = [];
	for (var k in temp)
		r.push(k);
	return r;

}

router.get('/:var(|index|index.html|index.php)', function(req, res) {
	var studies = {};
	req.mongodb.collection('groupstudy').find({}, {_id: 0}).toArray(function(err, docs) {
		if(err)
			console.log(err);

		var currentStudy = "";
		for(var doc in docs) {
			if(currentStudy == docs[doc].study) {
				studies[currentStudy].push(docs[doc].group);
			} else {
				currentStudy = docs[doc].study;
				studies[currentStudy] = [];
				studies[currentStudy].push(docs[doc].group);
			}
		}

		res.render('index', {
			Studies: studies
		});
	});
});

router.post('/ajax/table', jsonParser, function(req, res) {
	var query = {};
	query.Study = req.body.study;
	if(req.body.group != "All")
		query.Group = req.body.group;

	req.mongodb.collection('subjects').find(query).toArray(function(err, docs) {
		res.send(docs);
		res.end();
	});
});

module.exports = router;