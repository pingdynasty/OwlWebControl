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

function sendCommand(cmd){
    sendSysexCommand(cmd);
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
            var parameter_map = [' ', 'a', 'b', 'c', 'd', 'e'];
            var name = getStringFromSysex(data, 5, 1);
	    var pid = data[4]+1;
	    console.log("parameter "+pid+" :"+name);
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

function controlChange(cc, value){
    console.log("received CC "+cc+": "+value);
    switch(cc){
    case OpenWareMidiControl.PATCH_PARAMETER_A:
	$("#p1").val(value);
	break;
    case OpenWareMidiControl.PATCH_PARAMETER_B:
	$("#p2").val(value);
	break;
    case OpenWareMidiControl.PATCH_PARAMETER_C:
	$("#p3").val(value);
	break;
    case OpenWareMidiControl.PATCH_PARAMETER_Da:
	$("#p4").val(value);
	break;
    }
}

function programChange(pc){
    console.log("received PC "+pc);
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
}

var doStatusRequestLoop = true;
function statusRequestLoop() {
    sendStatusRequest();
    if(doStatusRequestLoop)
	setTimeout(statusRequestLoop, 2000);
}

function setParameter(pid, value){
    console.log("parameter "+pid+": "+value);
    HoxtonOwl.midiClient.sendCc(OpenWareMidiControl.PATCH_PARAMETER_A+pid, value);
}

function selectOwlPatch(pid){
    var parameter_map = [' ', 'a', 'b', 'c', 'd', 'e'];

    console.log("select patch "+pid);

    for(i=0; i<5; ++i) {
        $("#p"+i).text(""); // clear the prototype slider names
    }
    
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
        $('#ourstatus').text('Connected to an OWL')
        $('#load-owl-button').show();
    } else {
        console.log('failed to connect to an OWL');
        $('#ourstatus').text('Failed to connect to an OWL')
        $('#load-owl-button').hide();
    }

    // sendLoadRequest(); // load patches
    sendRequest(OpenWareMidiSysexCommand.SYSEX_FIRMWARE_VERSION);
    // sendRequest(OpenWareMidiSysexCommand.SYSEX_DEVICE_ID);
    // sendRequest(127);
    statusRequestLoop();
}

function updatePermission(name, status) {
    console.log('update permission for ' + name + ' with ' + status);
    log('update permission for ' + name + ' with ' + status);
}

function connectToOwl() {
    if(navigator && navigator.requestMIDIAccess)
    {
        navigator.requestMIDIAccess({sysex:true});
    }
    HoxtonOwl.midiClient.initialiseMidi(onMidiInitialised);
}

// function hookupButtonEvents() {
    // Check for Midi/Midi SysEx permissions

    // if(navigator && navigator.permissions){
    // 	navigator.permissions.query({name:'midi', sysex:false}).then(function(p) {
    //         updatePermission('midi', p.status);
    //         p.onchange = function() {
    // 		updatePermission('midi', this.status);
    //         };
    // 	});

    // 	navigator.permissions.query({name:'midi', sysex:true}).then(function(p) {
    //         updatePermission('midi-sysex', p.status);
    //         p.onchange = function() {
    // 		updatePermission('midi-sysex', this.status);
    // 		initialiseMidi(onMidiInitialised);
    //         };
    // 	});
    // }

    // $("#midi").on('click', function() {
    // 	if(navigator && navigator.requestMIDIAccess)
    //         navigator.requestMIDIAccess({sysex:false});
    // });

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

function sendProgramData(data){
    var from = 0;
    console.log("sending program data "+data.length+" bytes");  
    for(var i=0; i<data.length; ++i){
    if(data[i] == 0xf0){
        from = i;
    }else if(data[i] == 0xf7){
        console.log("sending "+(i-from)+" bytes sysex");
        msg = data.subarray(from, i+1);
        HoxtonOwl.midiClient.logMidiData(msg);
        if(HoxtonOwl.midiClient.midiOutput)
        {
            HoxtonOwl.midiClient.midiOutput.send(msg, 0);            
        }
        sleep(1);
    }
    }
}

function sendProgramRun(){
    console.log("sending sysex run command");
    var msg = [0xf0, MIDI_SYSEX_MANUFACTURER, MIDI_SYSEX_DEVICE, 
           OpenWareMidiSysexCommand.SYSEX_FIRMWARE_RUN, 0xf7 ];
    HoxtonOwl.midiClient.logMidiData(msg);
    if(HoxtonOwl.midiClient.midiOutput)
    {
        HoxtonOwl.midiClient.midiOutput.send(msg, 0);
    }
      
}

function sendProgramFromUrl(url){
    console.log("sending patch from url "+url);
    var oReq = new XMLHttpRequest();
    oReq.responseType = "arraybuffer";
    oReq.onload = function (oEvent) {
    console.log("here");    
    var arrayBuffer = oReq.response; // Note: not oReq.responseText
    if(arrayBuffer) {
        console.log("there");   
        var data = new Uint8Array(arrayBuffer);
        sendProgramData(data);
        sendProgramRun();
    }
    }
    oReq.open("GET", url, true);
    oReq.send();
}

