import request from 'supertest';
import assert from 'assert';
import app from '../app.js';
import sensorinstance from '../sensorinstance.json' with { type: "json" };
import { createHttpTerminator } from 'http-terminator';
import { server } from '../app.js';
const httpTerminator = createHttpTerminator({ server })



describe('POST /profile', function() {
  it('responds with json', function(done) {
    /*return*/ request(app)
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
  after('close server', function () {
    httpTerminator.terminate()
  })
});
