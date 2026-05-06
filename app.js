const express = require('express');
const app = express();
const sensorVal = require('./sensorval.js');
const mysql = require('mysql2/promise');
const fs = require('node:fs');
// const ini = require('ini');

const dbPassword = process.env.dbpwd ? process.env.dbpwd : fs.readFileSync(process.env.dbpwd_FILE, 'utf8');

var connection;
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
    const conn = await mysql.createConnection({
		host: process.env.dbhost,
		user: process.env.dbuser,
		password: dbPassword,
		database: process.env.dbname,
		port: process.env.dbport
    })
//  .then(async function(conn){
    // do stuff with conn
    connection = conn;
    const rows = await connection.query(`select * FROM temperatureReadings where id=${req.query.q};`)
//  }).then(function(rows){
//    console.log(rows);
    let myResponse = {};
	if (rows[0].length > 0) {
		const {readingValue} = rows[0][0]
		myResponse.readingValue = readingValue;
	}
    res.json(myResponse)
    connection.end();
  } catch (error){
    if (connection?.end) connection.end();
    //logs out the error
    console.log(`In /temp error: ${error}`);
    res.status(500)
    res.send('not ok')
	next(error);
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
    const conn = await  mysql.createConnection({
    host: process.env.dbhost,
    user: process.env.dbuser,
    password: dbPassword,
    database: process.env.dbname,
    port: process.env.dbport,
  })
//  .then(async function(conn){
    // do stuff with conn
    connection = conn;
//    console.log('In profile connection before insert')
    const rows = await connection.query('INSERT INTO temperatureReadings(readingValue, deviceIdentity, openClosed) VALUES (?,?,?)',
      [mysensorVal.gettempval(), mysensorVal.getSensor(),mysensorVal.getdoorstate()]);
//  }).then(function(rows){
//    console.log('in reponse to query insertion')
//    console.log(rows);
    const [{insertId}] = rows
    const myResponse = {'insertId':insertId}
    res.json(myResponse)
    connection.end();
  } catch(error){
    if (connection?.end) connection.end();
    //logs out the error
//    console.log(error);
    res.status(500)
    res.send('not ok')
	next(error);
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
    const conn = await  mysql.createConnection({
    host: process.env.dbhost,
    user: process.env.dbuser,
    password: dbPassword,
    database: process.env.dbname,
    port: process.env.dbport,
  })
//  .then(async function(conn){
    // do stuff with conn
    connection = conn;
    const rows = await connection.query('INSERT INTO temperatureReadings(readingValue, deviceIdentity, openClosed) VALUES (?,?,?)',
      [mysensorVal.gettempval(), mysensorVal.getSensor(),mysensorVal.getdoorstate()]);
//  }).then(function(rows){
//    console.log(rows);
    const [{insertId}] = rows;
	res.send(`Id: ${insertId} Sensor: ${mysensorVal.getSensor()} Temp: ${mysensorVal.gettempval()} Door: ${mysensorVal.getdoorstate()}`);
    connection.end();
  } catch (error){
    if (connection?.end) connection.end();
    //logs out the error
//    console.log(error);
    res.status(500)
    res.send('not ok')    
  };
// })();
})

module.exports  = app;
module.exports.server = app.listen(3000, () => {
  console.log('Example app listening on port 3000!');
});



