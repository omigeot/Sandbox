"use strict";

var helper = require('./helper.js'),
	async = require("async"),
	http = require("http"),
	path = require("path"),
	childprocess = require("child_process"),
	fs = require('fs');

var report = { tests: {}, gitLog: "" };

var RUNNING = helper.state.RUNNING,
	READY = helper.state.READY,
	COMPLETE = helper.state.READY,
	CANCELING = helper.state.CANCELING,
	ERROR = helper.state.ERROR,
	UPDATING = helper.state.UPDATING;

var status = READY;
var tests = [];
var testQueue = [];

var files = helper.files;
var findFiles = helper.findFiles;
var runner;

gitLog();
createRunner();

function readFiles(nextStep) {
	logger.log("readFiles")
	//for each file
	async.eachSeries(files, function(filename, nextfile) {
		logger.log(filename);
		//bail out of all tests if canceling
		if (status == CANCELING) {
			logger.log("canceling run")
			global.setTimeout(nextStep, 50)
			return;
		}
		try {
			var newTests = helper.getAllTestData(filename);
			tests = tests.concat(newTests)
			for (var i in newTests) {
				var test = helper.createTest(newTests[i].title, filename);
				var id = test.filename + ":" + test.title;
				report.tests[id] = test;
			}
		} catch (e) {
			report.tests[filename] = helper.createTest(filename, filename);
			report.tests[filename].status = "test load error";
		}
		nextfile();
	}, nextStep);
}

function gitLog() {
	var log = childprocess.spawn("git", ["log", '-1'], {
		cwd: "../../../"
	});
	
	log.stdout.on('data', function(data) {
		//Wait for startup complete
		report.gitLog += data.toString();
	});
}

function gitPull(pullComplete) {
	logger.log("Git Pull");
	var gitpull = childprocess.spawn("git", ["pull"], {
		cwd: "../../../",
		//stdio:'inherit' 
	});
	//log errors
	gitpull.stdout.on('data', function(data) {
		report.gitLog += data.toString();
	});
	gitpull.stderr.on('data', function(data) {
		report.gitLog += data.toString();
	});
	//wait for process to complete
	gitpull.on('close', function(code) {
		if (code !== 0) {
			logger.log('ps process exited with code ' + code);
		}
		pullComplete();
	});
};

function handleIncomingMessage(message, handler){
	console.log("Server status", status);
	var command = message[0];
	var param = message[1];
	
	switch(status){
		case RUNNING: handleRunningState(command, param); break;
		case CANCELING: handleCancelingState(command, param); break;
		case READY: handleReadyState(command, param); break;
		case COMPLETE: handleReadyState(command, param); break;
		case ERROR: handleErrorState(command, param); break;
		case UPDATING: handleUpdatingState(command, param); break;
		case BUSY: handleBusyState(command, param); break;
	}
	
	//Handle client commands that don't depend on state
	if(param.isHTTP){
		if(command === helper.command.RELOAD){
			//Change status, do actual reload when runner is ready
			status = UPDATING;
		}
		else if(command === helper.command.STOP){
			status = BUSY;
			testQueue.length = 0;
		}
		
		param.response.end();
	}
}

function handleBusyState(command, param){
	//If command is from runner and runner is ready, then we can leave busy state
	if(!param.isHTTP && checkState(command, param, READY)){
		status = READY;
		doRunCommand();
	}
}
function handleUpdatingState(command, param){
	if(!param.isHTTP){
		if(checkState(command, param, READY)){
			doReload();
		}
	}
}

function handleCancelingState(command, param){
	if(!param.isHTTP){
		if(checkState(command, param, READY)){
			doReload();
		}
	}
}

function handleErrorState(command, param){
	//This ensures that we ignore all client commands until the runner is back up and running
	if(!param.isHTTP){
		
		//If runner is ready, continue running tests...
		if(checkState(command, param, READY)){
			doRunCommand();
		}
	}
}
function handleReadyState(command, param){
	console.log("We are in the ready state, command is:", command);
	//command is http request
	if(param.isHTTP){
		var request = param.request;
		var response = param.response;
		if(command == helper.command.RUN){
			var allIDs = Object.keys(report.tests);
			setTestQueue(allIDs);
			doRunCommand();
		}
		else if(command === helper.command.RUN_ONE){
			addTestToQueue(param.query);
			doRunCommand();
		}
		else if(command === helper.command.QUIT){
			quitRunner();
		}
	}
	
	//Response from runner.. test is complete
	else{
		//if runner is "updating" state to ready...
		if(checkState(command, param, READY)){ 
			doRunCommand();
		}
	}
}

