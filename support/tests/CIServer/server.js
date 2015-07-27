"use strict";

var helper = require('./helper.js');

var async = require("async")
var http = require("http");
var path = require("path");
var childprocess = require("child_process");
var fs = require('fs');
var stdoutLog = "";
var stderrLog = "";
var report = { tests: {} };

var RUNNING = helper.state.RUNNING,
	READY = helper.state.READY,
	COMPLETE = helper.state.READY,
	CANCELING = helper.state.CANCELING,
	ERROR = helper.state.ERROR;

var status = READY;
var tests = [];
var testQueue = [];

var files = helper.files;
var findFiles = helper.findFiles;
var runner;

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

function updateAndRunTests(cb2) {
	//bail if already running. This really should never happen
	if (status == RUNNING) {
		cb2();
		return;
	}

	async.series([
		function getLog(cb) {
			var log = childprocess.spawn("git", ["log", '-1'], {
				cwd: "../../../"
			});
			log.stdout.on('data', function(data) {
				//Wait for startup complete
				report.gitLog += data.toString();
			})
			log.on('close', cb)
		},
		//do a get pull and update the dev branch
		startSandbox,
		//run the selenium tests
		function findAndRunTests(cb) {
			
		},
		killSandbox
	],
	function() {
		status = COMPLETE;
		logger.log('Run all tests exit')
		if (cb2) cb2();
	});
}

function cancel_run(cancelComplete) {
	if (status == CANCELING) {
		logger.log('already canceling')
		return;
	}
	if (status == RUNNING)
		status = CANCELING;
	
	async.until(function() {
		return status == COMPLETE || status == READY;
	}, function(cb) {
		logger.log('waiting for cancel');
		global.setTimeout(cb, 1000);
	}, function() {
		cancelComplete();
	})
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

function quit(done){
	logger.log("staring run")
	server._connections = 0;
	server.close(done);
}

function loadChildProcess(done){
	var params = this.params ? this.params : ['server.js'];
	
	logger.log('restart');
	global.setTimeout(function() {
		logger.log('spawn');
		var child = require('child_process').spawn('node', params, {
			detached: true,
			stdio: 'ignore'
		});
		child.unref();
		logger.log('close');
		done();
		
		global.setTimeout(function() {
			logger.log('killing server');
			process.kill(process.pid);
			process.exit();
		}, 1000);
	}, 500);
}

function reload() {
	//quit, then do a git pull, then (re)load the child process, binding it to a parameters object
	var paramObj = {params: ['server.js']};
	async.series([quit, gitPull, loadChildProcess.bind(paramObj)]);
}

function restart() {
	//quit, then do a git pull, then (re)start the child process, binding it to a parameters object
	var paramObj = {params: ['server.js', 'start']};
	async.series([quit, gitPull, loadChildProcess.bind(paramObj)]);
}

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
	}
	
	//Handle commands that don't depend on state and also close connection
	if(param.isHTTP){

	}
}

function handleErrorState(command, param){
	//Ignore all commands from client if we are in an error state
	if(!param.isHTTP){
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
		
		response.end();
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
	//command is http request
	if(param.isHTTP){
		var request = param.request;
		var response = param.response;

		if(command == helper.command.RUN || command == helper.command.RUN_ONE){
			//already running... nothing to see here..	
			console.log("Server is already running!");
		}
	}
	
	//command came from runner
	else{
		if(command == helper.command.RESULT){
			console.log("The server received the results of the test!: ", param);
			updateReport(param);
		}
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

function handleCancelingState(command, param){
	if(command === helper.command.READY){
		
		
	}
	//else if(command === helper.command.){
		
	//}
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

function doQuit(){
	setTimeout(function() {
		logger.log('killing server');
		process.kill(process.pid);
		process.exit();
	}, 5000)

	cancel_run(function() {
		process.exit();
	});

	logger.log('killing server');
	process.kill(process.pid);
	process.exit();
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
		console.log("Runner exited");
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
	if (request.url == "/quit") {
		doQuit();
	}
	if (request.url == "/stop") {
		cancel_run(function(){});
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
