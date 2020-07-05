const request = require('supertest');
const assert = require('assert').strict
const app = require('../app.js')
const sensorinstance = require('../sensorinstance.json')

describe('POST /profile', function() {
  it('responds with text', function() {
    return request(app)
      .post('/profile')
      .send(sensorinstance)
      .set('Content-Type', 'application/json')
      .expect(200)
      .then( res => {
       assert.equal(res.text,'Sensor :424243 Temp :29.2 Door: 0')
      })
  });
});
