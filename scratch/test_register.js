const axios = require('axios');

const testData = {
  fullName: 'Test Officer',
  email: 'test@gov.in',
  employeeId: 'EMP' + Date.now(),
  department: 'Road Department',
  designation: 'Engineer',
  mobile: '9876543210',
  password: 'password123',
  officeLocation: 'HQ'
};

async function run() {
  try {
    const res = await axios.post('http://localhost:5000/api/dept/register', testData);
    console.log('Success:', res.data);
  } catch (err) {
    console.log('Error Status:', err.response?.status);
    console.log('Error Data:', err.response?.data);
  }
}

run();
