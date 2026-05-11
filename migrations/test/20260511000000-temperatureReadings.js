'use strict';
const sensorinstance = require('../../test/sensorinstance.json');

var dbm;
var type;
var seed;

/**
  * We receive the dbmigrate dependency from dbmigrate initially.
  * This enables us to not have to rely on NODE_PATH.
  */
exports.setup = function(options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

exports.up = function(db) {
  return db.createTable('temperatureReadings',{
	'columns': {
		'id': {'type': 'int', 'primaryKey': true, 'autoIncrement': true },
		'readingValue': {'type': 'string', 'length': 20 },
		'deviceIdentity': {'type': 'string', 'length': 20 },
		'openClosed': {'type': 'string', 'length': 20 },
		'createdAt': {'type': 'timestamp', 'defaultValue': 'CURRENT_TIMESTAMP' }
	},
	'ifNotExists': true
  }).then(function(res){
			  return db.insert('temperatureReadings',['deviceIdentity','readingValue','openClosed'],Object.values(sensorinstance));
		  }).then(function(res){
//			  console.log(`In migration after insert, res: ${res}`);
		  }).catch( function(err){
			  console.error(`in migration err: ${err}`);
			  return;
		  });
};

exports.down = function(db) {
  return db.dropTable('temperatureReadings',{
	'ifExists': true
	});
};

exports._meta = {
  "version": 1
};
