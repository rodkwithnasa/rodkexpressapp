// rootRoute.js

const express = require('express');
const router = express.Router();

router.get('/', function (req, res) {
  var responseText = 'Hello World!<br>'
  responseText += '<small>Requested at: ' + req.requestTime + '</small>'
  res.send(responseText)
})

module.exports = router;
