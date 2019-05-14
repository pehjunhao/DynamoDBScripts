const fs = require("fs");
const AWS = require("aws-sdk");
const NORTH_VIRGINIA = "us-east-1";
const IRELAND = "eu-west-1";
const OREGON = "us-west-2";

// Modify region
AWS.config.update({
	region:OREGON,
	accessKeyId:  "<enter here>", 
	secretAccessKey: "<enter here>"
});

const docClient = new AWS.DynamoDB.DocumentClient();

const TABLE_NAME = "<enter here>";
const DATE_REF = "<enter here>";
const TABLE_KEY = "<enter here>";
const TTL_NAMESPACE = "<enter here>";

let responseData = [];
let numOfScannedData = 0;
let params = {
	TableName: TABLE_NAME,
  	Limit: 1000,
}

let startTime = Date.now();

docClient.scan(params, function scanUntilDone(err, data) {
  	if (err) {console.log(err, err.stack);} // an error occurred
  	else {
  		let items = data.Items;

  		for (let i=0; i<items.length; i++) {
  			// Do whatever you want here
  			let item = items[i];
  			item[DATE_REF] = item[DATE_REF] || "2019-05-23T22:17:31.114Z";
  			if (!item[TTL_NAMESPACE] && item[DATE_REF]) {
  				let ttl = Math.floor(new Date(item[DATE_REF].split("T")[0])/1000 + 60*60*24*183);
  				item[TTL_NAMESPACE] = ttl;
  				updateEntry(item);
  			}
  		}

  		numOfScannedData += items.length;
  		console.log("scanned: " + data.ScannedCount + ", item count:" + numOfScannedData);
  		console.log("time elasped: " + ((Date.now() - startTime)/60000) + "mins");

	    if (data.LastEvaluatedKey) {
	      	params.ExclusiveStartKey = data.LastEvaluatedKey;
      		docClient.scan(params, scanUntilDone);
	  	}
  	}
});


function updateEntry(item) {
	let params = {
		"Key": {},
		"UpdateExpression": "set "+TTL_NAMESPACE+" = :val1",
		"ExpressionAttributeValues": {
			":val1": item[TTL_NAMESPACE]
		},
		"TableName": TABLE_NAME
	};
	params.Key[TABLE_KEY] = item[TABLE_KEY]
	docClient.update(params, function(err, res) {
		if (err) console.log(err);

		console.log("updated: " + item[TABLE_KEY]);
	});

}
