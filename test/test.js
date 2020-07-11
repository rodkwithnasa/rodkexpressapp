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
      .expect(200)
    
    assert.equal(res.text,`Sensor :${sensorinstance.sensor} Temp :${sensorinstance.tempval} Door: ${sensorinstance.doorstate}`)
    
  });
  after('close server', function () {
    httpTerminator.terminate()
  })
});
