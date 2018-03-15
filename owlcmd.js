function sleep(milliseconds) {
  var start = new Date().getTime();
  for (var i = 0; i < 1e7; i++) {
    if ((new Date().getTime() - start) > milliseconds){
      break;
    }
  }
}

function noteOn(note, velocity) {
  console.log("received noteOn "+note+"/"+velocity);
}

function noteOff(note) {
  console.log("received noteOff "+note);
}

function getStringFromSysex(data, startOffset, endOffset){
  var str = "";
  for(i=startOffset; i<(data.length-endOffset) && data[i] != 0x00; ++i)
    str += String.fromCharCode(data[i]);
  return str;
}

function registerPatch(idx, name){
    $('#patchnames').append($("<option>").attr('value',idx).text(name));
}

function log(msg){
    $('#log').append('<li><span class="badge">' + msg + '</span></li>');
}

function systemExclusive(data) {
    if(data.length > 3 && data[0] == 0xf0
       && data[1] == MIDI_SYSEX_MANUFACTURER
       && data[2] == MIDI_SYSEX_DEVICE){
	// console.log("sysex: 0x"+data[3].toString(16)+" length: "+data.length);
	switch(data[3]){
	case OpenWareMidiSysexCommand.SYSEX_PRESET_NAME_COMMAND:
            var name = getStringFromSysex(data, 5, 1);
	    var idx = data[4];
	    registerPatch(idx, name);
	    // log("preset "+idx+": "+name);
	    break;
	case OpenWareMidiSysexCommand.SYSEX_PARAMETER_NAME_COMMAND:
            var name = getStringFromSysex(data, 5, 1);
	    var pid = data[4]+1;
	    console.log("parameter "+pid+" :"+name);
	    if(pid >= 1 && pid <= 8)
		$("#p"+pid).text(name); // update the prototype slider names
	    break;
	case OpenWareMidiSysexCommand.SYSEX_DEVICE_ID:
            var msg = getStringFromSysex(data, 4, 1);
	    console.log("device id "+msg);
	    $("#deviceid").text(msg);	    
	    break;
	case OpenWareMidiSysexCommand.SYSEX_PROGRAM_STATS:
            var msg = getStringFromSysex(data, 4, 1);
	    console.log("program stats "+msg);
	    $("#patchstatus").text(msg);	    
	    break;
	case OpenWareMidiSysexCommand.SYSEX_FIRMWARE_VERSION:
            var msg = getStringFromSysex(data, 4, 1);
	    console.log("firmware "+msg);
	    $("#ourstatus").text("Connected to "+msg);	    
	    break;
	case OpenWareMidiSysexCommand.SYSEX_PROGRAM_MESSAGE:
            var msg = getStringFromSysex(data, 4, 1);
	    console.log("program message "+msg);
	    $("#patchmessage").text("["+msg+"]");
	    break;
	case OpenWareMidiSysexCommand.SYSEX_DEVICE_STATS:
	default:
            var msg = getStringFromSysex(data, 4, 1);
	    log("Unhandled message: "+msg);
	    break;
	}
    }
}

function programChange(pc){
    console.log("received PC "+pc);
    resetParameterNames();
    var name = $("#patchnames option:eq("+pc+")").text();
    console.log("patch name "+name);
    $("#patchname").text(name);			    
}


function sendRequest(type){
    HoxtonOwl.midiClient.sendCc(OpenWareMidiControl.REQUEST_SETTINGS, type);
}

function sendStatusRequest(){
    sendRequest(OpenWareMidiSysexCommand.SYSEX_PROGRAM_MESSAGE);
    sendRequest(OpenWareMidiSysexCommand.SYSEX_DEVICE_STATS);
    sendRequest(OpenWareMidiSysexCommand.SYSEX_PROGRAM_STATS);
    sendRequest(OpenWareMidiControl.PATCH_PARAMETER_A); // request parameter values
}

