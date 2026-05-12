const axios = require('axios');

async function seed() {
  const userData = {
    fullName: "Ward 85 Admin",
    email: "admin.ward85@bmc.gov.in",
    employeeId: "BMC85001",
    department: "Municipal Corporation",
    designation: "Ward Officer",
    mobile: "+919988776655",
    password: "password85",
    officeLocation: "Nagar Nigam Office Chhan (ward no 85)",
    ward: "Ward 85",
    zone: "East-South East Bhopal"
  };

  try {
    const response = await axios.post('http://localhost:5000/api/dept/register', userData);
    console.log('Ward 85 Admin registered successfully:', response.data.user);
  } catch (err) {
    if (err.response && err.response.data) {
      console.error('Registration failed:', err.response.data.error);
    } else {
      console.error('Registration failed:', err.message);
    }
  }
}

seed();
