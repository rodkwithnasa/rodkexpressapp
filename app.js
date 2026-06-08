'use strict';
const express = require('express');
const app = express();
// default export must be set early to avoid overwriting
module.exports  = app;
const sensorVal = require('./sensorval.js');
const db = require('./db');
	
var myLogger = function (req, res, next) {
//  console.log('LOGGED');
//  console.log(`Password:${dbPassword}, dbpwd:${process.env.dbpwd}`);
  next()
}

app.use(myLogger);

var requestTime = function (req, res, next) {
  req.requestTime = Date.now()
  next()
}

app.use(requestTime)

const rootRoute = require('./rootRoute');
app.use(rootRoute);

const tempRoute = require('./tempRoute');
app.use(tempRoute);

const profileRoute = require('./profileRoute');
app.use(profileRoute);

const sensorRoute = require('./sensorRoute');
app.use(sensorRoute);

const infoRoute = require('./infoRoute');
app.use(infoRoute);


module.exports.server = app.listen(3000, () => {
  console.log('Example app listening on port 3000!');
});

// Function to safely tear down the entire application structure
const shutdownApp = () => {
  console.error('In shutdownApp');
  return new Promise((resolve) => {
	console.error('Before server close');
    module.exports.server.close(async () => {
	  console.error('After server close');
      await db.closePool(); // Clears out lingering DB sockets
	  console.error('after closePool');
      resolve();
    });

    // CRITICAL: Immediately close any idle persistent connections
    // This stops HTTP keep-alive loops from hanging your app
    module.exports.server.closeIdleConnections();
    // Destroy every remaining active client connection
    for (const socket of sockets) {
      socket.destroy();
    }
	
  });
};

process.on('SIGTERM', async () => {
  try {
    await shutdownApp();
    process.exit(0); // Clean exit for Docker
  } catch (err) {
    console.error('Error during shutdown:', err);
    process.exit(1); // Error state exit
  }
});

const sockets = new Set();

module.exports.server.on('connection', (socket) => {
  sockets.add(socket);
  socket.on('close', () => sockets.delete(socket));
});


module.exports.shutdownApp = shutdownApp;


