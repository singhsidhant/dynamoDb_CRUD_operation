const express = require("express");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 3000;
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//create the table
const createEmployeeTable = require("./Config/Employeetable");
createEmployeeTable();

//mounting routes
app.use("/", require("./Routes"));
app.listen(port, function (err) {
  if (err) {
    console.log("error to connect the ", err);
    return;
  } else {
    console.log("server is running is on the port", port);
  }
});
