'use strict';

const tokenUrl = 'https://api.paylocity.com/IdentityServer/connect/token';

// You want to make a request to an endpoint that is either specifically designed
// to test auth, or one that every user will have access to. eg: `/me`.
// By returning the entire request object, you have access to the request and
// response data for testing purposes. Your connection label can access any data
// from the returned response using the `json.` prefix. eg: `{{json.username}}`.
const test = (z, bundle) =>
  z.request({ 
    url: `https://api.paylocity.com/api/v2/companies/${bundle.authData.company_id}/employees`
 });

// This function runs after every outbound request. You can use it to check for
// errors or modify the response. You can have as many as you need. They'll need
// to each be registered in your index.js file.
const handleBadResponses = (response, z, bundle) => {
  if (response.status === 401 || response.status === 400) {
    throw new z.errors.Error(
      // This message is surfaced to the user
      `${JSON.stringify(response)}`,
      'AuthenticationError',
      response.status
    );
  }

  return response;
};

const getAccessToken = async (z, bundle) => {
  const basicHash = Buffer.from(`${bundle.authData.client_id}:${bundle.authData.client_secret}`).toString('base64');
    
  const response = await z.request({
    method: 'POST',
    url: tokenUrl,
    headers: {
      Authorization: `Basic ${basicHash}`,
      'content-type': 'application/x-www-form-urlencoded'
    },
    body: {
      grant_type: 'client_credentials',
      scope: 'WebLinkAPI'
    },
  });
  return {
    access_token: response.data.access_token,
  };
};

// This function runs before every outbound request. You can have as many as you
// need. They'll need to each be registered in your index.js file.
const addBearerHeader = (request, z, bundle) => {
  if (bundle.authData && bundle.authData.access_token !== '' && request.url !== tokenUrl) {
    request.headers.Authorization = `Bearer ${bundle.authData.access_token}`;
  }
  return request;
};

module.exports = {
  config: {
    type: 'session',

    // Define any input app's auth requires here. The user will be prompted to enter
    // this info when they connect their account.
    fields: [
      { key: 'client_id', label: 'Client Id', required: true },
      { key: 'client_secret', label: 'Client Secret', required: true },
      { key: 'company_id', label: 'Company Id', required: true },
      { key: 'access_token', label: 'Access Token', required: false, computed: true },
    ],

    // The test method allows Zapier to verify that the credentials a user provides
    // are valid. We'll execute this method whenever a user connects their account for
    // the first time.
    test,

    sessionConfig: {
      perform: getAccessToken,
    },
    // This template string can access all the data returned from the auth test. If
    // you return the test object, you'll access the returned data with a label like
    // `{{json.X}}`. If you return `response.data` from your test, then your label can
    // be `{{X}}`. This can also be a function that returns a label. That function has
    // the standard args `(z, bundle)` and data returned from the test can be accessed
    // in `bundle.inputData.X`.
    connectionLabel: '{{bundle.authData.company_id}}',
  },
  befores: [addBearerHeader],
  afters: [handleBadResponses],
};
