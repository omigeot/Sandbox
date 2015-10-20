/* This is the ambitious idea to run all commands from one file and run them
   with various data to test the SandboxAPI endpoints and find what crashes
   and excepts, so that we can make them work.

   file: Sandbox/support/server/sandboxAPI.js
   That is the file we are testing against.  To test against it we use an array
   of command objects which include name, array of methods, array of keys, and array of values.

   An array of data (empty string, garbage string ...) to try and break the API.
   Cookie to hold the valid session cookie (we could try making up garbage here)
   Could also use variables to hold valid profile names, states, and such.

   Run all kinds of scenarios - come back to this

   As of October 2015, this is how I am working it.  I run this program (node allCommandsWork.js) with all the commands I want to test uncommented (or I comment out all the commands I don't wish to run/test).  I cna then manually hardcode in changes I want to try against the endpoints and run it again.  This is not the best way, but it is the way it is currently working.  Feel free to make it better.  I have completely wrugn myself out trying to work a second loop.  And it has also been enough work teasing out what data each endpoint needs in order to work.  Comments at each command help by saying what an expected good result is and what conditions will cause a crash or server error.

   For more complete documentation on what causes server crashes and errors, see SandboxAPI Crash Report.md.  Other files for use in testing are:
   	  commandOptions.js - the commands and options extracted into a separate file available through module.exports
	  createProfile.js - runs commands without loggin in (unlike allCommandsWork.js) useful for testing createprofile which does not work when logged in, or other commands without loggin in.
	  loginLocal10.js - useful for simply testing against loging in
	  CreateProfile.txt - logged output of the most recent run of commands with createProfile.js
	  EndpointReport.txt - log of all 5xx type responses from the server froom the most recent run of allCommandsWork.js
	  EndpointResults.txt - log of all results of the most recent run of allCommandsWork.js

   Do make sure that uid's and sid's and everything else correspond to the instance of the vw Sandbox you are using.  Use responsibly and have fun!!!
*/

// console.log('Howdy!');//intro - we're working

//loading modules
var request = require('request');
var fs = require('fs');
var of = require('./commandOptions.js');	//Other File

//URI help
var root = of.root; //'http://localhost:3000/';
var sandbox = of.sandbox; //'sandbox/adl/';
var vwf = of.vwf; //'vwfdatamanager.svc/';
var auth = of.auth; //'auth/local/';
//Command help
var sid = '?SID=_adl_sandbox_L8BnGGj85ZHAmsy1_';
// var UID = 'Postman';
// var pword = 'Postman123';
var UID = of.UID; //'joe';
var pword = of.pword; //'Abc123456';	//"793af97e52c796fdf016c2f242663a8e203b1ff93e14b4c3a1bea4798d081ff0"
var SID = of.SID; // '_adl_sandbox_L8BnGGj85ZHAmsy1_';
var salt = "";	//"e099584b-b004-d202-f948-6b6eac9da36 "
var cookie = "";
var AID;

var thumbnail = of.thumbnail;

//array of strings to be used in trying to break the api
var badData = [
	,	//undefined	0
	'',	//empty string	1
	'abc123',	//	2
	'*^%#@',	//please don't swear	3
	'>}<:>)P{?>^%}',	//random other symbols	4
	'\t\n\'',	//escape sequences	5
	'&#2045&#x2045',	//weird characters	6
	'whats\x45\x99\xa3\x0athis',	//weirder characters	7
	'Rob is great',	//propaganda	8
	'Andy is better', 	//better propaganda	9
	'_willthiswork',	//underscore start	10
	'Mick "the Mick" Muzac',	//double quotes	11
	"Steven 'the Steve' Vergenz",	//single quotes	12
]

