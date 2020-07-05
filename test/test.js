const request = require('supertest');
const app = require('../app.js')
const sensorinstance = require('../sensorinstance.json')

describe('POST /profile', function() {
  it('responds with text', function(done) {
    request(app)
      .post('/profile')
      .send(sensorinstance)
      .set('Content-Type', 'application/json')
      .expect(200)
      .end(function(err, res) {
        if (err) throw err;
        done()
      })
  });
});