function handleRunningState(command, param){
	//command from client
	if(param.isHTTP){
		var request = param.request;
		var response = param.response;

		if(command == helper.command.RUN || command == helper.command.RUN_ONE){
			//already running... nothing to see here..	
			console.log("Server is already running!");
		}
	}
	
	//command from runner
	else{
		if(command == helper.command.RESULT){
			console.log("The server received the results of the test!: ", param);
			updateReport(param);
		}
		//The runner is going to exit. Handle final report.
		else if(command == helper.command.ERROR){
			logger.log(param);
			updateReport(param);
			status = ERROR;
		}
		else if(checkState(command, param, READY)){
			console.log("The runner is ready again... run next test... ", param);
			
			//get next item off of queue
			doRunCommand();
		}
	}
}

function doRunCommand(){
	if(testQueue.length > 0){
		//get item at front of "queue"
		var tid = testQueue.shift();
		status = RUNNING;
		
		report.tests[tid].status = "running";
		helper.sendMessage(runner, helper.command.RUN_ONE, tid);
	}
	else status = READY;
}

function doReload(){
	status = helper.state.BUSY;
	
	async.series([
		gitPull,
		quitRunner
	]);
}

function quitRunner(cb){
	//Do not accept any commands from other states until reload is complete
	status = helper.state.BUSY;
	
	helper.sendMessage(runner, helper.command.QUIT);
	if(cb) cb();
}

function setTestQueue(arr){
	testQueue.length = 0;
	testQueue.push.apply(testQueue, arr);
}

function addTestToQueue(tid){
	var testIds = Array.isArray(tid) ? tid : [tid];
	
	for(var i = 0; i < testIds.length; i++){
		var tid = decodeURIComponent(testIds[i]);
		if(testQueue.indexOf(tid) < 0){
			testQueue.push(tid);
			logger.log(tid, "added to queue");
		}
		else{
			logger.log(tid, "is already in queue");
		}
	}
}

function checkState(command, test, state){
	return command === helper.command.STATE && test === state;
}

function updateReport(update){
	report.tests[update.id] = update;
}

function createRunner(){
	runner = childprocess.fork("runner.js");
	runner.on("message", handleIncomingMessage);
	runner.on("error", function(message, handle){
		console.log("Server received error from runner: ", message);
	});
	runner.on("exit", function(message, handle){
		console.log("Runner exited with message: " + message);
		
		//If necessary, we can check message to determine if this actually was an error.
		//As of now, it doesn't really matter since the flow is more or less the same.
		status = ERROR;
		createRunner();
	});
}

var server = http.createServer();
server.on('request', function(request, response) {
	request.url = decodeURI(request.url);
	if (request.url.indexOf("/ui/") == 0) {
		if (request.url === "/ui/") {
			request.url += 'tests.html'
		}
		
		try {
			var data = fs.readFileSync("." + request.url);
			response.write(data)
		} catch (e) {
			response.writeHead(500);
			response.write(e.toString())
		}
		response.end();
		return;
	}
	
	else if(request.url == helper.command.STATE) {
		report.status = status;
		report.log = logger._log;
		response.write(JSON.stringify(report));
		response.end();
		return;
	}

	else{
		var tempArr = request.url.split("?");
		var command = tempArr[0];
		var param = tempArr[1];
		handleIncomingMessage([command, {request: request, response: response, isHTTP: true, query: param}]);
		response.end();
		return;
	}
	
	if (request.url == "/runTests") {

		setTimeout(function() {
			restart();
		}, 5000)
		response.end();
		request.connection.destroy();
		cancel_run(restart);


	}
	if (request.url == "/reload") {

		setTimeout(function() {
			reload();
		}, 5000)
		cancel_run(reload);
	}
	if (request.url.indexOf("/runOne") == 0) {
		cancel_run(function() {
			var tid = request.url.substr(request.url.indexOf('?') + 1)
			tid = decodeURIComponent(tid)
			logger.log(tid);
			response.end();
			
			helper.sendMessage(runner, helper.command.RUN, tid);
		});
	}
});
var port = 8181;

var p = process.argv.indexOf('-p');
port = p >= 0 ? parseInt(process.argv[p + 1]) : 8181;

server.listen(port);
if (process.argv.indexOf('start') > -1)
	updateAndRunTests(function() {})
else
	helper.findFiles(function() {
		readFiles(function() {})
	})
