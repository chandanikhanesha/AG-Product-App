const request = require('supertest');
const app = require('bin/server');

describe('UsersController', () => {
  describe('signIn', () => {
    test('With invalid parameters, should return a 422 response', () => {
      return request(app)
        .post('/api/users/sign_in')
        .send({ email: 'test123@tets.com' })
        .then((response) => {
          expect(response.statusCode).toBe(422);
        });
    });
  });

  test('It should do things', () => {
    return request(app)
      .get('/test')
      .then((response) => {
        // console.log('response : ', response)
        expect(response.statusCode).toBe(200);
      });
  });
});
