const request = require('supertest');
const assert = require('assert');
const app = require('../app.js');
const sensorinstance = require('./sensorinstance.json');
const { createHttpTerminator } = require('http-terminator');
debugger;
const server  = app.server;
const httpTerminator = createHttpTerminator({ server })
const DBMigrate = require('db-migrate');
const dbmigrate = DBMigrate.getInstance(true,{"env": "test",cmdOptions:{"verbose":false}});
//console.log(`dbmigrate instance ${JSON.stringify(dbmigrate)}`);

describe('rodkexpressapp routes', function() {
//debugger;
describe('POST /profile', function() {

  it('responds with json', function() {
debugger;  
      return request(app)
      .post('/profile')
      .send(sensorinstance)
      .set('Content-Type', 'application/json')
      .set('Accept','application/json')
      .expect(200,/\{\s*\"insertId\"\:\s*\d*\s*\}/)
      .expect('Content-Type', 'application/json; charset=utf-8').then(res => {});
/*      .end(function(err,res) {
        if (err) { console.log(`Failure, err:${err}`); done(err)}
        console.log(`Success: ${JSON.stringify(res)}`);
        done()
      });
*/    
    
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
			  });
		  });
	  });


});
  describe('GET /temp?q=id', function () {
	  before('initialise DB', function () {
		  return dbmigrate.reset().then(function(res){
			  return dbmigrate.up();
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
//          .end(function(err,res) {
//            if (err) {/*console.log(`Failure, err:${err}`);*/ done(err)}
//            console.log(`Success: ${JSON.stringify(res)}`)
            assert.equal(res.text,`{"readingValue":"${sensorinstance.tempval}"}`)
//            done()              
          })
      })
	  it('responds with empty object on out of range id', function() {
		  return request(app)
		  .get('/temp?q=2')
		  .expect(200)
		  .expect('Content-Type', 'application/json; charset=utf-8').then(res => {
//		  .end(function(err,res) {
//			  if (err) {done(err)}
			  assert.equal(res.text, '{}')
//			  done()
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
//		.end(function(err,res) {
//			if (err) {done(err)};
//			done();
		});
	});
  });
  describe('GET /sensor/:sensid/temp/:tempVal/door/:doorState', function() {
	  before('setup db',function() {
		  return dbmigrate.up();
	  });

	afterEach('reset all migrations', function() {
		return dbmigrate.reset();
	});

	  it('responds with text and insert id',function() {
		  return request(app)
		  .get(`/sensor/${sensorinstance.sensor}/temp/${sensorinstance.tempval}/door/${sensorinstance.doorstate}`)
		  .expect(200,/^Id: \d+ Sensor: 12345 Temp: 18 Door: open$/)
		  .expect('Content-Type','text/html; charset=utf-8')
		  .expect('Content-Length', '39').then(res => {
//		  .end(function(err,res) {
//			  if (err) {done(err)};
//			  done();
		  });
	  });
		  
	  
	  it('fails to insert when no db',function() {
		  return request(app)
		  .get(`/sensor/${sensorinstance.sensor}/temp/${sensorinstance.tempval}/door/${sensorinstance.doorstate}`)
		  .expect(500).then(res => {
//		  .expect('Content-Type','text/html; charset=utf-8')
//		  .expect('Content-Length', '39').then(res => {
//		  .end(function(err,res) {
//			  if (err) {done(err)};
//			  done();
		  });
	  });
  });
		  
	after('close server', function() {
    return httpTerminator.terminate()
	.then((res)=>{
//		console.log(`Terminate(then):${res}`);
//		done();
	})
	.catch((err)=>{
//		console.error(`Terminate (catch):${err}`);
//		done(err);
	});
  });
});
