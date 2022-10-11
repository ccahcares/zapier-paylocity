const _sharedBaseUrl = `https://api.paylocity.com/api/v2/companies`;
const { getDeduper } = require("z-deduper");


const performList = async (z, bundle) => {
  
  const zapId = bundle.authData.company_id; //test
  if (!zapId) {
    throw new Error("Zap ID is required for the custom deduper to work");
  }
  // Get an instance of the custom deduper
  const deduper = getDeduper(zapId);

  const response = await z.request({
    url: `${_sharedBaseUrl}/${bundle.authData.company_id}/employees`,
    params: {
      pagesize: 250,
      pagenumber: bundle.meta.page,
      includetotalcount: true
    }
  });

  const employees = response.data.map((employee) => {

    employee.$HOIST$ = z.dehydrate(performGet, { employeeId: employee.employeeId });

    return {
      ...employee,
      id: employee.employeeId,
    };
  });

  if (bundle.meta.isPopulatingDedupe) {

    // Initialize the custom deduper
    await deduper.initialize(employees);
    console.log("here.......................................");

    // Pass these to the Zapier Deduper
    const changes = deduper.findChanges(employees);
    return changes.all;
  }

  if (bundle.meta.isLoadingSample) {
    const changes = deduper.findChanges(employees);
    return changes.all;
  }

  // If we get here, it means that the zap is enabled
  // The follwing will run on each polling interval
  await deduper.load();
  const changes = deduper.findChanges(employees);
  await deduper.persistChanges(employees);

  // Returns only the newly created records
  return changes.created;
};

// get a particular employee by employee id
const performGet = async (z, bundle) => {
  const response = await z.request({
    url: `${_sharedBaseUrl}/${bundle.authData.company_id}/employees/${bundle.inputData.employeeId}`,
    params: {}
  });
    
  return {
    ...response.data,
    id: response.data.employeeId,
  };
};

// find a particular employee by employee id
const performSearch = async (z, bundle) => {
  const response = await z.request({
    url: `${_sharedBaseUrl}/${bundle.authData.company_id}/employees/${bundle.inputData.employeeId}`,
    params: {}
  });

  return [{
    ...response.data,
    id: response.data.employeeId,
  }];
};

module.exports = {
  // see here for a full list of available properties:
  // https://github.com/zapier/zapier-platform/blob/master/packages/schema/docs/build/schema.md#resourceschema
  key: 'employee',
  noun: 'Employee',
  get: {
    display: {
      label: 'Get Employee',
      description: 'Gets a employee.'
    },
    operation: {
      inputFields: [
        {key: 'employeeId', required: true}
      ],
      perform: performGet
    }
  },

  list: {
    display: {
      label: 'New Employee',
      description: 'Lists the employees.'
    },
    operation: {
      perform: performList,
      canPaginate: true,
      inputFields: []
    }
  },

  search: {
    display: {
      label: 'Find Employee',
      description: 'Finds a specific employee.'
    },
    operation: {
      inputFields: [
        {
          key: 'employeeId',
          label: 'Employee Id',
          required: true,
          dynamic: 'employeeList.id',
        }
      ],
      perform: performSearch
    },
  },

  // In cases where Zapier needs to show an example record to the user, but we are unable to get a live example
  // from the API, Zapier will fallback to this hard-coded sample. It should reflect the data structure of
  // returned records, and have obvious placeholder values that we can show to any user.
  // In this resource, the sample is reused across all methods
  sample: {
    employeeId: 1,
    statusCode: 'A',
    statusTypeCode: null
  },

  // If fields are custom to each user (like spreadsheet columns), `outputFields` can create human labels
  // For a more complete example of using dynamic fields see
  // https://github.com/zapier/zapier-platform/tree/master/packages/cli#customdynamic-fields
  // Alternatively, a static field definition can be provided, to specify labels for the fields
  // In this resource, these output fields are reused across all resources
  outputFields: [
    {key: 'employeeId', label: 'Employee Id', type: 'integer'},
    {key: 'firstName', label: 'First Name', type: 'string'},
    {key: 'lastName', label: 'Last Name', type: 'string'},
    {key: 'homeAddress__emailAddress', label: 'Email Address', type: 'string'}
  ]
};