// var doStatusRequestLoop = true;
// function statusRequestLoop() {
//     sendStatusRequest();
//     if(doStatusRequestLoop)
// 	setTimeout(statusRequestLoop, 2000);
// }

function setParameter(pid, value){
    console.log("parameter "+pid+": "+value);
    HoxtonOwl.midiClient.sendCc(OpenWareMidiControl.PATCH_PARAMETER_A+pid, value);
}

function resetParameterNames(){
    for(i=1; i<=8; ++i)
        $("#p"+i).text(String.fromCharCode(64+i)); // reset the prototype slider names
}

function selectOwlPatch(pid){
    console.log("select patch "+pid);
    sendPc(pid);
}

function sendLoadRequest(){
    sendRequest(OpenWareMidiSysexCommand.SYSEX_PRESET_NAME_COMMAND);
    sendRequest(OpenWareMidiSysexCommand.SYSEX_PARAMETER_NAME_COMMAND);
}

function onMidiInitialised(){
    // auto set the input and output to an OWL   
    var outConnected = false,
        inConnected = false;
    for (var o = 0; o < HoxtonOwl.midiClient.midiOutputs.length; o++) {
        if (HoxtonOwl.midiClient.midiOutputs[o].name.match('^OWL-MIDI')) {
            HoxtonOwl.midiClient.selectMidiOutput(o);
            outConnected = true;
            break;
        }        
    }
    for (var i = 0; i < HoxtonOwl.midiClient.midiInputs.length; i++) {
        if (HoxtonOwl.midiClient.midiInputs[i].name.match('^OWL-MIDI')) {
            HoxtonOwl.midiClient.selectMidiInput(i);
            inConnected = true;
            break;
        }        
    }
    if (inConnected && outConnected) {
        console.log('connected to an OWL');
        $('#ourstatus').text('Connected')
        $('#load-owl-button').show();
	sendRequest(OpenWareMidiSysexCommand.SYSEX_FIRMWARE_VERSION);
	sendLoadRequest(); // load patches
	// sendRequest(OpenWareMidiSysexCommand.SYSEX_DEVICE_ID);
	// sendRequest(127);
	// statusRequestLoop();
	setMonitor(true);
    } else {
        console.log('failed to connect to an OWL');
        $('#ourstatus').text('Failed to connect')
        $('#load-owl-button').hide();
    }
}

function updatePermission(name, status) {
    console.log('update permission for ' + name + ' with ' + status);
    log('update permission for ' + name + ' with ' + status);
}

function connectToOwl() {
    if(navigator && navigator.requestMIDIAccess){
        navigator.requestMIDIAccess({sysex:true});
	HoxtonOwl.midiClient.initialiseMidi(onMidiInitialised);
    }
}

var monitorTask = undefined;
function setMonitor(poll){
    if(poll && monitorTask == undefined){
    	monitorTask = window.setInterval(sendStatusRequest, 1000);
    }else if(!poll && monitorTask != undefined){
    	clearInterval(monitorTask);
    	monitorTask = undefined;
    }
}

// function hookupButtonEvents() {

    // $("#connect").on('click', connectToOwl);

    // $("#monitor").on('click', function() {
    // 	if(monitorTask == undefined){
    // 	    monitorTask = window.setInterval(sendStatusRequest, 1000);
    // 	}else{
    // 	    clearInterval(monitorTask);
    // 	    monitorTask = undefined;
    // 	}
    // });

    // initialiseMidi(onMidiInitialised);
    
    // $('#clear').on('click', function() {
    // 	$('#log').empty();
    // 	return false;
    // });
// }

