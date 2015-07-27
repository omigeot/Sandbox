var async  = require('async'),
	helper = require('./helper.js'),
	state  = helper.state.READY,
	currentRun = {},
	currentTestID,
	browsersList = ['chrome','firefox'/*,'ie11'*/];
	
//Initialize the web driver
helper.initWebdriver({
	desiredCapabilities: {
		browserName: browsersList[0]
	}
});

//Listen for messages from the server
process.on("message", function(message, handle){
	var command = message[0];
	var param = message[1];
	
	console.log("Runner received a message:", message);
	
	//If the server is asking for the current state...
	if(command === helper.command.STATE){
		helper.sendMessage(process, helper.command.STATE, state);
	}
	
	//Otherwise, switch through state machine logic 
	else{
		switch(state){
			case helper.state.RUNNING: handleRunningState(command, param); break;
			case helper.state.CANCELING: break;
			case helper.state.READY: handleReadyState(command, param); break;
		}
		
		//"Remind" the server that we are ready if the state hasn't changed from ready
		if(state === helper.state.READY){
			updateState(helper.state.READY);
		}
	}
});

//Runner is in ready state; handle incoming commands
function handleReadyState(command, param){	
	if(command === helper.command.RUN_ONE){
		doRunCommand(param);
	}
}

//Runner is currently executing a test; handle incoming commands
function handleRunningState(command, param){
	if(command === helper.command.CANCEL){
		updateState(helper.status.CANCELING);
	}
}

function doRunCommand(param){
	if(!param) return;
	
	var testObj = helper.getSingleTestData(param);
	currentTestID = param;
	
	currentRun = {
		id: currentTestID,
		status: 'complete',
		result: null,
		message: null,
		filename: testObj.filename,	
		title: testObj.title,
		runs: [],
	};
	
	//let server know about updated state, if necessary. 
	//This must only happen once so we don't overwrite the cancel state
	updateState(helper.state.RUNNING);
	
	//For each browser, run a single test, then send a message to server when all tests are complete.
	async.eachSeries(browsersList, runSingleTest, function sendResults(){
		helper.sendMessage(process, helper.command.RESULT, currentRun);
		updateState(helper.state.READY);
	});
}

function runSingleTest(browserName, done){
	if(state === helper.state.RUNNING){
		global.browser.desiredCapabilities.browserName = browserName;

		//Start the browser and run the test
		async.series([
			startBrowser,
			_executeActualTestAsync
		], done);
	}
	else done();
}

//Should not be called directly. Use runSingleTest instead.
//Could move into runSingleTest function block, but this is cleaner.
//This function returns a function suitable for passing into async.series.
function _executeActualTestAsync(cb){
	var browserName = global.browser.desiredCapabilities.browserName;
	var testObj = helper.getSingleTestData(currentTestID);
	
	testObj.test(global.browser, global.testUtils.completeTest(function(success, message) {
		logger.log("Finished running test using " + browserName);
		
		currentRun.runs.push({
			status: "complete",
			result: success ? "passed" : "failed",
			message: message,
			browsername: browserName
		});

		global.browser.end();
		runLater(cb);
	}));
}

function startBrowser(cb){
	browser.init().then(function() {
		cb()
	});
}

function updateState(newState){
	//Whenever there's a change in state, notify server
	helper.sendMessage(process, helper.command.STATE, newState);
	state = newState;
}

function runLater(fn, timeout){
	timeout = timeout ? timeout : 500;
	global.setTimeout(fn, timeout);
}

//Send server initial ready state
updateState(helper.state.READY);
console.log("I am running!");