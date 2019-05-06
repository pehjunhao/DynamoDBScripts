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
		  		"LEXS_TRANSACTION_ID": dataList[i],
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
				        'CARRIER_TRACKING_ID',
				        'CARRIER_ID',
				        'CANCELLED_CARRIER_ID',
				        'REFUND_STATE',
				        'REFUND_STATE_UPDATED_DATE'
				        /* more items */
			      	],
		        }
		    }
	    }

	    dynamodb.batchGet(params, function (err, data) {
		  	if (err) {
		  		console.log(err, err.stack);
		  	} else {
		  		let response = data.Responses.LEXS_SHIPMENTS;
		  		for (let i=0; i<response.length; i++) {
		  			let data = response[i];
					if (data.CARRIER_ID === "USPS" && 
						data.CANCELLED_CARRIER_ID == null && 
						data.REFUND_STATE == 'REFUND_PENDING') {

						fs.appendFile('output.csv',data.CARRIER_TRACKING_ID+","+ data.REFUND_STATE_UPDATED_DATE+ '\n', function(){});
						counter++;
					}
		  		}
				console.log(counter);
		  	}
		});
		
		j+= 100;

    } while(j<keys.length);
    // } while(false);
	
});



