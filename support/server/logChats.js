//save each chat message to a file
//each file is a running log of the conversation between 2 users

var path = require('path');
var fs = require('fs');

//make the chats dir to store the files
exports.init = function()
{
	if(!fs.existsSync(path.join(global.datapath,"chats")))
	{
		fs.mkdirSync(path.join(global.datapath,"chats"));
	}
}
exports.logChats = function(message,sendingClient,receivingClient)
{
	//clone the message so we don't mess up later code that uses it
	message = JSON.parse(JSON.stringify(message));

	//Use pretty user names, not the socket IDs
	message.sender = sendingClient.loginData.UID;
	message.receiver = receivingClient.loginData.UID;
	var sender = message.sender;
	var receiver = message.receiver;
	var text = message.text;

	//append to a file
	var fileID = sender+receiver;
	fs.appendFile(path.join(global.datapath,"chats",fileID),JSON.stringify(message)+'\n');
}