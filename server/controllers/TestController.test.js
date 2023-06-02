const request = require('supertest');
const app = require('bin/server');

describe('TestController', () => {
  test('It should return 200', () => {
    return request(app)
      .get('/test')
      .then((response) => {
        // console.log('response : ', response)
        expect(response.statusCode).toBe(200);
      });
  });
});
