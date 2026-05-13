'use strict';
const express = require('express');
const app = express();
// default export must be set early to avoid overwriting
module.exports  = app;
const sensorVal = require('./sensorval.js');
var mysql = require('mysql2/promise');
//export all of the db access - not needed now we know about proxyquire
//module.exports.mydb = mysql;
const fs = require('node:fs');
// const ini = require('ini');

const dbPassword = process.env.dbpwd ? process.env.dbpwd : fs.readFileSync(process.env.dbpwd_FILE, 'utf8');
var connectionp;
(async () => {
  try {
	const cp = await mysql.createPool({
		connectionLimit : 10,
		host: process.env.dbhost,
		user: process.env.dbuser,
		password: dbPassword,
		database: process.env.dbname,
		port: process.env.dbport
    });
	connectionp = cp;
  } catch (error) {
	  throw error;
  }
})();
var conn;
	
var myLogger = function (req, res, next) {
//  console.log('LOGGED');
//  console.log(`Password:${dbPassword}, dbpwd:${process.env.dbpwd}`);
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

app.get('/temp', async function (req, res, next) {
//    console.log(`query param: ${req.query.q}`)
// (async () => {
  try {
    conn = await connectionp.getConnection();
//  .then(async function(conn){
    // do stuff with conn
//    connection = conn;
    const rows = await conn.query(`select * FROM temperatureReadings where id=${req.query.q};`)
//  }).then(function(rows){
//    console.log(rows);
    let myResponse = {};
	if (rows[0].length > 0) {
		const {readingValue,createdAt} = rows[0][0]
		myResponse.readingValue = readingValue;
		myResponse.createdAt = createdAt;
	}
    res.json(myResponse)
  } catch (error){
    //logs out the error
    console.log(`***In /temp error: ${error}`);
    res.status(500)
    res.send('not ok')
	next(error);
  } finally {
    conn?.release();
  }
	  
// })();
//    res.send('ok')
})

/*
app.use('/user/:id', function (req, res, next) {
  console.log('Request Type:', req.method)
  next()
})
*/
const bodyParser = require('body-parser');

app.use(bodyParser.json()); // for parsing application/json

app.post('/profile', async function (req, res, next) {
//  console.log(req.body);
//  console.log('Request time: ', req.requestTime)
  const mysensorVal = new sensorVal(req.body.sensor, req.body.tempval, req.body.doorstate)
  if (process.env?.NODE_ENV === 'test') { mysensorVal.logValue(); }

//  var config = ini.parse(process.env.npm_config_key);
  
// (async () => {
  try {
    conn = await connectionp.getConnection();
//  .then(async function(conn){
    // do stuff with conn
//    connection = conn;
//    console.log('In profile connection before insert')
    const rows = await conn.query('INSERT INTO temperatureReadings(readingValue, deviceIdentity, openClosed) VALUES (?,?,?)',
      [mysensorVal.gettempval(), mysensorVal.getSensor(),mysensorVal.getdoorstate()]);
//  }).then(function(rows){
//    console.log('in reponse to query insertion')
//    console.log(rows);
    const [{insertId}] = rows
    const myResponse = {'insertId':insertId}
    res.json(myResponse)
  } catch(error){
    //logs out the error
    console.error(`***In /profile error: ${error}`);
    res.status(500)
    res.send('not ok')
	next(error);
  } finally {
    conn?.release();
  }
	  
// })();

  //res.send('Sensor :'+ mysensorVal.getSensor() + ' Temp :' + mysensorVal.gettempval() + ' Door: ' + mysensorVal.getdoorstate())

});

app.get('/sensor/:sensid/temp/:tempVal/door/:doorState', async function (req, res, next) {
//  console.log('Request time: ', req.requestTime)
  const mysensorVal = new sensorVal(req.params.sensid,req.params.tempVal,req.params.doorState)
  if (process.env?.NODE_ENV === 'test') { mysensorVal.logValue(); }
//  var connection;
// (async () => {
  try {
    conn = await connectionp.getConnection();
//  .then(async function(conn){
    // do stuff with conn
//    connection = conn;
    const rows = await conn.query('INSERT INTO temperatureReadings(readingValue, deviceIdentity, openClosed) VALUES (?,?,?)',
      [mysensorVal.gettempval(), mysensorVal.getSensor(),mysensorVal.getdoorstate()]);
//  }).then(function(rows){
//    console.log(rows);
    const [{insertId}] = rows;
	res.send(`Id: ${insertId} Sensor: ${mysensorVal.getSensor()} Temp: ${mysensorVal.gettempval()} Door: ${mysensorVal.getdoorstate()}`);
  } catch (error){
//logs out the error
    console.error(`***In /sensor error: ${error}`);
    res.status(500)
    res.send('not ok')
	next(error);
  } finally {
    conn?.release();
  }
	  
// })();
})

module.exports.server = app.listen(3000, () => {
  console.log('Example app listening on port 3000!');
  // Export the connection pool
  module.exports.cp = connectionp;
});