//setting up the command objects
var commands = [
	//this command is a setup it is never going to produce a favorable response
	of.noneG,
	//this command is a setup it is never going to produce a favorable response
	// of.noneP,
	//this command is a setup it is never going to produce a favorable response
	// of.noneD,
	//3dr commands I haven't figured out yet, and there was some trouble with the 3dr server, please try back later
	// of.drdownload,
		//401
	// of.drmetadata,
		//401 and the page
	// of.drpermission,
		//401 ""
	// of.drsearch,
		//comes back 200; however i give it nothing to search for and it comes back with nothing.  It would be nice to search for different files and find a few
	// drtexture,
		//401
	// drthumbnail,
		//401
	// drupload,
		//404 404 not found
		//and with uid and sid i'm getting 500
		//how did I get the 404??
	//this one works as is
	//login not required, qs not required
	//returns the path to the application
	// of.apppath,
	//requires login and sid
	//returns empty array if world contains no added cameras
	//works as is.  Would like to add a camera to double check
	// 200 [{"name":"Camera1","id":"SandboxCamera-vwf-N32196c51"}]
	//with no SID - big ugly 500 TypeError
	of.cameras,
	//weird - 200 _adl_sandbox_jzfyZYS4Vwt9iXh3_ find out more about this instance
	//yep I seem to be creating instances left and right about 60+ worlds now
	// of.copyinstance,
	// 500 user Postman already exists
	// do I have to be logged out to do this - yes
	//see: createProfile.js, createprofile.txt, and createProfileSeries.js
	//requires UID, and form with Username, Password, and Email
	// createprofile,
	//401 'text/plain' 'Anonymous users cannot create instances\n'
	//200 Created state _adl_sandbox_AWtJY9uwVKvInoV4_
	//must be logged in, no other data is needed
	of.createstate,
	//404 file not found
	//Still not sure of this one
	// of.datafile,
	//works fine as is, find way to suppress or shorten
	// of.docdir,
	//200
	//must be logged in
	//qs and form seems to have no effect
	// of.error,
	//200
	//seems to be working just fine, logging in with the old password keeps the old one valid
	//can use while logged out with a valid UID in qs
	//or while logged in with no UID
	//or logged in and any valid UID - in this case resets password of valid UID
	// of.forgotpassword,
	//200 //Analytics not found, find analytics
	//What is an analyticsObj??
	// of.getanalytics,
	//200 and array of assets
	//with no SID in qs - 500 TypeError - big ugly
	//with or without login - must have state id
	//with invalid state id - returns empty array []
	of.getassets,
	//used to be library, now covers more
	//beware returns the css approx 2800 lines
	//no login or qs needed
	// of.geteditorcss,
	// 200 e445fe78-0e58-4383-aba5-6fbe347cf118
	//UID and SID are not needed
	//title, type, formdata are optional
	//must be logged in
	// of.globalassetP,
		//200 ok
		//with valid active AID in qs
		//does not need UID or SID, do need to be logged in
		//no AID handled - 500 no AID in query string
		//Invalid AID crashes sandbox!!!!!!!!!!!!!!!!!!!
	// of.globalassetD,
	//200 {}
	//must be logged in and have valid AID
	//no AID - 500 no AID in query string
	//want to find a valid AID which produces more than {}
	of.globalassetassetdata,
	//200 {"uploader":"Postman","title":"chair","uploaded":"2015-09-14T19:36:58.020Z","description":"","type":"wooden"}
	//must be logged in and have valid AID
	//500 no AID in query string
	of.globalassetmetadata,
	//200 [Array of asset objects]
	//got plenty now
	// of.globalassets,
	//200 [Array of inventory objects]
	// of.inventory,
	//200 9ab2d1de-20c3-4c2e-8548-f4e9dfd6960f
	// looks good to me
	//qs and form optional
	//must be logged in
	// of.inventoryitemP,
	//200 ok
	//I keep getting 200 ok for the same inventory item AID, not good
	//does delete if in inventory,
	//but always returns 200 ok whether anything was deleted or not
	//500 no AID in query string
	// of.inventoryitemD,
	//200 {}
	//with AID and logged in
	// of.inventoryitemassetdata,
	//200 {"uploaded":"2015-08-25T16:50:04.480Z","description":""}
	//must be logged in and valid AID
	// of.inventoryitemmetadataG,
	//200 ok
	//must be logged in and valid AID
	//without valid AID still 200 ok , but nothing is added
	// of.inventoryitemmetadataP,

/*	This command has been replaced with geteditorcss in the dev branch
	library is still active on the master branch
*/
/*	of.library = {
		//404 404 not found, find the library
		name : 'library',
		method : 'GET',
		qs : {
			// 'UID' : 'model',
			// 'UID' : UID,
			// 'SID' : SID,
			// path : '/my-entities$/',
		},
		url : root + sandbox + vwf + 'library',
	},*/
/*	of.login = {
		//200 no longer supported...
		//that's as good as it gets
		name : 'login',
		method : 'GET',
		qs : {
			'UID' : UID,
			'SID' : SID,
		},
		url : root + sandbox + vwf + 'login',
	},*/

	//200 {object...}
	//keep this active as a test againt good session
	of.logindata,
	//200 Client was not Logged into undefined
	//looks like it takes a state id 'S' and a client id 'CID'
	//with a good sid for s it sends:
	//200 Client was not Logged into _adl_sandbox_L8BnGGj85ZHAmsy1_
	//not logged in - 500 TypeError big ugly
	of.logout,
	//200 {Object...}
	// of.profileG,
	//200 {Object...}
	//need to have something to POST
	//also think about arranging to create, post, get, delete and show deleted from profiles in that order
	//logged out - 500 ReferenceError
	// of.profileP,
	//200 {Object...}
	//doesn't delete anything
	// of.profileD,
	//200 [Array of profile names]
	// of.profiles,
	//401 Anonymous users cannot copy instances
	// 500 Settings format incorrect
	//with good SID and any non null form 200 _adl_sandbox_nTnwFDCAq5zOKh0M_
	of.publish,
	//500 You must be the owner of a world you publish
	//find out more about this
	//500 State ID is incorrect
	//qs statename and backup
	//crashes if statename and backup are undefined or left null
	//correction: if statename is left undefined (commented out or does not exist), null or emptystring works fine (doesn't crash):
	//500 Unable to restore backup
/*	of.restorebackup,*/
	//200 salt string
	of.salt,
	//200 /sas
	// of.saspath,
	//401 Already Logged in - yay!!! Victory!!!
	//must be logged out, yet getting hung up on check password
	of.sitelogin,
	//200
	//would it be different is we could login to site
	//looks like there would be no difference in what we see
	//now after this command the sandbox console shows null for session instead of it's ususal info, so it looks like we do indeed logout
	of.sitelogout,
	//200 {"GetStateResult"...}
	// of.stateG,
	//200 deleted instance
	//cannot reuse the same SID all the time - go fig
	//must be full id - "_adl_sandbox_xkTMz9miCKQmBDwU_"
	//less returns - 500 instance does not exist
	//ie - 	'_xkTMz9miCKQmBDwU_'
	//		'xkTMz9miCKQmBDwU'
	// of.stateD,
	//works fine with uid and sid in qs
	//it is our chief crasher when qs is empty
	//with uid and sid works great
	//SID of undefined crashes!!!!!
	//it is our chief crasher when qs is empty
	of.statedataG,
	//200 Created state _adl_sandbox_AN91bJqZY29N7Cbz_
	//nothing changes nor is created with valid sid
	//with new sid - 401 State not found. State _adl_sandbox_AndrewWCreighton_
	// of.statedataP,
	//200 {"children":[...], "parents":[...]}
	//200 {"error":"inner state not found"} for invalid sid
	//caution can get large quick
	// of.statehistory,
	//200 {"_adl_sandbox_..."...}
	//this one has gotten huge
	// of.states,
	//200 [{"file":"statebackup..."}, ...]
	//500 Error in trying to retrieve backup list - when no backup history
	of.stateslist,
	//200 + file
	//..\Sandbox\data\Textures
	// of.texture,
	//200 {"GetTextureResult"...}
	//..\Sandbox\data\Textures
	// of.textures,
	//200 + file
	//..\Sandbox\data\Thumbnails
	// of.texturethumbnail,
	//200 ?png - prints out the whole png
	//works fine need to find way to suppress printing whole file
	//printing to console produces a lot of beeps - a lot
	//and tie up the console until they are done
	//no sid - big ugly 500 TypeError
	//still works when logged out however file is returned with different encoding - when logged out encoding does not cause console to beep
	// of.thumbnailG,
	//500 TypeError: Cannot call method &#39;replace&#39; of undefined<br> &nbsp; &nbsp;at SaveThumbnail
	//this is currently a big ugly
	//SID is necessary
	//auto is an option in the qs - not needed
	//so the SID's
	// of.thumbnailP,
	//200
	//that's good that's all I need
	//if I wanted to get really fancy, i'd go ahead and login and change the password to something new
	// of.updatepassword,
	//404 404 Not Found
	//is this uploading formData
	//and where/when does this happen??
	//it happens in Sandbox/tempupload - the file has no extension
	//i do not understand why the 404 response but i'm moving on
	//looks like the if statement should have a return line 1830
	//i think we end up in the default 404 in the switch statement line 1910
	// of.uploadtemp,
];

