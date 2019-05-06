const fs = require("fs");
const AWS = require("aws-sdk");
AWS.config.update({region:'us-east-1'});
const docClient = new AWS.DynamoDB.DocumentClient();



let responseData = [];
let params = {
	TableName: "LEXS_SHIPMENTS",
	// FilterExpression: 'CARRIER_ID = :carrierId AND SHIP_DATE > :shipDate',
	// ExpressionAttributeValues: {
	// 	':carrierId': "USPS",
	// 	":shipDate": "2019-04-01T00:00:08.849Z"
	// },
    Select: 'SPECIFIC_ATTRIBUTES',
    AttributesToGet: [
    	'CARRIER_ID',
    	'CARRIER_TRACKING_ID',
    	'REFUND_STATE'
  	],
	ScanFilter: {
		'REFUND_STATE': {
			ComparisonOperator: 'EQ',
			AttributeValueList: [
				"REFUND_PENDING"
			]
		},
		'CARRIER_ID': {
			ComparisonOperator: 'EQ',
			AttributeValueList: [
				"USPS"
			]
		},
		'SHIP_DATE': {
			ComparisonOperator: 'GT',
			AttributeValueList: [
				"2019-04-26"
			]
		}
	},
  	Limit: 1000,
}


  		let refundList = [];
docClient.scan(params, function scanUntilDone(err, data) {
  	if (err) {console.log(err, err.stack);} // an error occurred
  	else {
  		let items = data.Items;

  		console.log("scanned: " +data.ScannedCount +", item count:"+ items.length);
  		refundList = refundList.concat(items);

  		if (items.length > 0) {
  			console.log(refundList);
  		}

  		// console.log("refund length is " + refundList.length);

	    if (data.LastEvaluatedKey) {
	      	params.ExclusiveStartKey = data.LastEvaluatedKey;
      		docClient.scan(params, scanUntilDone);
	  	}
  	// 	if (Object.keys(responseMap).length == tableKeys.length) {
			// resolve(responseMap);
  		// }
  	}
});