const {
  getemployeebyId,
  deleteemployee,
  updateemployee,
  getemployee,
  checkIfEmployeeExists,
  addemployeeFunc,
  deleteTable,
  getemployeebyGSI,
} = require("../EmployeeService/employee");

// const addEmployee = async (req, res) => {
//   const body = req.body;
//   console.log(body);
//   try {
//     const newEmployee = await addemployee(body);
//     console.log("newEmployee", newEmployee);
//     return res.status(200).json("new employee added successful");
//   } catch (err) {
//     console.error(err);
//     return res.status(500).json("Something went wrong");
//   }
// };


const addEmployee = async (req, res) => {
  const body = req.body;
  console.log("Data of req body",body);
  // console.log("region",process.env.AWS_DEFAULT_REGION)
  // console.log("endpoint",process.env.endpoint)
  // console.log("AWS_ACCESS_KEY_ID",process.env.AWS_ACCESS_KEY_ID)
  // console.log("AWS_SECRET_ACCESS_KEY",process.env.AWS_SECRET_ACCESS_KEY)
  
  try {
    // Check if an employee with the same EMPLOYEE_ID already exists
    console.log("Start the work of checking")
    const employeeExists = await checkIfEmployeeExists(body.EMPLOYEE_ID,body.EMPLOYEE_NAME);
    console.log("employeeExists right",employeeExists)
    if (employeeExists) {
      console.log("Employee with the same EMPLOYEE_ID already exists.");
      return res.status(400).json("Employee with the same EMPLOYEE_ID already exists.");
    }

    // If the employee does not exist, proceed with adding the employee
    // Implement your logic to add the employee to the DynamoDB table here
    console.log("Add employee func starts here")
    const newEmployee = await addemployeeFunc(body);
    console.log("newEmployee added data", newEmployee);
    // Return success message
    return res.status(200).json("New employee added successfully");
  } catch (err) {
    console.error(err);
    return res.status(500).json("Something went wrong");
  }
};

const updateEmployee = async (req, res) => {
  console.log(req.query);
  const pk = parseInt(req.query.EMPLOYEE_ID);
  const sk = req.query.EMPLOYEE_NAME;
  const value = req.query.CHANGE_EMAIL_ID;

  try {
    const employee = await updateemployee(pk, sk, value);
    res.status(200).json(employee);
  } catch (err) {
    console.error(err);
    res.status(err.statusCode || 500).json("Something went wrong");
  }
};


const deleteEmployee = async (req, res) => {
  try {
    const eid = parseInt(req.query.EMPLOYEE_ID);
    const ename = req.query.EMPLOYEE_NAME;

    const deleteEmployee = await deleteemployee(eid, ename);
    console.log("deleteEmployee", deleteEmployee);
    return res.status(200).json("deleteEmployee  successful");
  } catch (err) {
    console.error(err);
    return res.status(500).json("Something went wrong");
  }
};

const deletetable = async (req,res) => {
    try{
      const Table = await deleteTable();
      console.log("Table", Table);
      return res.status(200).json("Table  successful");
    }catch(err){
      console.error(err);
      return res.status(500).json("Something went wrong");
    }
};

const getEmployee = async (req, res) => {
  try {
    const employee = await getemployee();
    console.log("getEmployee",employee)
    res.status(200).json(employee);
  } catch (err) {
    console.error(err);
    res.status(err.statusCode || 500).json("Something went wrong");
  }
};


const getEmployeebyGSI = async (req, res) => {
  try {
    const employee = await getemployeebyGSI();
    // Log the retrieved employee data
    console.log("Retrieved employee data:", employee);
    // Send the retrieved employee data as a JSON response
    res.status(200).json(employee);
  } catch (err) {
    console.error(err);
    res.status(err.statusCode || 500).json("Something went wrong");
  }
};
// const getEmployeebyId = async (req, res) => {
//   const eid = parseInt(req.query.EMPLOYEE_ID);
//   const ename = req.query.EMPLOYEE_NAME;
//   try {
//     const employee = await getemployeebyId(eid, ename);
//     res.status(200).json(employee);
//   } catch (err) {
//     console.error(err);
//     res.status(err.statusCode || 500).json("Something went wrong");
//   }
// };


const getEmployeebyId = async (req, res) => {
  const eid = parseInt(req.query.EMPLOYEE_ID);
  const ename = req.query.EMPLOYEE_NAME;
  
  // Check if eid is a valid integer
  if (isNaN(eid)) {
    return res.status(400).json("EMPLOYEE_ID must be a valid integer");
  }
  
  try {
    const employee = await getemployeebyId(eid, ename);
    res.status(200).json(employee);
  } catch (err) {
    console.error(err);
    res.status(err.statusCode || 500).json("Something went wrong");
  }
};


module.exports = {
  addEmployee,
  updateEmployee,
  deleteEmployee,
  getEmployee,
  deletetable,
  getEmployeebyId,
  getEmployeebyGSI,
};
