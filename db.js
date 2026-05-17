'use strict';
const mysql = require('mysql2/promise');
const fs = require('node:fs');
const dbPassword = process.env.dbpwd ? process.env.dbpwd : fs.readFileSync(process.env.dbpwd_FILE, 'utf8');

const pool = mysql.createPool({
	connectionLimit : 10,
	host: process.env.dbhost,
	user: process.env.dbuser,
	password: dbPassword,
	database: process.env.dbname,
	port: process.env.dbport
});

// A wrapper to safely terminate connections
const closePool = async () => {
  await pool.end(); // Shuts down all active pool connections gracefully
};

module.exports = {
  pool,
  closePool
};