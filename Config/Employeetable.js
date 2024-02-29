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
  // const params = {
  //   AttributeDefinitions: [
  //     {
  //       AttributeName: "EMPLOYEE_ID",
  //       AttributeType: "N",
  //     },
  //     {
  //       AttributeName: "EMPLOYEE_NAME",
  //       AttributeType: "S",
  //     },
  //   ],
  //   KeySchema: [
  //     {
  //       AttributeName: "EMPLOYEE_ID",
  //       KeyType: "HASH",
  //     },
  //     {
  //       AttributeName: "EMPLOYEE_NAME",
  //       KeyType: "RANGE",
  //     },
  //   ],
  //   ProvisionedThroughput: {
  //     ReadCapacityUnits: 1,
  //     WriteCapacityUnits: 1,
  //   },
  //   TableName: tableName,
  //   StreamSpecification: {
  //     StreamEnabled: false,
  //   },
  // };

  // params define
  const params = {
    TableName: tableName,
    KeySchema: [ // The type of of schema.  Must start with a HASH type, with an optional second RANGE.
        { // Required HASH type attribute
            AttributeName: 'EMPLOYEE_ID',
            KeyType: 'HASH',
        },
        { // Required HASH type attribute
            AttributeName: 'EMPLOYEE_NAME',
            KeyType: 'RANGE',
        }            

    ],
    AttributeDefinitions: [ // The names and types of all primary and index key attributes only
        {
            AttributeName: 'EMPLOYEE_ID',
            AttributeType: 'N', // (S | N | B) for string, number, binary
        },
        {
            AttributeName: 'EMPLOYEE_NAME',
            AttributeType: 'S', // (S | N | B) for string, number, binary
        },
        {
            AttributeName: 'department',
            AttributeType: 'S', // (S | N | B) for string, number, binary
        },

    ],
    ProvisionedThroughput: { // required provisioned throughput for the table
        ReadCapacityUnits: 400, 
        WriteCapacityUnits: 400, 
    },
    GlobalSecondaryIndexes: [ // optional (list of GlobalSecondaryIndex)
        { 
            IndexName: 'DEPARTMENT_NAME', 
            KeySchema: [
                { // Required HASH type attribute
                    AttributeName: 'department',
                    KeyType: 'HASH',
                }
            ],
            Projection: { // attributes to project into the index
                ProjectionType: 'ALL' // (ALL | KEYS_ONLY | INCLUDE)
            },
            ProvisionedThroughput: { // throughput to provision to the index
                ReadCapacityUnits: 400,
                WriteCapacityUnits: 400,
            },
        },
        // ... more global secondary indexes ...
    ],

};

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
