/* globals describe, it, expect */

const zapier = require('zapier-platform-core');

const testUtils = require('./test-utils');

const App = require('../index');
const appTester = zapier.createAppTester(App);

describe('Authentication', () => {
  beforeAll(testUtils.globalBeforeSetup);

  it('has auth details added to every request', async () => {
    const bundle = {
      authData: {
        client_id: process.env.CLIENT_ID,
        client_secret: process.env.CLIENT_SECRET,
        company_id: process.env.COMPANY_ID,
        access_token: process.env.ACCESS_TOKEN
      },
    };

    const response = await appTester(App.authentication.test, bundle);

    expect(response.status).toBe(200);
    expect(response.request.headers['Authorization']).toBeTruthy();
  });
});
