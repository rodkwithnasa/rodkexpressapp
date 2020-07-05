
const express = require('express')
module.exports = app = express()
const sensorVal = require('./sensorval')
const mysql = require('promise-mysql');
const ini = require('ini');


var myLogger = function (req, res, next) {
  console.log('LOGGED');
//  console.log(process.env.npm_config_dbpwd);
  next()
}

app.use(myLogger)


var requestTime = function (req, res, next) {
  req.requestTime = Date.now()
  next()
}

app.use(requestTime)

app.get('/', function (req, res) {
  var responseText = 'Hello World!<br>'
  responseText += '<small>Requested at: ' + req.requestTime + '</small>'
  res.send(responseText)
})

/*
app.use('/user/:id', function (req, res, next) {
  console.log('Request Type:', req.method)
  next()
})
*/
var bodyParser = require('body-parser');

app.use(bodyParser.json()); // for parsing application/json

app.post('/profile', function (req, res, next) {
  console.log(req.body);
  console.log('Request time: ', req.requestTime)
  mysensorVal = new sensorVal(req.body.sensor, req.body.tempval, req.body.doorstate)
  mysensorVal.logValue();

  var connection;
//  var config = ini.parse(process.env.npm_config_key);
/*
  mysql.createConnection({
    host: 'localhost',
    user: process.env.npm_config_dbuser,
    password: process.env.npm_config_dbpwd,
    database: process.env.npm_config_dbname,
    port: process.env.npm_config_dbport
  }).then(function(conn){
    // do stuff with conn
    connection = conn;
    return connection.query('INSERT INTO temperatureReadings(readingValue, deviceIdentity, openClosed) VALUES (?,?,?)',
      [mysensorVal.gettempval(), mysensorVal.getSensor(),mysensorVal.getdoorstate()]);
  }).then(function(rows){
    console.log(rows);
    connection.end();
  }).catch(function(error){
    if (connection && connection.end) connection.end();
    //logs out the error
    console.log(error);
  });
  */
  res.send('Sensor :'+ mysensorVal.getSensor() + ' Temp :' + mysensorVal.gettempval() + ' Door: ' + mysensorVal.getdoorstate())

});

app.use('/sensor/:sensid/temp/:tempVal/door/:doorState', function (req, res, next) {
  console.log('Request time: ', req.requestTime)
  mysensorVal = new sensorVal(req.params.sensid,req.params.tempVal,req.params.doorState)
  mysensorVal.logValue();
  var connection;
  mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'obscured',
    database: 'test_howard'
  }).then(function(conn){
    // do stuff with conn
    connection = conn;
    return connection.query('INSERT INTO temperatureReadings(readingValue, deviceIdentity, openClosed) VALUES (?,?,?)',
      [mysensorVal.gettempval(), mysensorVal.getSensor(),mysensorVal.getdoorstate()]);
  }).then(function(rows){
    console.log(rows);
    connection.end();
  }).catch(function(error){
    if (connection && connection.end) connection.end();
    //logs out the error
    console.log(error);
  });
  res.send('Sensor :'+ mysensorVal.getSensor() + ' Temp :' + mysensorVal.gettempval() + ' Door: ' + mysensorVal.getdoorstate())
})

//app.listen(3001, () => console.log('Example app listening on port 3001!'));