//set up data variables (profiles, states, inventory, textures)
//don't know that these are helpful at all
setupUrl = root + sandbox + vwf;
var profiles, states, inventory, textures;
request({uri : setupUrl + "profiles/"}, function(err, resp, body) {
	if (err) return console.error(err);
	profiles = body;
	console.log(profiles);
});
// request({uri : setupUrl + "states/"}, function(err, resp, body) {
// 	if (err) return console.error(err);
// 	states = body;
// 	console.log(states);
// });
// request({uri : setupUrl + "inventory/"}, function(err, resp, body) {
// 	if (err) return console.error(err);
// 	inventory = body;
// 	console.log(inventory);
// });
request({uri : setupUrl + "textures/"}, function(err, resp, body) {
	if (err) return console.error(err);
	textures = body;
	console.log(textures);
});


//EncryptPassword function for login
var EncryptPassword = function (password, username, salt) {
	console.log('In EncryptPassword');
	var CryptoJS = require('crypto-js');
	var unencrpytedpassword = password + username + salt;
	for (var i = 0; i < 1000; i++)
	{
		unencrpytedpassword = CryptoJS.SHA256(unencrpytedpassword) + '';
	}
	// console.log('In Encrypt: ', password, username, salt, unencrpytedpassword);
	return unencrpytedpassword;
}

