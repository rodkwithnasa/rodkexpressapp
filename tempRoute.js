// tempRoute.js

const express = require('express');
const router = express.Router();
const db = require('./db');
var conn;

router.get('/temp', async function (req, res, next) {

  try {
//    conn = await db.pool.getConnection();

    const rows = await db.pool.query(`select * FROM temperatureReadings where id=${req.query.q};`)

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
//    conn?.release();
  };
});

module.exports = router;

