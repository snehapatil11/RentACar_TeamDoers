var AWS = require('aws-sdk')
var express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
require('dotenv').config();
var app = express();

let awsConfig = {
 "region": process.env.region,
 "endpoint": process.env.endpoint,
 "accessKeyId": process.env.accessKeyId, 
 "secretAccessKey": process.env.secretAccessKey
};

app.use(cors());
app.options('*', cors());


AWS.config.update(awsConfig);
const dynamoDb = new AWS.DynamoDB.DocumentClient();

app.use(bodyParser.json({ type: 'application/json' }));

app.listen(8081, () => {
    console.log("Server running on port 8081");
})
app.get('/', function (req, res) {
  res.send('Hello World from Team Doers!')
})

app.get('/api/allVehicles', function (req, res) {
    const params = { 
      TableName: "Vehicle"
    }    
    dynamoDb.scan(params, (error, result) => {
  
      if (error) {  
        console.log(error);  
        return res.status(400).json({ error: 'Could not get user' });  
      }
  
      if (result) { 
        return res.json(result.Items);
      } 
      else { return res.status(404).json({ error: "User not found" }); }  
    });
  
})

app.get('/api/vehicleTransactions/:vehicleId', function (req, res) {
  const id = req.params.vehicleId;
  console.log(id);
  const params = { 
    TableName: "VehicleTransaction",
    FilterExpression: '#vehicleId = :vehicleId',
    ExpressionAttributeNames: {
        '#vehicleId': 'vehicleId',
    },
    ExpressionAttributeValues: {
        ':vehicleId': id,
    },
  }    
  dynamoDb.scan(params, (error, result) => {

    if (error) {  
      console.log(error);  
      return res.status(400).json({ error: 'Could not get user' });  
    }

    if (result) { 
      return res.json(result.Items);
    } 
    else { return res.status(404).json({ error: "User not found" }); }  
  });

})

app.post('/api/postVehicleTransaction', function(req, res){
  const params = {  
    TableName: "VehicleTransaction",
    Item: req.body
  }
  console.log(params);
  dynamoDb.put(params, (error, result) =>{
    
    if(error){
      console.log(error);
      console.log(params);
      return res.status(400).json({ error: 'Could not insert vehicle transaction' });
    }
    if(result){
      console.log(result);
      res.setHeader('Access-Control-Allow-Origin', '*');
      return res.json({result});
    }
    else
    return res.status(400).json({ error: 'Could not insert vehicle transaction' });  
  })

})

app.get('/users/:email', function (req, res) {
  const useremail = req.params.email;
  console.log(useremail);
  const params = { 
    TableName: "storageFiles",
    FilterExpression: '#email = :email',
    ExpressionAttributeNames: {
        '#email': 'Email',
    },
    ExpressionAttributeValues: {
        ':email': useremail,
    },
  }    
  dynamoDb.scan(params, (error, result) => {

    if (error) {  
      console.log(error);  
      return res.status(400).json({ error: 'Could not get user' });  
    }

    if (result) { 
      return res.json(result.Items);
    } 
    else { return res.status(404).json({ error: "User not found" }); }  
  });

})

app.get('/file/:filename', function (req, res) {
  const file = req.params.filename;
  const params = { 
    TableName: "storageFiles",
    FilterExpression: '#filename = :filename',
    ExpressionAttributeNames: {
        '#filename': 'FileName',
    },
    ExpressionAttributeValues: {
        ':filename': file,
    },
  }    
  dynamoDb.scan(params, (error, result) => {

    if (error) {  
      console.log(error);  
      return res.status(400).json({ error: 'Could not get user' });  
    }

    if (result) { 
      res.setHeader('Access-Control-Allow-Origin', '*');
      return res.json(result.Items);
    } 
    else { return res.status(404).json({ error: "User not found" }); }  
  });

})

app.get('/updatefiledata/:fileId',function(req, res){
  console.log("on server for update");
  var time = new Date().toDateString() + " " + new Date().toLocaleTimeString();
  var params = {
    TableName: "storageFiles",
    Key: 
    {
      "Id": req.params.fileId      
    },
    UpdateExpression: "SET UpdatedAt = :time",
    ExpressionAttributeValues:{
        ":time": time
    },
    ReturnValues:"UPDATED_NEW"
  };
  console.log(params);
  dynamoDb.update(params, function(err, data) {
    if (err) {
        console.error("Unable to update item. Error JSON:", JSON.stringify(err, null, 2));
    } else {
        console.log("UpdateItem succeeded:", JSON.stringify(data, null, 2));
        res.json(data);
    }
  });
})
app.delete('/deletefiledata/:fileId',function(req, res){
  const params = {  
    TableName: "storageFiles",
    Key: 
    {
      "Id": req.params.fileId      
    }
  }
  console.log(params);
  dynamoDb.delete(params, function(err, data) {
    if (err) {
        console.error("Unable to delete item. Error JSON:", JSON.stringify(err, null, 2));
    } else {
      res.setHeader('Access-Control-Allow-Origin', '*');
        res.json(data);
    }
  });
})
