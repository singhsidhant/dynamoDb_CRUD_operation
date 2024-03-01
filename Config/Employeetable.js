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
    TableName: tableName, // Replace 'YourTableName' with your actual table name
    AttributeDefinitions: [
      // Include definitions for all primary and index key attributes
      { AttributeName: "EMPLOYEE_ID", AttributeType: "N" },
      { AttributeName: "EMPLOYEE_NAME", AttributeType: "S" },
      { AttributeName: "Phone", AttributeType: "S" },
      { AttributeName: "department", AttributeType: "S" }, // New attribute definition
    ],
    GlobalSecondaryIndexUpdates: [
      // Include updates for existing GSIs
      {
        // Update for existing GSI for 'Phone' attribute
        Update: {
          IndexName: "PHONE_NO",
          ProvisionedThroughput: {
            ReadCapacityUnits: 400,
            WriteCapacityUnits: 400,
          },
        },
      },
      {
        // Update for new GSI for 'department' attribute
        Create: {
          IndexName: "DEPARTMENT_GSI",
          KeySchema: [{ AttributeName: "department", KeyType: "HASH" }],
          Projection: {
            ProjectionType: "ALL",
          },
          ProvisionedThroughput: {
            ReadCapacityUnits: 400,
            WriteCapacityUnits: 400,
          },
        },
      },
    ],
  };

  //Run this script if you want to update the table

  // ddb.updateTable(params, (err, data) => {
  //     if (err) {
  //         console.error('Unable to update table:', err);
  //     } else {
  //         console.log('Table updated successfully:', data);
  //     }
  // });

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

  //Run this if you want to check which one is GSI indexes
  ddb.describeTable(params2, (err, data) => {
      if (err) {
          console.log("if part")
          console.error('Unable to describe table:', err);
      } else {
          console.log("Else part start")
          const gsiList = data.Table.GlobalSecondaryIndexes;
          console.log("Else part start")
          if (gsiList && gsiList.length > 0) {
              console.log('Global Secondary Indexes on the table:');
              gsiList.forEach((gsi, index) => {
                  console.log(`Index ${index + 1}: ${gsi.IndexName}`);
              });
          } else {
              console.log('No Global Secondary Indexes found on the table.');
          }
      }
  });
};
module.exports = CreateEmployeeTable;
