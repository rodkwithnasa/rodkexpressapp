// sensorRoute.js

const express = require('express');
const router = express.Router();
const db = require('./db');
const sensorVal = require('./sensorval');
var conn;

router.get('/sensor/:sensid/temp/:tempVal/door/:doorState', async function (req, res, next) {

  const mysensorVal = new sensorVal(req.params.sensid,req.params.tempVal,req.params.doorState)
  if (process.env?.NODE_ENV === 'test') { mysensorVal.logValue(); }

  try {
//    conn = await db.pool.getConnection();

    const rows = await db.pool.query('INSERT INTO temperatureReadings(readingValue, deviceIdentity, openClosed) VALUES (?,?,?)',
      [mysensorVal.gettempval(), mysensorVal.getSensor(),mysensorVal.getdoorstate()]);

    const [{insertId}] = rows;
	res.send(`Id: ${insertId} Sensor: ${mysensorVal.getSensor()} Temp: ${mysensorVal.gettempval()} Door: ${mysensorVal.getdoorstate()}`);
  } catch (error){

    console.error(`***In /sensor error: ${error}`);
    res.status(500)
    res.send('not ok')
	next(error);
  } finally {
//    conn?.release();
  }
});

module.exports = router;