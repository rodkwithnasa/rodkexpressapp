const request = require('supertest');
const assert = require('assert');
const app = require('../app.js');
const sensorinstance = require('./sensorinstance.json');
const { createHttpTerminator } = require('http-terminator');
debugger;
const server  = app.server;
const httpTerminator = createHttpTerminator({ server })


//debugger;
describe('POST /profile', function() {
  it('responds with json', function(done) {
debugger;  
      request(app)
      .post('/profile')
      .send(sensorinstance)
      .set('Content-Type', 'application/json')
      .set('Accept','application/json')
      .expect(200,/\{\s*\"insertId\"\:\s*\d*\s*\}/)
      .expect('Content-Type', 'application/json; charset=utf-8')
      .end(function(err,res) {
        if (err) {console.log(`Failure, err:${err}`); done(err)}
        console.log(`Success: ${JSON.stringify(res)}`);
        done()
      });
    
    
  });
  describe('GET /temp?q=id', function () {
      it('responds with temperature', function(done) {
          request(app)
          .get('/temp?q=1')          
          .expect(200)
          .end(function(err,res) {
            if (err) {console.log(`Failure, err:${err}`); done(err)}
            console.log(`Success: ${JSON.stringify(res)}`)
            assert.equal(res.text,`{"readingValue":"${sensorinstance.tempval}"}`)
            done()              
          })
      })
  });
  after('close server', function (done) {
    httpTerminator.terminate()
	.then((res)=>{
		console.log(`Terminate(then):${res}`);
		done();
	})
	.catch((err)=>{
		console.error(`Terminate (catch):${err}`);
		done(err);
	});
  });
});
