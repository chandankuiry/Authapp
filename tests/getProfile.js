const expect = require('chai').expect;
const app = require('../server');
const request = require('supertest');

// let's set up the data we need to pass to the login method
const userCredentials = {
  name: 'chandan@gmail.com',
  password: '123',
};
// now let's login the user before we run any tests
const authenticatedUser = request.agent(app);
before((done) => {
  authenticatedUser
    .post('/login')
    .send(userCredentials)
    .end((err, response) => {
      expect(response.statusCode).to.equal(200);
      done();
    });
});
