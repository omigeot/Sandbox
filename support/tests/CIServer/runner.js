var async  = require('async'),
	helper = require('./helper.js'),
	state  = helper.state.READY,
	currentRun = {},
	currentTestID,
	browsersList = ['chrome','firefox'/*,'ie11'*/];
	
helper.initWebdriver({
	desiredCapabilities: {
		browserName: browsersList[0]
	}
});

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
			case helper.state.RUNNING: break;
			case helper.state.STOPPED: break;
			case helper.state.READY: handleReadyState(command, param); break;
			default: helper.sendMessage(process, helper.command.STATE, helper.state.READY);
		}
	}
});

//Runner is in ready state; handle incoming commands
function handleReadyState(command, param){
	var outMsg = "";
	
	if(command === helper.command.RUN){
		doRunCommand(param);
	}
	else if(command == helper.command.TERMINATE){
		outMsg = "We are shutting down";
	}
	else outMsg = "Error";
	
	return outMsg;
}

//Runner is currently executing a test; handle incoming commands
function handleRunningState(command, param){
	var outMsg = "";
	if(command === helper){}
	
	return outMsg;
}

function doRunCommand(param){
	console.log(param);
	if(!param) return;
	
	console.log("Running test via external test runner...");
	console.log("Param: ", param);
	
	currentTestID = param;
	currentRun = {};
	
	//For each browser, run a single test. Send a message to server when all tests are complete.
	async.eachSeries(browsersList, runSingleTest, function sendResults(){
		helper.sendMessage(process, helper.command.RESULT, currentRun);
		updateState(helper.state.READY);
	});
}

function runSingleTest(browserName, done){
	//let server know about updated state, if necessary
	updateState(helper.state.RUNNING);
	global.browser.desiredCapabilities.browserName = browserName;

	//Start the browser and run the test
	async.series([
		startBrowser,
		_executeActualTestAsync(browserName)
	], done);
}

//This function assumes currentRun is an empty object and that
//currentTestID is already set
function _executeActualTestAsync(browserName){
	//returns a function suitable to be passed into async.series.
	return function(cb){
		var testObj = helper.getSingleTestData(currentTestID);
		
		testObj.test(global.browser, global.testUtils.completeTest(function(success, message) {
			logger.log("Finished running test using " + browserName);
			
			currentRun[browserName] = {
				id: currentTestID,
				status: "complete",
				result: success ? "passed" : "failed",
				message: message
			};

			global.browser.end();
			runLater(cb);
		})
	)};
}

function startBrowser(cb){
	browser.init().then(function() {
		cb()
	});
}

function updateState(newState){
	//Whenever there's a change in state, notify server
	if(newState != state){
		helper.sendMessage(process, helper.command.STATE, newState);
		state = newState;
	}
}

function runLater(fn, timeout){
	timeout = timeout ? timeout : 500;
	global.setTimeout(fn, timeout);
}

console.log("I am running!");