function sendProgram(evt){
    var files = evt.target.files; // FileList object
    // // files is a FileList of File objects. List some properties.
    // var output = [];
    // for (var i = 0, f; f = files[i]; i++) {
    // 	output.push('<li><strong>', escape(f.name), '</strong> (', f.type || 'n/a', ') - ',
    //                 f.size, ' bytes, last modified: ',
    //                 f.lastModifiedDate ? f.lastModifiedDate.toLocaleDateString() : 'n/a',
    //                 '</li>');
    // }
    // document.getElementById('filenames').innerHTML = '<ul>' + output.join('') + '</ul>';
    var reader = new FileReader();
    for (var i = 0, f; f = files[i]; i++) {
	// Only process syx files.
	// if (!f.name.match('*\\.syx')) {
        //     continue;
	// }
	var reader = new FileReader();

	// Closure to capture the file information.
	reader.onload = (function(theFile) {
            return function(e) {
		console.log("read file "+theFile.name);
		sendProgramFromUrl(e.target.result);
		// sendProgramData(e.target.result).then(function(){
		//     sendProgramRun();
		// }, function(err){
		//     console.error(err);
		// });
            };
	})(f);
	reader.readAsDataURL(f);
	// reader.readAsBinaryString(f);
    }
}


function sendProgramRun(){
    console.log("sending sysex run command");
    var msg = [0xf0, MIDI_SYSEX_MANUFACTURER, MIDI_SYSEX_DEVICE, 
           OpenWareMidiSysexCommand.SYSEX_FIRMWARE_RUN, 0xf7 ];
    HoxtonOwl.midiClient.logMidiData(msg);
    if(HoxtonOwl.midiClient.midiOutput)
        HoxtonOwl.midiClient.midiOutput.send(msg, 0);
}

function chunkData(data){
    var chunks = [];
    var start = 0;
    for(var i = 0; i < data.length; ++i){
        if(data[i] == 0xf0){
            start = i;
        } else if(data[i] == 0xf7){
            chunks.push(data.subarray(start, i + 1));
        }
    }
    return chunks;
}

var sendDataTimeout;
function sendDataChunks(index, chunks, resolve){
    index = index || 0;
    if(sendDataTimeout){
        window.clearTimeout(sendDataTimeout);
        sendDataTimeout = null;
    }
    if(index < chunks.length){
        HoxtonOwl.midiClient.logMidiData(chunks[index]);
        if(HoxtonOwl.midiClient.midiOutput){
            //console.log("sending chunk "+ index + ' with '+ chunks[index].length +" bytes sysex");
            HoxtonOwl.midiClient.midiOutput.send(chunks[index], 0);            
        }
        sendDataTimeout = window.setTimeout(function(){
            sendDataChunks(++index, chunks, resolve);
        },0);
    } else {
        resolve && resolve();
    }
}

function sendProgramData(data){
    return new Promise( (resolve, reject) => {
        console.log("sending program data "+data.length+" bytes"); 
        var chunks = chunkData(data);
        sendDataChunks(0, chunks, resolve);
    });
}

function sendProgramFromUrl(url){
    return new Promise((resolve, reject) => {
        console.log("sending patch from url "+url.substring(0, 64));
        var oReq = new XMLHttpRequest();
        oReq.responseType = "arraybuffer";
        oReq.onload = function (oEvent) {   
            var arrayBuffer = oReq.response; // Note: not oReq.responseText
            if(arrayBuffer) {  
                var data = new Uint8Array(arrayBuffer);
                resolve(
                    sendProgramData(data).then(function(){
                        sendProgramRun();
                    }, function(err){
                        console.error(err);
                    })
                );
            }
        }
        oReq.open("GET", url, true);
        oReq.send();
    });
}

function loadPatchFromServer(patchId){
    return sendProgramFromUrl(API_END_POINT + '/builds/' + patchId + '?format=sysx&amp;download=1');
}

// function sendProgramFromUrl(url){
//     console.log("sending patch from url "+url);
//     var oReq = new XMLHttpRequest();
//     oReq.responseType = "arraybuffer";
//     oReq.onload = function (oEvent) {
//     console.log("here");    
//     var arrayBuffer = oReq.response; // Note: not oReq.responseText
//     if(arrayBuffer) {
//         console.log("there");   
//         var data = new Uint8Array(arrayBuffer);
//         sendProgramData(data);
//         sendProgramRun();
//     }
//     }
//     oReq.open("GET", url, true);
//     oReq.send();
// }

