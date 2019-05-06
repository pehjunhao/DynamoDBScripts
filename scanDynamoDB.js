const fs = require("fs");
const AWS = require("aws-sdk");

// Modify region
AWS.config.update({region:'us-west-2'});

const docClient = new AWS.DynamoDB.DocumentClient();

let responseData = [];
let params = {
	TableName: "<TABLE_NAME",
  	Limit: 1000,
}

docClient.scan(params, function scanUntilDone(err, data) {
  	if (err) {console.log(err, err.stack);} // an error occurred
  	else {
  		let items = data.Items;

  		console.log("scanned: " + data.ScannedCount + ", item count:" + items.length);

  		for (let i=0; i<items.length; i++) {
  			// Do whatever you want here
  		}

	    if (data.LastEvaluatedKey) {
	      	params.ExclusiveStartKey = data.LastEvaluatedKey;
      		docClient.scan(params, scanUntilDone);
	  	}
  	}
});