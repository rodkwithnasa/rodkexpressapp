const request = require('supertest');
const assert = require('assert').strict
const app = require('../app.js')
const sensorinstance = require('../sensorinstance.json')
const { createHttpTerminator } = require('http-terminator')
const server = app.server
const httpTerminator = createHttpTerminator({ server })



describe('POST /profile', function() {
  it('responds with text', function(done) {
    return request(app)
      .post('/profile')
      .send(sensorinstance)
      .set('Content-Type', 'application/json')
      .set('Accept','application/json')
      .expect(200,/\{\s*\"insertId\"\:\s*\d*\s*\}/)
      .expect('Content-Type', 'application/json; charset=utf-8')
      .then(res=>{console.log(`In then, res:${res}`);done()})
      .catch(err=>{console.log(`In catch, err:${err}`); done(err)})
    
//    assert.equal(res.text,`Sensor :${sensorinstance.sensor} Temp :${sensorinstance.tempval} Door: ${sensorinstance.doorstate}`)
    
  });
  describe('GET /temp?q=id', function () {
      it('responds with temperature', function(done) {
          return request(app)
          .get('/temp?q=10')          
          .expect(200)
          .then(res=>{
              console.log(`in then: ${JSON.stringify(res)}`)
              assert.equal(res.text,`{"readingValue":"${sensorinstance.tempval}"}`)
              done()              
          })
          .catch(err=>{console.log(`In catch, err:${err}`); done(err)})
      })
  })
  after('close server', function () {
    httpTerminator.terminate()
  })
});
