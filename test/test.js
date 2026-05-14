const proxyquire = require("proxyquire");
var mysqlStub = {};
const request = require('supertest');
const assert = require('assert');
var app = proxyquire('../app.js',{'mysql2/promise':mysqlStub});
const sensorinstance = require('./sensorinstance.json');
const { createHttpTerminator } = require('http-terminator');
debugger;
const server  = app.server;
const shutdownApp = app.shutdownApp;
const httpTerminator = createHttpTerminator({ server })
const DBMigrate = require('db-migrate');
const dbmigrate = DBMigrate.getInstance(true,{"env": "test",cmdOptions:{"verbose":false}});
// Enable silent mode
dbmigrate.silence(true);
//console.log(`dbmigrate instance ${JSON.stringify(dbmigrate)}`);

describe('rodkexpressapp routes', function() {
//debugger;
describe('POST /profile', function() {
	  before('initialise DB', function () {
		  return dbmigrate.reset(1,'test').then(function(res){
			  return dbmigrate.up(1,'test');
		  }).catch(function(err){
			  console.error(err);
			  return;
		  });
	  });

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
			return dbmigrate.reset(1,'test');
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
//          .end(function(err,res) {
//            if (err) {/*console.log(`Failure, err:${err}`);*/ done(err)}
//            console.log(`Success: ${JSON.stringify(res)}`)
			const first = new RegExp(`"readingValue":"${sensorinstance.tempval}"`);
            assert.match(res.text,first);
			assert.match(res.text,/"createdAt"\s*:\s*"([^"]+)"/);
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
//		.end(function(err,res) {
//			if (err) {done(err)};
//			done();
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
//		  .end(function(err,res) {
//			  if (err) {done(err)};
//			  done();
		  });
	  });
		  
	  
	  it('fails to insert when no db',function() {
		  return request(app)
		  .get(`/sensor/${sensorinstance.sensor}/temp/${sensorinstance.tempval}/door/${sensorinstance.doorstate}`)
		  .expect(500).then(res => {
				assert.equal(res.text, 'not ok')
//		  .expect('Content-Type','text/html; charset=utf-8')
//		  .expect('Content-Length', '39').then(res => {
//		  .end(function(err,res) {
//			  if (err) {done(err)};
//			  done();
		  });
	  });
  });
		  
	after('close server', async function() {
    // Shuts down HTTP sockets first, then kills the database connection pool
	  await shutdownApp(); 

      console.error('*******HTTP server closed & db released')
     /* httpTerminator.terminate()
	.then((res)=>{
		console.log(`Terminate(then):${res}`);
//		done();
	})
	.catch((err)=>{
		console.error(`Terminate (catch):${err}`);
//		done(err);
	}); */
  }); 
});
