var midiAccess = null;  // global MIDIAccess object
var midiInputs = [];
var midiInput = null;
var midiOutputs = [];
var midiOutput = null;
var midiInitialisedCallback;

function logMidiEvent(ev){
    logMidiData(ev.data);
}

function logMidiData(data){
  var arr = [];
  for(var i=0; i<data.length; i++) arr.push((data[i]<16 ? '0' : '') + data[i].toString(16));
  // console.log('MIDI:', arr.join(' '));
}

function onMIDIInit(midi, options) {
    log("MIDI sysex options: "+options);
    log("MIDI sysex: "+midi.sysexEnabled);
    midiAccess = midi;

    var i = 0;
    var inputs = midiAccess.inputs.values();
    for(var input = inputs.next(); input && !input.done; input = inputs.next()) {
        midiInputs.push(input.value);
	registerMidiInput(i++, input.value.name+" ("+input.value.manufacturer+") "+input.value.id);
	console.log("added MIDI input "+input.value.name+" ("+input.value.manufacturer+") "+input.value.id);
    }
    if(inputs.size === 0)
    	console.log("No MIDI input devices present.")

    i = 0;
    var outputs = midiAccess.outputs.values();
    for(var output = outputs.next(); output && !output.done; output = outputs.next()) {
        midiOutputs.push(output.value);
	registerMidiOutput(i++, output.value.name+" ("+output.value.manufacturer+") "+output.value.id);
	console.log("added MIDI output "+output.value.name+" ("+output.value.manufacturer+") "+output.value.id);
    }
    if(outputs.size === 0)
	console.log("No MIDI output devices present.")

    if(midiInitialisedCallback)
	midiInitialisedCallback();
}

function onMIDIReject(err) {
    console.log("error "+err);
    var retry = confirm("The MIDI system failed to start.\n"+err+"\nRetry?");
    if(retry)
	initialiseMidi();
}

// var sysexMessage = [];
function MIDIMessageEventHandler(event) {
    // console.log("MIDI 0x"+event.data[0].toString(16)+" "+event.data.length+" bytes");
    logMidiEvent(event);
    switch(event.data[0] & 0xf0) {
    case 0x90:
	if(event.data[2] != 0) {  // if velocity != 0, this is a note-on message
	    noteOn(event.data[1], event.data[2]);
	    return;
	}
    case 0x80:
	noteOff(event.data[1]);
	return;
    case 0xB0:
	controlChange(event.data[1], event.data[2]);
	return;
    case 0xC0:
	programChange(event.data[1]);
	return;
    case 0xF0:
  	systemExclusive(event.data);
	// sysexMessage = sysexMessage.concat(event.data);
	// console.log("sysex evt 0x"+event.data[0].toString(16)+":0x"+event.data[event.data.length-1].toString(16));
	// console.log("sysex msg 0x"+sysexMessage[0].toString(16)+":0x"+sysexMessage[sysexMessage.length-1].toString(16));
	// if(sysexMessage.indexOf(0xf7) != -1){
  	//     systemExclusive(sysexMessage);
	//     sysexMessage = [];
	// }
	return;
    }
}

function selectMidiInput(index) {
    if(midiInput)
	midiInput.onmidimessage = undefined;
    midiInput = midiInputs[index];
    if(midiInput){
	console.log("selecting MIDI input "+index+": "+midiInput.name+" ("+midiInput.manufacturer+")");
	midiInput.onmidimessage = MIDIMessageEventHandler;
    }
}

function selectMidiOutput(index) {
    midiOutput = midiOutputs[index];
    if(midiOutput)
      console.log("selecting MIDI output "+index+": "+midiOutput.name+" ("+midiOutput.manufacturer+")");
}

function sendPc(value) {
    console.log("sending PC "+value);
    if(midiOutput)
      midiOutput.send([0xC0, value], 0);
}

function sendCc(cc, value) {
    console.log("sending CC "+cc+"/"+value);
    if(midiOutput)
      midiOutput.send([0xB0, cc, value], 0);
}

// function sendSysexMessage(msg) {
//     console.log("sending sysex msg "+msg);
//     var msg = [0xf0, MIDI_SYSEX_MANUFACTURER, MIDI_SYSEX_DEVICE ];
//     msg.push.apply(msg, data.split(''));
//     msg.push(0xf7);
//     logMidiData(msg);
//     if(midiOutput)
//       midiOutput.send(msg, 0);
// }

function sendSysexCommand(cmd) {
    console.log("sending sysex command 0x"+cmd.toString(16));
    var msg = [0xf0, MIDI_SYSEX_MANUFACTURER, MIDI_SYSEX_DEVICE, cmd, 0xf7 ];
    logMidiData(msg);
    if(midiOutput)
      midiOutput.send(msg, 0);
}

function sendSysexData(cmd, data) {
    console.log("sending sysex data");
    var msg = [0xf0, MIDI_SYSEX_MANUFACTURER, MIDI_SYSEX_DEVICE, cmd ];
    for(var i=0; i<data.length; ++i)
	msg.push(data.charCodeAt(i));
    // msg.push.apply(msg, data);
    msg.push(0xf7);
    logMidiData(msg);
    if(midiOutput)
      midiOutput.send(msg, 0);
}

function initialiseMidi(callback){
    midiInitialisedCallback = callback;
    window.AudioContext = window.AudioContext||window.webkitAudioContext;
    context = new AudioContext();
    var options = { sysex: true };
    if(navigator.requestMIDIAccess)
	navigator.requestMIDIAccess( { sysex: true } ).then( onMIDIInit, onMIDIReject );
    else
	alert("No MIDI support present in your browser.")
}
