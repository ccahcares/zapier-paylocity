'use strict'

const zapier = require('zapier-platform-core');

const App = require('../index')
const appTester = zapier.createAppTester(App)

const globalBeforeSetup = async(done) => {
    zapier.tools.env.inject(); //testing only!

    if (!process.env.CLIENT_ID || !process.env.CLIENT_SECRET || !process.env.COMPANY_ID) { throw new Error('Setup your .env file') }

    //set ACCESS_TOKEN environment variable if not already set
    if (!process.env.ACCESS_TOKEN) {
        const bundle = {
            authData: {
                client_id: process.env.CLIENT_ID,
                client_secret: process.env.CLIENT_SECRET,
                company_id: process.env.COMPANY_ID
            },
        };

        let newAuthData = await appTester(
            App.authentication.sessionConfig.perform,
            bundle
        );

        expect(newAuthData.access_token).toBeTruthy();
        process.env.ACCESS_TOKEN = newAuthData.access_token;
    }
    done();
}

module.exports = {
    globalBeforeSetup
}