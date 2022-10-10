/* globals describe, expect, test, it */

const zapier = require('zapier-platform-core');

const testUtils = require('../test-utils');

const App = require('../../index');
const appTester = zapier.createAppTester(App);

describe('resources.employee', () => {
    beforeAll(testUtils.globalBeforeSetup);

    it('should run', async () => {
        const bundle = { 
            inputData: {},
            authData: {
                client_id: process.env.CLIENT_ID,
                client_secret: process.env.CLIENT_SECRET,
                company_id: process.env.COMPANY_ID,
                access_token: process.env.ACCESS_TOKEN
            }
        };
        const results = await appTester(App.resources.employee.list.operation.perform, bundle);
        expect(results).toBeDefined();
        // TODO: add more assertions
    });

    it('should find an employee', async () => {
        const bundle = { 
            inputData: {
                employeeId: 246
            },
            authData: {
                client_id: process.env.CLIENT_ID,
                client_secret: process.env.CLIENT_SECRET,
                company_id: process.env.COMPANY_ID,
                access_token: process.env.ACCESS_TOKEN
            }
        };
        const results = await appTester(App.resources.employee.search.operation.perform, bundle);
        expect(results[0].firstName).toBeDefined();
        expect(results[0].lastName).toBeDefined();
        expect(results[0].homeAddress['emailAddress']).toBeDefined();
        // TODO: add more assertions
    });
});
