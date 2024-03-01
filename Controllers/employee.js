const {
  getemployeebyId,
  deleteemployee,
  updateemployee,
  getemployee,
  checkIfEmployeeExists,
  addemployeeFunc,
  deleteTable,
  getemployeeby_phone,
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
  // console.log(req.query);
  // const pk = parseInt(req.query.EMPLOYEE_ID);
  // const sk = req.query.EMPLOYEE_NAME;
  // const value = req.query.CHANGE_EMAIL_ID;
  const pk = req.body.EMPLOYEE_ID;
  const sk = req.body.EMPLOYEE_NAME;
  const value = req.body.NEW_MAIL;
  try {
    const employee = await updateemployee(pk, sk, value,"email");
      console.log(" Employee", employee);
    res.status(200).json("Sucessfully value is updated");
  } catch (err) {
    console.error(err);
    res.status(err.statusCode || 500).json("Something went wrong");
  }
};

const updateEmployeeByphone = async (req, res) => {
  const phoneVal=req.body.Phone;
  try {
    // Query the GSI to find items that match the given criteria
    const employees = await getemployeeby_phone(phoneVal);
    console.log("employees======>>",employees);
    // Update the desired field in each retrieved item
    // for (const employee of employees) {
    //   // Extract the primary key attributes from the retrieved item
    //   const { EMPLOYEE_ID, EMPLOYEE_NAME } = employee;
    //   console.log("------",EMPLOYEE_ID,EMPLOYEE_NAME)
      
    //   // Perform the update operation on the original table using the primary key
    //   const updatedItem = await updateemployee(EMPLOYEE_ID, EMPLOYEE_NAME, req.body.NEW_EMAIL);

    //   // Log the updated item
    //   console.log("Updated item:", updatedItem);
    // }

    // Update the department for items with department "EE"
    for (const employee of employees) {
      if (employee.department === "CSE" && employee.Phone === phoneVal) {
        // Extract the primary key attributes from the retrieved item
        const { EMPLOYEE_ID, EMPLOYEE_NAME } = employee;
        
        // Perform the update operation on the original table using the primary key
        const updatedItem = await updateemployee(EMPLOYEE_ID, EMPLOYEE_NAME, "EL","department");

        // Log the updated item
        console.log("Updated item:", updatedItem);
      }
    }

    // Send a success response
    res.status(200).json("Successfully updated field(s) for matching items");
  } catch (err) {
    console.error(err);
    res.status(err.statusCode || 500).json("Something went wrong");
  }
};

// module.exports = {
//   // Other controller functions...
//   updateEmployeeByGSI,
// };



const deleteEmployee = async (req, res) => {
  const pk = req.body.EMPLOYEE_ID;
  const sk = req.body.EMPLOYEE_NAME;
  try {
    const deleteEmployee = await deleteemployee(pk,sk);
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


const getEmployeebyphone = async (req, res) => {
  const phoneVal=req.body.Phone;
  try {
    const employee = await getemployeeby_phone(phoneVal);
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
  const pk = req.body.EMPLOYEE_ID;
  const sk = req.body.EMPLOYEE_NAME;
  
  // Check if eid is a valid integer
  if (isNaN(pk)) {
    return res.status(400).json("EMPLOYEE_ID must be a valid integer");
  }
  
  try {
    const employee = await getemployeebyId(pk, sk);
    res.status(200).json(employee);
  } catch (err) {
    console.error(err);
    res.status(err.statusCode || 500).json("Something went wrong");
  } 
};


module.exports = {
  addEmployee,
  updateEmployee,
  updateEmployeeByphone,  
  deleteEmployee,
  getEmployee,
  deletetable,
  getEmployeebyId,
  getEmployeebyphone,
};
