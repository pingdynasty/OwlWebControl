
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
            var name = getStringFromSysex(data, 5, 1);
	    var pid = data[4]+1;
	    console.log("parameter "+pid+" :"+name);
	    $("#p"+pid).text(name);
	    break;
	case OpenWareMidiSysexCommand.SYSEX_PROGRAM_STATS:
            var msg = getStringFromSysex(data, 4, 1);
	    $("#patchstatus").text(msg);	    
	    break;
	case OpenWareMidiSysexCommand.SYSEX_FIRMWARE_VERSION:
            var msg = getStringFromSysex(data, 4, 1);
	    $("#firmwareversion").text(msg);	    
	    break;
	case OpenWareMidiSysexCommand.SYSEX_DEVICE_STATS:
	case OpenWareMidiSysexCommand.SYSEX_PROGRAM_MESSAGE:
	    // deliberate fall-through
	default:
            var msg = getStringFromSysex(data, 4, 1);
	    log(msg);
	    break;
	}
    }
}

function registerMidiInput(index, name){
  var select = document.getElementById("midiInputs");
  select.options[index] = new Option(name, index);
}

function registerMidiOutput(index, name){
  var select = document.getElementById("midiOutputs");
  select.options[index] = new Option(name, index);
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
    sendCc(OpenWareMidiControl.REQUEST_SETTINGS, type);
}

function sendStatusRequest(){
    sendRequest(OpenWareMidiSysexCommand.SYSEX_PROGRAM_STATS);
}

function setParameter(pid, value){
    console.log("parameter "+pid+": "+value);
    sendCc(OpenWareMidiControl.PATCH_PARAMETER_A+pid, value);
}

function selectPatch(pid){
    console.log("select patch "+pid);
    for(i=0; i<5; ++i)
	$("#p"+i).text("");
    sendPc(pid);
}

function sendLoadRequest(){
    sendRequest(OpenWareMidiSysexCommand.SYSEX_PRESET_NAME_COMMAND);
    sendRequest(OpenWareMidiSysexCommand.SYSEX_PARAMETER_NAME_COMMAND);
}

var statusTask = undefined;
function connect(){
    if(statusTask == undefined){
	statusTask = window.setInterval(sendStatusRequest, 1000);
    }else{
	clearInterval(statusTask);
	statusTask = undefined;
    }
}

function onMidiInitialised(){
    $("#midiInputs").val(0).change();
    $("#midiOutputs").val(0).change();
    // selectMidiInput(3);
    // selectMidiOutput(4);
    // selectMidiInput(0);
    // selectMidiOutput(0);
    log("showtime");
    sendRequest(OpenWareMidiSysexCommand.SYSEX_FIRMWARE_VERSION);
    sendLoadRequest();
    sendStatusRequest();
}

function updatePermission(name, status) {
    console.log('update permission for ' + name + ' with ' + status);
    log('update permission for ' + name + ' with ' + status);
}

window.addEventListener('load', function() {
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

    $("#midi").on('click', function() {
    	if(navigator && navigator.requestMIDIAccess)
            navigator.requestMIDIAccess({sysex:false});
    });

    $("#midi2").on('click', function() {
    	if(navigator && navigator.requestMIDIAccess)
            navigator.requestMIDIAccess({sysex:true});
    	initialiseMidi(onMidiInitialised);
    });

    initialiseMidi(onMidiInitialised);
    
    $('#clear').on('click', function() {
	$('#log').empty();
	return false;
    });

} );
