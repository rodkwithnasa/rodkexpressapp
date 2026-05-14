const proxyquire = require("proxyquire");
const request = require('supertest');
const assert = require('assert');
const sinon = require('sinon');
const sensorinstance = require('./sensorinstance.json');
const express = require('express');

//const server  = app.server;
//const shutdownApp = app.shutdownApp;

describe('rodkexpressapp routes', function() {

  describe('POST /profile', function() {
  let dbStub;
  let app;

  beforeEach(() => {
    // 1. Create the inner stub for the pool's query method
    const queryStub = sinon.stub();

    // 2. Structure the stub object to mirror the multi-export from db.js
    dbStub = {
      pool: {
        query: queryStub
      },
      closePool: sinon.stub().resolves() // Stubbed cleanup helper
    };

    // 3. Inject the structured stub into your route file
    const stubbedRoute = proxyquire('../profileRoute', {
      './db': dbStub
    });

    app = express();
    app.use(stubbedRoute);
  });

  afterEach(() => {
    sinon.restore();
  });
  it('responds with json', function() {
      const mockInsert = [{"fieldCount":0,"affectedRows":1,"insertId":2,"info":"","serverStatus":2,"warningStatus":0,"changedRows":0},null];
    // Program the nested stub directly
      dbStub.pool.query.resolves(mockInsert);
      return request(app)
      .post('/profile')
      .send(sensorinstance)
      .set('Content-Type', 'application/json')
      .set('Accept','application/json')
      .expect(200,/\{\s*\"insertId\"\:\s*\d*\s*\}/)
      .expect('Content-Type', 'application/json; charset=utf-8').then(res => {});
  });

	  describe('error state test',function(){		  
		  it('fails to insert when no db',function() {
			dbStub.pool.query.rejects(new Error('HAPool connection timed out'));
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
/*	after('close server', async function() {
	  console.error('In close server before shutdownApp');
    // Shuts down HTTP sockets first, then kills the database connection pool
	  await shutdownApp(); 
      console.error('*******HTTP server closed & db released')
    }); */
});
/*
  describe('GET /temp?q=id', function () {
	  before('initialise DB', function () {
		  return dbmigrate.reset(1,'test').then(function(res){
			  return dbmigrate.up(1,'test');
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
			return dbmigrate.reset(1,'test');
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
  describe('GET /sensor/:s/temp/:t/door/:d', function() {
	  before('setup db',function() {
		  return dbmigrate.up(1,'test');
	  });

	afterEach('reset all migrations', function() {
		return dbmigrate.reset(1,'test');
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
  */
		  

});
