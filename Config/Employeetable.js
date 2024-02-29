// Load the AWS SDK for Node.js
const AWS = require("aws-sdk");
// Set the region
AWS.config.update({
  region: process.env.AWS_DEFAULT_REGION,
  endpoint: process.env.endpoint,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

// Create the DynamoDB service object
// var ddb = new AWS.DynamoDB({ apiVersion: "2012-08-10" });
const ddb = new AWS.DynamoDB();
const tableName = "Employee";
const params2 = {
  TableName: "Employee",
};
const CreateEmployeeTable = () => {
  const params = {
    AttributeDefinitions: [
      {
        AttributeName: "EMPLOYEE_ID",
        AttributeType: "N",
      },
      {
        AttributeName: "EMPLOYEE_NAME",
        AttributeType: "S",
      },
    ],
    KeySchema: [
      {
        AttributeName: "EMPLOYEE_ID",
        KeyType: "HASH",
      },
      {
        AttributeName: "EMPLOYEE_NAME",
        KeyType: "RANGE",
      },
    ],
    ProvisionedThroughput: {
      ReadCapacityUnits: 1,
      WriteCapacityUnits: 1,
    },
    TableName: tableName,
    StreamSpecification: {
      StreamEnabled: false,
    },
  };

  // Call DynamoDB to create the table
  

  // describe table if pre existed
  ddb.describeTable(params2, (err, data) => {
    if (err && err.code === "ResourceNotFoundException") {
      //create table if the table is not created
      ddb.createTable(params, function (err, data) {
        if (err) {
          console.log("Error", err);
        } else {
          console.log("Table Created", data);
        }
      });
      console.log("Table does not exist.");
    } else if (err) {
      console.error("Unable to describe table:", err);
    } else {

      console.log("Table exists. Table description:", data);
    }
  });
};
module.exports = CreateEmployeeTable;
