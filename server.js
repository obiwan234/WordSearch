const fetch = require("node-fetch");
const express = require("express");
const app = express();
const groupMeBaseUrl = "https://api.groupme.com/v3/groups/";
const groupMeApiKey = "/messages?token=" + process.env.GROUP_ME_API_KEY;
const websterBaseUrl = "https://www.dictionaryapi.com/api/v3/references/collegiate/json/";
const websterApiKeyUrl = "/?key=" + process.env.WEBSTERS_API_KEY;
const listenPort = process.env.PORT || 3000;

app.listen(listenPort, () => console.log("listening"));
app.use(express.json());
app.post("/define", (request, response) => {
	console.log(request.body);
	let queryString = request.body.text.toLowerCase();
	let groupIDString = request.body.group_id;
	wordSearch(queryString,groupIDString);
	response.end();
});

function sendDefinition(query,result,groupID) {
	let textResponse = query + "\n" + result;
	console.log(textResponse);
	let messageJSON = {"message" : {
			"source_guid" : Date.now()+"",
			"text" : textResponse
		}
	};
	let groupMeURL = groupMeBaseUrl + groupID + groupMeApiKey;
	////////////////////////////
	fetch(groupMeURL, {
		method: "POST", body: JSON.stringify(messageJSON), headers: {"Content-type": "application/json; charset=UTF-8"}})
		.then(response => response.json()) 
		.then(json => console.log(json))
		.catch(err => console.log(err));
}

function wordSearch(query,groupID) {
	fetch(websterBaseUrl + query.replace(" ","%20") + websterApiKeyUrl)
		.then(response => {
			return response.json();
		})
		.then(json => {
			if(typeof json[0] == "string") {
				console.log("Auto Correct: "+json[0]);
				fetch(websterBaseUrl + json[0].replace(" ","%20") + websterApiKeyUrl)
				.then(newresponse => {
					return newresponse.json();
				})
				.then(newjson => {
					sendDefinition(json[0],newjson[0].shortdef.join(", "),groupID);
				})
				.catch(err => console.log(err));
			} else {
				sendDefinition(query,json[0].shortdef.join(", "),groupID);
			}
	})
	.catch(err => console.log(err));
}