//get salt - returns the salt
var reqSalt = function () {
	console.log('In reqSalt');
	request({url:root + sandbox + vwf + 'salt?UID=' + UID}, reqLogin);
}

//Our new fancy make the call and get the cookie then use the cookie to
//unlock all sorts of mysteries
var reqLogin = function (error, response, salt) {
	console.log('In reqLogin');
	if (!error && (response.statusCode === 200)) {
		var pw = EncryptPassword(pword, UID, salt.trim());
		// console.log("Here's what went into the pw: " + pword + UID + salt);
		// console.log('Is this the right password: ' + pw);
		//Create form-data
		var formData = {
			username : UID,
			password : pw
		};
		// var cookie = "";
		request = request.defaults({jar: true});
		var options = {
			uri : root + auth,
			form : formData,
			method : 'POST',
		}
		// console.log('The salt is: ' + salt);
		// console.log('with response code: ' + response.statusCode);
		request(options, reqLoginData);
	} else {
		console.log('The salt has lost its taste.' + error);
	}
}

	//Make the login request in order to get the session cookie
var reqLoginData = function (err, response, data) {
	console.log('In reqLoginData');
	console.log(response.statusCode);
	if (response.statusCode === 301 || response.statusCode === 302 || response.statusCode === 200) {
		console.log('good');
		console.log(response.headers['content-type']);
		cookie = response.headers['set-cookie'][1].split(';')[0].trim();
		// var cookie = response.headers['set-cookie'][1].split(';')[0].trim();
		console.log("cookie : " + cookie + "\n");
		var jar = request.jar();
		jar.setCookie(cookie, root, function(){
			// console.log("These are cool cookies:", jar.getCookies(root) + '\n');
			request({url : root + sandbox + vwf + 'logindata', jar : jar}, runEmAll)
				.on('response', function(response) {
					console.log(response.statusCode);
					console.log(response.headers['content-type']);
				})
				.on('data', function(chunk) {
					console.log(chunk.toString() + "\n");
				})
				.on('error', function(err) {
					console.log('Bad news, Dude: ' + err + '\n');
				});
		});
	} else {
		console.log('error logging in: not okay nor redirect' + err);
	}
}


var runEmAll = function (error, response, data) {

	var jar2 = request.jar();
	jar2.setCookie(cookie, root, function(){
		// console.log("These are cool cookies:", jar2.getCookies(root) + '\n');
	});

	//setting up the loop
	var results = "Results from Testing SandboxAPI Endpoints on " + new Date().toISOString().replace('T', ' ').substr(0, 19) + '\nSession Cookie: ';// + jar2.getCookies(root) + '\n\n';

	var report = "Report of Testing SandboxAPI Endpoints on " + new Date().toISOString().replace('T', ' ').substr(0, 19) + '.\nRequests which produce Server Errors or Crashes.\n\n';

	var filename = 'EndpointResults.txt';
	var fileReport = 'EndpointReport.txt';
	var len = commands.length;

	function doRequest(i) {
		if (i === len) {
			results += '\n\n' + /*jar2.getCookies(root)*/ + 'Curiouser and curiouser et cetera\n';
			fs.writeFile(filename, results, console.log('For all results see file', filename));
			fs.writeFile(fileReport, report, console.log('For report of errors see file', fileReport));
			// console.log('finishing doRequest');
			return;
		}

		// var options = setOptions(i);

		request(commands[i], function (err, response, body) {

			var strOpt = JSON.stringify(commands[i]);
			results += "\n" + strOpt + '\n';
			console.log(strOpt);

			if (err) {
				console.log('Error:', err);
				results += err + '\n';
				report += "\n" + commands[i].name + '\n' + strOpt + '\n' + err + '\n';
			} else {
				console.log(commands[i].name, body);
				results += response.statusCode + " " + body + '\n';
				if (response.statusCode >= 500) {
					report += "\n" + commands[i].name + '\n' + strOpt + '\n' + response.statusCode + " " + body + '\n';
				}	//if

			}	//else

			doRequest(i+1);
		})	//request
	}	//doRequest function
console.log('Lake');
//produce a loop around this to vary the input data
console.log('Winni');
			doRequest(0);
console.log('pesaukee');
}	//runEmAll

reqSalt();
