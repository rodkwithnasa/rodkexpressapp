import express from 'express';
const app = express()
import sensorVal from './sensorval.js';
import mysql from 'mysql2/promise';
// const ini = require('ini');

var connection;
var myLogger = function (req, res, next) {
  console.log('LOGGED');
//  console.log(process.env.dbpwd);
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

app.get('/temp', function (req, res) {
    console.log(`query param: ${req.query.q}`)
      mysql.createConnection({
    host: 'localhost',
    user: process.env.dbuser,
    password: process.env.dbpwd,
    database: process.env.dbname,
    port: process.env.dbport
  }).then(function(conn){
    // do stuff with conn
    connection = conn;
    return connection.query(`select * FROM temperatureReadings where id=${req.query.q};`)
  }).then(function(rows){
    console.log(rows);
    const {readingValue} = rows[0][0]
    const myResponse = {'readingValue':readingValue}
    res.json(myResponse)
    connection.end();
  }).catch(function(error){
    if (connection?.end) connection.end();
    //logs out the error
    console.log(error);
    res.status(500)
    res.send('not ok')
  })
//    res.send('ok')
})

/*
app.use('/user/:id', function (req, res, next) {
  console.log('Request Type:', req.method)
  next()
})
*/
import bodyParser from 'body-parser';

app.use(bodyParser.json()); // for parsing application/json

app.post('/profile', function (req, res, next) {
  console.log(req.body);
  console.log('Request time: ', req.requestTime)
  const mysensorVal = new sensorVal(req.body.sensor, req.body.tempval, req.body.doorstate)
  mysensorVal.logValue();

//  var config = ini.parse(process.env.npm_config_key);
  
  mysql.createConnection({
    host: 'localhost',
    user: process.env.dbuser,
    password: process.env.dbpwd,
    database: process.env.dbname,
    port: process.env.dbport,
  }).then(function(conn){
    // do stuff with conn
    connection = conn;
    console.log('In profile connection before insert')
    return connection.query('INSERT INTO temperatureReadings(readingValue, deviceIdentity, openClosed) VALUES (?,?,?)',
      [mysensorVal.gettempval(), mysensorVal.getSensor(),mysensorVal.getdoorstate()]);
  }).then(function(rows){
    console.log('in reponse to query insertion')
    console.log(rows);
    const [{insertId}] = rows
    const myResponse = {'insertId':insertId}
    res.json(myResponse)
    connection.end();
  }).catch(function(error){
    if (connection?.end) connection.end();
    //logs out the error
    console.log(error);
    res.status(500)
    res.send('not ok')
  });

  //res.send('Sensor :'+ mysensorVal.getSensor() + ' Temp :' + mysensorVal.gettempval() + ' Door: ' + mysensorVal.getdoorstate())

});

app.use('/sensor/:sensid/temp/:tempVal/door/:doorState', function (req, res, next) {
  console.log('Request time: ', req.requestTime)
  const mysensorVal = new sensorVal(req.params.sensid,req.params.tempVal,req.params.doorState)
  mysensorVal.logValue();
  var connection;
  mysql.createConnection({
    host: 'localhost',
    user: process.env.dbuser,
    password: process.env.dbpwd,
    database: process.env.dbname,
    port: process.env.dbport,
  }).then(function(conn){
    // do stuff with conn
    connection = conn;
    return connection.query('INSERT INTO temperatureReadings(readingValue, deviceIdentity, openClosed) VALUES (?,?,?)',
      [mysensorVal.gettempval(), mysensorVal.getSensor(),mysensorVal.getdoorstate()]);
  }).then(function(rows){
    console.log(rows);
    connection.end();
  }).catch(function(error){
    if (connection?.end) connection.end();
    //logs out the error
    console.log(error);
    res.status(500)
    res.send('not ok')    
  });
  res.send('Sensor :'+ mysensorVal.getSensor() + ' Temp :' + mysensorVal.gettempval() + ' Door: ' + mysensorVal.getdoorstate())
})

export const server = app.listen(3000, () => {
  console.log('Example app listening on port 3000!');
});

export default app;

