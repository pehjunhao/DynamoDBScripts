const fs = require("fs");
const AWS = require("aws-sdk");
AWS.config.update({region:'us-east-1'});
let dynamodb = new AWS.DynamoDB.DocumentClient();


fs.readFile('lxsTransactionId.csv', 'utf8', (err, data) => {
	if (err) throw err;
	let dataList = data.split("\n");

	let keys = [];
	let uniqueMap = {};
	for(let i in dataList) {
		if (!uniqueMap[dataList[i]] && dataList[i]) {
			keys.push({
		  		"<TABLE_NAME>": dataList[i],
		  	});
		  	uniqueMap[dataList[i]] = true;
		}
	}
	let j=0;
    let counter = 0;


    do {
    	let upperIndex = j+100 < keys.length ? j+100 : keys.length;
		let params = {
		    "RequestItems": {
		        "LEXS_SHIPMENTS": {
		            Keys: keys.slice(j, upperIndex),
		            AttributesToGet: [
		            	// Add attributes to reduce transmitted data
			      	],
		        }
		    }
	    }

	    dynamodb.batchGet(params, function (err, data) {
		  	if (err) {
		  		console.log(err, err.stack);
		  	} else {
		  		let response = data.Responses.<TABLE_NAME>;
		  		for (let i=0; i<response.length; i++) {
		  			// Do whatever you want here
		  		}
				console.log(counter);
		  	}
		});
		
		j+= 100;

    } while(j<keys.length);
	
});



