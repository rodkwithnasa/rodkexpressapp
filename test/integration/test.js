const proxyquire = require("proxyquire");
const request = require('supertest');
const assert = require('assert');
const app = require('../../app');
const sensorinstance = require('./sensorinstance.json');
const shutdownApp = app.shutdownApp;
const DBMigrate = require('db-migrate');
const dbmigrate = DBMigrate.getInstance(true,{"env": "test",cmdOptions:{"verbose":false}});
// Enable silent mode
dbmigrate.silence(true);
const db = require('../../db');

describe('rodkexpressapp routes', function() {

describe('POST /profile', function() {
	  before('initialise DB', function () {
		  return dbmigrate.reset().then(function(res){
			  return dbmigrate.up();
		  }).catch(function(err){
			  console.error(err);
			  return;
		  });
	  });

  it('responds with json', function() {
  
      return request(app)
      .post('/profile')
      .send(sensorinstance)
      .set('Content-Type', 'application/json')
      .set('Accept','application/json')
      .expect(200,/\{\s*\"insertId\"\:\s*\d*\s*\}/)
      .expect('Content-Type', 'application/json; charset=utf-8').then(res => {});
  });

	  describe('error state test',function(){		  
		  before('reset all migrations', function() {
			return dbmigrate.reset();
		  });
		  it('fails to insert when no db',function() {
			  return request(app)
			  .post('/profile')
			  .send(sensorinstance)
			  .set('Content-Type', 'application/json')
			  .set('Accept','application/json')
			  .expect(500).then(res => {
				assert.equal(res.text, 'not ok')
			  });
		  });
	  });
});
  describe('GET /temp?q=id', function () {
	  before('initialise DB', function () {
		  return dbmigrate.reset().then(function(res){
			  return dbmigrate.up();
		  }).then(function(res){
			  return db.pool.query('INSERT INTO temperatureReadings(readingValue, deviceIdentity, openClosed) VALUES (?,?,?)',
      [sensorinstance.tempval, sensorinstance.sensor,sensorinstance.doorstate]);
		  }).catch(function(err){
			  console.error(err);
			  return;
		  });
	  });
		  
      it('responds with temperature on id 1', function() {
          return request(app)
          .get('/temp?q=1')          
          .expect(200)
		  .expect('Content-Type', 'application/json; charset=utf-8').then(res=>{
			const first = new RegExp(`"readingValue":"${sensorinstance.tempval}"`);
            assert.match(res.text,first);
			assert.match(res.text,/"createdAt"\s*:\s*"([^"]+)"/);              
          })
      })
	  it('responds with empty object on out of range id', function() {
		  return request(app)
		  .get('/temp?q=2')
		  .expect(200)
		  .expect('Content-Type', 'application/json; charset=utf-8').then(res => {
			  assert.equal(res.text, '{}')
		  });
	  });
	  describe('error state test',function(){		  
		  before('reset all migrations', function() {
			return dbmigrate.reset();
		  });
		  it('fails to insert when no db',function() {
			  return request(app)
			  .get('/temp?q=2')
			  .expect(500).then(res => {
				assert.equal(res.text, 'not ok')
			  });
		  });
	  });	  
  });
  describe('GET /', function () {
	it('responds with Hello World',function() {
		return request(app)
		.get('/')
		.expect(200,/^Hello World!/)
		.expect('Content-Type','text/html; charset=utf-8').then( res => {
		});
	});
  });
  describe('GET /info', function () {
	it('responds with route info',function() {
		return request(app)
		.get('/info')
		.expect(200)
		.expect('Content-Length', '345')
		.expect('Content-Type','text/html; charset=utf-8').then( res => {
		});
	});
  });
  describe('GET /sensor/:s/temp/:t/door/:d', function() {
	  before('setup db',function() {
		  return dbmigrate.up();
	  });

	afterEach('reset all migrations', function() {
		return dbmigrate.reset();
	});

	  it('responds with text & insert id',function() {
		  return request(app)
		  .get(`/sensor/${sensorinstance.sensor}/temp/${sensorinstance.tempval}/door/${sensorinstance.doorstate}`)
		  .expect(200,/^Id: \d+ Sensor: 12345 Temp: 18 Door: open$/)
		  .expect('Content-Type','text/html; charset=utf-8')
		  .expect('Content-Length', '39').then(res => {
		  });
	  });
		  
	  
	  it('fails to insert when no db',function() {
		  return request(app)
		  .get(`/sensor/${sensorinstance.sensor}/temp/${sensorinstance.tempval}/door/${sensorinstance.doorstate}`)
		  .expect(500).then(res => {
				assert.equal(res.text, 'not ok')
		  });
	  });
  });
		  
	after('close server', async function() {
	  console.error('In close server before shutdownApp');
    // Shuts down HTTP sockets first, then kills the database connection pool
	  await shutdownApp(); 
      console.error('*******HTTP server closed & db released')
    }); 
});
