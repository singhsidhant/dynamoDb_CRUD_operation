const AWS = require("aws-sdk");
const {
  DynamoDBDocumentClient,
  QueryCommand,
} = require("@aws-sdk/lib-dynamodb");
AWS.config.update({
  region: process.env.AWS_DEFAULT_REGION,
  endpoint: process.env.endpoint,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});
const DocumentClient = new AWS.DynamoDB.DocumentClient(); //higher level abstraction
const dynamodb = new AWS.DynamoDB(); //low level abstraction
// let ddb = new AWS.DynamoDB({ apiVersion: "2012-08-10" });
const TABLE_NAME = process.env.tableName;



//check for existing eid in records rable
const checkIfEmployeeExists = async (employeeId, name) => {
  try {
    console.log("EployeeID", employeeId);
    const params = {
      TableName: process.env.tableName,
      Key: {
        EMPLOYEE_ID: employeeId,
        EMPLOYEE_NAME: name,
      },
    };

    // console.log('query executed');
    // const data = await client.query(params);
    console.log("Querying the table with params:", params);
    const data = await DocumentClient.get(params).promise();

    console.log("Query response:", data);

    if (data.Item) {
      console.log("Items found:", data.Item);
      return true;
    } else {
      console.log("No items found matching the query.");
      return false;
    }
  } catch (error) {
    console.error("Error checking employee existence:", error);
    throw error;
  }
};


//get employee Service logic
const getemployee = async () => {
  const params = {
    TableName: TABLE_NAME,
  };
  let lastEvaluatedKey = "dummy";
  const itemsAll = [];
  while (lastEvaluatedKey) {
    const data = await DocumentClient.scan(params).promise();
    itemsAll.push(...data.Items);
    lastEvaluatedKey = data.LastEvaluatedKey;
    if (lastEvaluatedKey) {
      params.ExclusiveStartKey = lastEvaluatedKey;
    }
  }
  return itemsAll;
};
//get getemployeebyId Service logic
const getemployeebyId = async (eid, ename) => {
  const transactItems = [
    {
      Get: {
        TableName: TABLE_NAME,
        Key: {
          "EMPLOYEE_ID": eid,
          "EMPLOYEE_NAME": ename
        }
      }
    },
  ];

  const params = {
    TransactItems: transactItems
  };

  try {
    const data = await DocumentClient.transactGet(params).promise();
    const items = data.Responses.map(response => response.Item);
    return items;
  } catch (error) {
    console.error("Unable to fetch employee:", error);
    throw error;
  }
};


//get getemployeeby_phone Service logic
const getemployeeby_phone = async (Phonevalue) => {
  const table = TABLE_NAME;
  const params = {
    TableName: table,
    IndexName: "PHONE_NO",
    KeyConditionExpression: "Phone = :phoneno",
    FilterExpression: "age > :ageVal",
    ScanIndexForward: true, //true = ascending, false = descending
    ExpressionAttributeValues: {
      ":phoneno": Phonevalue,
      ":ageVal": 5,
    },
  };
  try {
    const data = await new Promise((resolve, reject) => {
      DocumentClient.query(params, (err, data) => {
        if (err) {
          console.error(
            "Unable to read item. Error JSON:",
            JSON.stringify(err, null, 2)
          );
          reject(err);
        } else {
          console.log("GetItem succeeded:", JSON.stringify(data, null, 2));
          resolve(data.Items);
        }
      });
    });

    return data;
  } catch (err) {
    throw err;
  }
};

const updateemployee = async (pk, sk, value, fieldToUpdate) => {
  //It is a practice to update details from Url
  // http://localhost:3000/api/v1/employee/updateemployee?EMPLOYEE_ID=123&EMPLOYEE_NAME=John&CHANGE_EMAIL_ID=newemail@example.com

  // const updateExpression = "SET EMPLOYEE_EMAIL_ID = :value1";
  // const expressionAttributeValues = {
  //   ":value1": value,
  // };
  // const params = {
  //   TableName: TABLE_NAME,
  //   Key: {
  //     EMPLOYEE_ID: pk,
  //     EMPLOYEE_NAME: sk,
  //   },
  //   UpdateExpression: updateExpression,
  //   ExpressionAttributeValues: expressionAttributeValues,
  //   ReturnValues: "ALL_NEW",
  // };
  // console.log("PK",pk);
  // console.log("SK",sk);
  // console.log("Value",value);

  const params = {
    TableName: TABLE_NAME,
    Key: {
      EMPLOYEE_ID: pk,
      EMPLOYEE_NAME: sk,
    },
    UpdateExpression: "SET #field = :newField", // Update the Salary attribute
    ExpressionAttributeNames: {
      "#field": fieldToUpdate, // Attribute to update
    },
    ExpressionAttributeValues: {
      ":newField": value, // New value for updation
    },
  };
  try {
    const updatedItem = await DocumentClient.update(params).promise();
    console.log("Updated Item", updatedItem);
    return updatedItem; // Return the updated item
  } catch (error) {
    console.error("Error updating item:", error);
    throw error; // Throw the error to handle it in the controller function
  }
};


