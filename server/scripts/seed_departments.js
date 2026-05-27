const axios = require('axios');

async function seed() {
  const departments = [
    {
      fullName: "Sewage Department Admin",
      email: "sewagedepartment@gov.in",
      employeeId: "SD001",
      department: "Sewage Department",
      designation: "Head",
      mobile: "+911111111111",
      password: "random",
      officeLocation: "Sewage HQ",
      ward: "",
      zone: ""
    },
    {
      fullName: "Road Department Admin",
      email: "roaddepartment@gov.in",
      employeeId: "RD001",
      department: "Road Department",
      designation: "Head",
      mobile: "+912222222222",
      password: "random",
      officeLocation: "Road HQ",
      ward: "",
      zone: ""
    },
    {
      fullName: "Waste Department Admin",
      email: "wastedepartment@gov.in",
      employeeId: "WD001",
      department: "Waste Department",
      designation: "Head",
      mobile: "+913333333333",
      password: "random",
      officeLocation: "Waste HQ",
      ward: "",
      zone: ""
    },
    {
      fullName: "Water Department Admin",
      email: "waterdepartment@gov.in",
      employeeId: "WTD001",
      department: "Water Department",
      designation: "Head",
      mobile: "+914444444444",
      password: "random",
      officeLocation: "Water HQ",
      ward: "",
      zone: ""
    },
    {
      fullName: "Electric Department Admin",
      email: "electricdepartment@gov.in",
      employeeId: "ED001",
      department: "Electric Department",
      designation: "Head",
      mobile: "+915555555555",
      password: "random",
      officeLocation: "Electric HQ",
      ward: "",
      zone: ""
    }
  ];

  for (const userData of departments) {
    try {
      const response = await axios.post('http://localhost:5000/api/dept/register', userData);
      console.log(`[SUCCESS] Registered: ${userData.email}`);
    } catch (err) {
      if (err.response && err.response.data) {
        console.error(`[FAILED] ${userData.email}:`, err.response.data.error);
      } else {
        console.error(`[FAILED] ${userData.email}:`, err.message);
      }
    }
  }
}

seed();
