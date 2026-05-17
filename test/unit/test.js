const proxyquire = require("proxyquire");
const request = require('supertest');
const assert = require('assert');
const sinon = require('sinon');
const sensorinstance = require('./sensorinstance.json');
const express = require('express');

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
		const stubbedRoute = proxyquire('../../profileRoute', {
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
		  .expect('Content-Type', 'application/json; charset=utf-8').then(res => {
    // Assert against the nested stub reference
		  sinon.assert.calledWith(dbStub.pool.query, 'INSERT INTO temperatureReadings(readingValue, deviceIdentity, openClosed) VALUES (?,?,?)');			  
		});
	  });

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
	}); // End of profile test

  describe('GET /temp?q=id', function () {
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
		const stubbedRoute = proxyquire('../../tempRoute', {
		  './db': dbStub
		});

		app = express();
		app.use(stubbedRoute);
	  });

	  afterEach(() => {
		sinon.restore();
	  });
      it('responds with temperature on id 1', function() {
		  const mockRetrieve = [[{"id":1,"readingValue":"18","deviceIdentity":"12345","openClosed":"open","createdAt":"2026-05-15T07:43:01.000Z"}]];
		// Program the nested stub directly
		  dbStub.pool.query.resolves(mockRetrieve);
          return request(app)
          .get('/temp?q=1')          
          .expect(200)
		  .expect('Content-Type', 'application/json; charset=utf-8').then(res=>{
			const first = new RegExp(`"readingValue":"${sensorinstance.tempval}"`);
            assert.match(res.text,first);
			assert.match(res.text,/"createdAt"\s*:\s*"([^"]+)"/);              
    // Assert against the nested stub reference
			sinon.assert.calledWith(dbStub.pool.query, `select * FROM temperatureReadings where id=1;`);
          })
      })
	  it('responds with empty object on out of range id', function() {
		  const mockRetrieve = [[]];
		// Program the nested stub directly
		  dbStub.pool.query.resolves(mockRetrieve);
		  return request(app)
		  .get('/temp?q=2')
		  .expect(200)
		  .expect('Content-Type', 'application/json; charset=utf-8').then(res => {
			  assert.equal(res.text, '{}')
    // Assert against the nested stub reference
			sinon.assert.calledWith(dbStub.pool.query, `select * FROM temperatureReadings where id=2;`);
		  });
	  });
	  it('fails to insert when no db',function() {
		  dbStub.pool.query.rejects(new Error('HAPool2 connection timed out'));
		  return request(app)
		  .get('/temp?q=2')
		  .expect(500).then(res => {
			assert.equal(res.text, 'not ok')
		  });
	  });
  }); // End of temp route test

  describe('GET /', function () {
	  let app;

	  beforeEach(() => {
		// 3. Inject the null stub into your route file
		const stubbedRoute = proxyquire('../../rootRoute', {

		});

		app = express();
		app.use(stubbedRoute);
	  });

	  afterEach(() => {
		sinon.restore();
	  });
	it('responds with Hello World',function() {
		return request(app)
		.get('/')
		.expect(200,/^Hello World!/)
		.expect('Content-Type','text/html; charset=utf-8').then( res => {
		});
	});
  }); // end of root Route test

  describe('GET /sensor/:s/temp/:t/door/:d', function() {
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
		const stubbedRoute = proxyquire('../../sensorRoute', {
		  './db': dbStub
		});

		app = express();
		app.use(stubbedRoute);
	  });

	  afterEach(() => {
		sinon.restore();
	  });
	  it('responds with text & insert id',function() {
		  const mockRetrieve = [{"fieldCount":0,"affectedRows":1,"insertId":2,"info":"","serverStatus":2,"warningStatus":0,"changedRows":0},null];
		// Program the nested stub directly
		  dbStub.pool.query.resolves(mockRetrieve);
		  return request(app)
		  .get(`/sensor/${sensorinstance.sensor}/temp/${sensorinstance.tempval}/door/${sensorinstance.doorstate}`)
		  .expect(200,/^Id: \d+ Sensor: 12345 Temp: 18 Door: open$/)
		  .expect('Content-Type','text/html; charset=utf-8')
		  .expect('Content-Length', '39').then(res => {
    // Assert against the nested stub reference
			sinon.assert.calledWith(dbStub.pool.query, 'INSERT INTO temperatureReadings(readingValue, deviceIdentity, openClosed) VALUES (?,?,?)');
		  });
	  });
	  
	  it('fails to insert when no db',function() {
		  dbStub.pool.query.rejects(new Error('HAPool3 connection timed out'));
		  return request(app)
		  .get(`/sensor/${sensorinstance.sensor}/temp/${sensorinstance.tempval}/door/${sensorinstance.doorstate}`)
		  .expect(500).then(res => {
				assert.equal(res.text, 'not ok')
		  });
	  });
  }); // end of sensor route test
});
