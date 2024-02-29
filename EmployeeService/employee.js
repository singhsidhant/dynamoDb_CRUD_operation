const AWS = require("aws-sdk");
const { DynamoDBDocumentClient, QueryCommand } = require("@aws-sdk/lib-dynamodb");
AWS.config.update({
  region: process.env.AWS_DEFAULT_REGION,
  endpoint: process.env.endpoint,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});
const DocumentClient = new AWS.DynamoDB.DocumentClient();//higher level abstraction
const dynamodb = new AWS.DynamoDB();//low level abstraction
// let ddb = new AWS.DynamoDB({ apiVersion: "2012-08-10" });
const TABLE_NAME = process.env.tableName;

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

//check for existing eid in records rable 

const checkIfEmployeeExists = async (employeeId,name) => {
  try {
    // console.log("Checking if employee exists...");
    // console.log("Table name:", process.env.tableName);
    // console.log("AWS region:", process.env.AWS_DEFAULT_REGION);
    // console.log("Endpoint:", process.env.endpoint);
    // console.log("Access key ID:", process.env.AWS_ACCESS_KEY_ID);

    // const client = new DynamoDBDocumentClient(); // Ensure to pass configuration options if needed
    // const client=DocumentClient;
    console.log(employeeId,"ku");
    // const params = {
    //   TableName: process.env.tableName,
    //   KeyConditionExpression: "EMPLOYEE_ID = :employeeId AND EMPLOYEE_NAME= "",
    //   ExpressionAttributeValues: {
    //     ":employeeId": employeeId
    //   }
    // };
    const params = {
      TableName: process.env.tableName,
      Key: {
        EMPLOYEE_ID: employeeId,
        EMPLOYEE_NAME:name
      },
    };
    
    // console.log('query executed');
    // const data = await client.query(params);
    console.log('Querying the table with params:', params);
    const data = await DocumentClient.get(params).promise();

    console.log("Query response:", data);
    
    if (data.Item) {
      console.log("Items found:", data.Item);
      return true;
    } else {
      console.log("No items found matching the query.");
      return false
    }

  
  } catch (error) {
    console.error("Error checking employee existence:", error);
    throw error;
  }
};



const getemployeebyId = async (eid, ename) => {
  // console.log(id, TABLE_NAME);
  const params = {
    TableName: TABLE_NAME,
    Key: {
      EMPLOYEE_ID: eid,
      EMPLOYEE_NAME: ename,
    },
  };
  return await DocumentClient.get(params).promise();
};

const getemployeebyGSI=async()=>{
  const table = TABLE_NAME;
  const params = {
      TableName : table,
      IndexName : 'DEPARTMENT_NAME',
      KeyConditionExpression : 'department = :departmentVal', 
      FilterExpression: 'age > :ageVal',
      ScanIndexForward: true,//true = ascending, false = descending 
      ExpressionAttributeValues : {
          ':departmentVal' : 'EL' ,
          ':ageVal': 30
      }
  };
  try {
    const data = await new Promise((resolve, reject) => {
      DocumentClient.query(params, (err, data) => {
        if (err) {
          console.error("Unable to read item. Error JSON:", JSON.stringify(err, null, 2));
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
}


const updateemployee = async (pk, sk, value) => {
  const updateExpression = "SET EMPLOYEE_EMAIL_ID = :value1";
  const expressionAttributeValues = {
    ":value1": value,
  };
  const params = {
    TableName: TABLE_NAME,
    Key: {
      EMPLOYEE_ID: pk,
      EMPLOYEE_NAME: sk,
    },
    UpdateExpression: updateExpression,
    ExpressionAttributeValues: expressionAttributeValues,
    ReturnValues: "ALL_NEW",
  };
  return await DocumentClient.update(params).promise();
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


const addemployeeFunc = async (itemObject) => {
  console.log(itemObject, TABLE_NAME);
  const params = {
    TableName: TABLE_NAME,
    Item: itemObject,
    ConditionExpression: 'attribute_not_exists(itemObject.EMPLOYEE_ID)'
  };
  return await DocumentClient.put(params).promise();
};
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
  getemployeebyGSI,
};
