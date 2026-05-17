// profileRoute.js

const express = require('express');
const router = express.Router();
const db = require('./db');
const bodyParser = require('body-parser');
const sensorVal = require('./sensorval');
var conn;

router.use(bodyParser.json()); // for parsing application/json

router.post('/profile', async function (req, res, next) {

  const mysensorVal = new sensorVal(req.body.sensor, req.body.tempval, req.body.doorstate)
  if (process.env?.NODE_ENV === 'test') { mysensorVal.logValue(); }

  try {
//    conn = await db.pool.getConnection();

    const rows = await db.pool.query('INSERT INTO temperatureReadings(readingValue, deviceIdentity, openClosed) VALUES (?,?,?)',
      [mysensorVal.gettempval(), mysensorVal.getSensor(),mysensorVal.getdoorstate()]);

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
//    conn?.release();
  }
});

module.exports = router;