const addemployeeFunc = async (itemObject) => {
  const pk = 2;
  const sk = "Rajan Pandey";
  const newEmail = itemObject.NEW_MAIL;

  const params = {
    TransactItems: [
      {
        Put: {
          TableName: TABLE_NAME,
          Item: itemObject,
          // ConditionExpression: 'attribute_not_exists(pk)', // Optional: Condition to be satisfied for the write operation
        },
      },
      {
        Update: {
          TableName: TABLE_NAME,
          Key: {
            EMPLOYEE_ID: pk,
            EMPLOYEE_NAME: sk,
          },
          UpdateExpression: "SET email = :newEmail", // Update the email attribute
          ExpressionAttributeValues: {  
            ":newEmail": newEmail,
          },
        },
      },
      // Add more transaction items if needed
    ],
  };

  try {
    const data = await DocumentClient.transactWrite(params).promise();
    console.log("Transact write successful:", JSON.stringify(data, null, 2));
  } catch (err) {
    console.error("Unable to perform transact write. Error JSON:", JSON.stringify(err, null, 2));
  }
};



// const addemployeeFunc = async (itemObject) => {
//   console.log("========",itemObject, TABLE_NAME);
//   console.log("----------------->",itemObject.EMPLOYEE_ID)
//   const params = {
//     TableName: TABLE_NAME,
//     Item: {
//       itemObject
//     },
//     // ConditionExpression: 'attribute_not_exists(itemObject.EMPLOYEE_ID)' // Ensures EMPLOYEE_ID doesn't already exist
//   };
//   // DocumentClient.put(params).promise()
//   // .then(data => {
//   //   console.log('Added item:', data);
//   // })
//   // .catch(err => {
//   //   if (err.code === 'ConditionalCheckFailedException') {
//   //     console.log('Record already exists');
//   //   } else {
//   //     console.error('Unable to add item. Error:', err);
//   //   }
//   // });
//   // try {
//   //   console.log("Result evaluation start")
//   //   const result = await DocumentClient.put(params).promise();
//   //   console.log("Result evaluation start")
//   //   return result; // Return the result if the operation succeeds
//   // } catch (err) {
//   //     if (err.code === 'ConditionalCheckFailedException') {
//   //           console.log('Record already exists');
//   //     } else {
//   //         console.error('Unable to add item. Error:', err);
//   //     }
//   // }
//   return await DocumentClient.put(params).promise();
// };

// const addemployeeFunc = async (itemObject) => {
//   console.log(itemObject, TABLE_NAME);
//   const pk = itemObject.EMPLOYEE_ID;
//   const sk = itemObject.EMPLOYEE_NAME;
//   const value=itemObject.NEW_MAIL;
//   console.log("PK---", pk);
//   // const params = {
//   //   TableName: TABLE_NAME,
//   //   Item: itemObject,
//   //   ConditionExpression: "attribute_not_exists(itemObject.EMPLOYEE_ID)",
//   // };
//   const transactionOps = [
//     {
//       Put: {
//         TableName: TABLE_NAME,
//         Item: itemObject,
//       },
//     },
//     {
//       Update: {
//         TableName: TABLE_NAME,
//         Key: {
//           EMPLOYEE_ID: pk,
//           EMPLOYEE_NAME: sk,
//         },
//         UpdateExpression: "SET #Email = :newField", // Update the Salary attribute
//         ExpressionAttributeNames: {
//           "#Email": "email", // Attribute to update
//         },
//         ExpressionAttributeValues: {
//           ":newField": value, // New value for updation
//         },
//       },
//     },
//   ];
//   // try {
//   //   const data = await new Promise((resolve, reject) => {
//   //     DocumentClient.query(params, (err, data) => {
//   //       if (err) {
//   //         console.error(
//   //           "Unable to read item. Error JSON:",
//   //           JSON.stringify(err, null, 2)
//   //         );
//   //         reject(err);
//   //       } else {
//   //         console.log("GetItem succeeded:", JSON.stringify(data, null, 2));
//   //         resolve(data.Items);
//   //       }
//   //     });
//   //   });

//   //   return data;
//   // } catch (err) {
//   //   throw err;
//   // }
//   return await dynamodb.transactWriteItems({ TransactItems: transactionOps }).promise();
//   // try {
//   //   const data = await dynamodb.transactWriteItems({ TransactItems: transactionOps }).promise();
//   //       console.log("Employee added successfully. Transaction response:", data);
//   //   } catch (err) {
//   //       console.error("Failed to add employee. Error:", err);
//   //   }
// };

const deleteemployee = async (eid, ename) => {
  const params = {
    TableName: TABLE_NAME,
    Key: {
      EMPLOYEE_ID: eid,
      EMPLOYEE_NAME: ename,
    },
  };
  return await DocumentClient.delete(params).promise();
};

const deleteTable = async () => {
  const params = {
    TableName: TABLE_NAME,
  };

  try {
    console.log("Deleting table...");
    await dynamodb.deleteTable(params).promise();
    console.log("Table deleted successfully");
  } catch (err) {
    if (err.code === "ResourceNotFoundException") {
      console.log("Error: Table not found");
    } else if (err.code === "ResourceInUseException") {
      console.log("Error: Table in use");
    } else {
      console.error("Error:", err);
    }
  }
};

module.exports = {
  getemployeebyId,
  deleteemployee,
  updateemployee,
  getemployee,
  checkIfEmployeeExists,
  addemployeeFunc,
  deleteTable,
  getemployeeby_phone,
};
