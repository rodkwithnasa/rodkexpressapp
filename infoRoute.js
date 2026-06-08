// infoRoute.js

const express = require('express');
const router = express.Router();

router.get('/info', function (req, res) {
  var responseText = '<H1>Information on Rodkexpressapp Routes</H1>';
  responseText += 	'<ul>\
						<li><a href="/">Hello World</a></li>\
						<li><a href="/temp?q=1">Get temp db entry</a></li>\
						<li><a href="/sensor/12345A/temp/13.2/door/closed">Send new temp entry</a></li>\
						<li>There is another route /profile that accepts a JSON object with the same data as /sensor</li>\
					</ul>';
  res.send(responseText);
})

module.exports = router;
