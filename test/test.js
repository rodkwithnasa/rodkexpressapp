const request = require('supertest');
const assert = require('assert').strict
const app = require('../app.js')
const sensorinstance = require('../sensorinstance.json')
const { createHttpTerminator } = require('http-terminator')
const server = app.server
const httpTerminator = createHttpTerminator({ server })



describe('POST /profile', function() {
  it('responds with text', async function() {
    const res = await request(app)
      .post('/profile')
      .send(sensorinstance)
      .set('Content-Type', 'application/json')
      .set('Accept','application/json')
      .expect('Content-Type', 'application/json; charset=utf-8')
      .expect(200,/\{\s*\"insertId\"\:\s*\d*\s*\}/)
    
//    assert.equal(res.text,`Sensor :${sensorinstance.sensor} Temp :${sensorinstance.tempval} Door: ${sensorinstance.doorstate}`)
    
  });
  describe('GET /temp?q=id', function () {
      it('responds with temperature', function() {
          return request(app)
          .get('/temp?q=10')
          .expect(200).then(res => {
              console.log(`in response: ${JSON.stringify(res)}`)
                assert.equal(res.text,`{"readingValue":"${sensorinstance.tempval}"}`)              
          })
      })
  })
  after('close server', function () {
    httpTerminator.terminate()
  })
});
