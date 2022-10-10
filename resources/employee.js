const _sharedBaseUrl = `https://api.paylocity.com/api/v2/companies`;

const _mapEmployeeIds = (employees) => {
  return employees.map((employee) => {
    if(employee.homeAddress)
    {
      employee.emailAddress = employee.homeAddress.emailAddress || null;
    }
    return {
      ...employee,
      id: employee.employeeId,
    };
  });
}

// get a list of employees
const performList = async (z, bundle) => {
  const response = await z.request({
    url: `${_sharedBaseUrl}/${bundle.authData.company_id}/employees`,
    params: {
      pagesize: 25,
      pagenumber: 0,
      includetotalcount: true
    }
  });

  return _mapEmployeeIds(response.data);
};

// get a particular employee by employee id
const performGet = async (z, bundle) => {
  const response = await z.request({
    url: `${_sharedBaseUrl}/${bundle.authData.company_id}/employees/${bundle.inputData.employeeId}`,
    params: {}
  });
  let employees = [];
  employees.push(response.data);
  const data = _mapEmployeeIds(employees);
  return data[0];
};

// find a particular employee by employee id
const performSearch = async (z, bundle) => {
  const response = await z.request({
    url: `${_sharedBaseUrl}/${bundle.authData.company_id}/employees/${bundle.inputData.employeeId}`,
    params: {}
  });
  let employees = [];
  employees.push(response.data);
  const data = _mapEmployeeIds(employees);
  return data;
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
      // `inputFields` defines the fields a user could provide
      // Zapier will pass them in as `bundle.inputData` later. They're optional on triggers, but required on searches and creates.
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
        {key: 'employeeId', label: 'Employee Id', required: true}
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
    {key: 'employeeId', label: 'Employee Id'},
    {key: 'firstName', label: 'First Name'},
    {key: 'lastName', label: 'Last Name'},
    {key: 'emailAddress', label: 'Email Address'}
  ]
};
