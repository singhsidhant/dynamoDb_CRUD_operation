const express = require("express");
const router = express.Router();
const employee = require("../../../Controllers/employee");
router.post("/addemployee", employee.addEmployee);
router.delete("/deleteemployee", employee.deleteEmployee);
router.delete("/deletetable", employee.deletetable);
router.put("/updateemployee", employee.updateEmployee);
router.put("/updateEmployeeByphone", employee.updateEmployeeByphone);
router.get("/getemployee", employee.getEmployee);
router.get("/getEmployeebyphone", employee.getEmployeebyphone);
router.get("/getemployeeById", employee.getEmployeebyId);
module.exports = router;
