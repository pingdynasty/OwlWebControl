/**
 * @namespace
 */
var HoxtonOwl;
if (!HoxtonOwl) {
    HoxtonOwl = {};
}

HoxtonOwl.midiClient = {

    midiAccess: null,  // global MIDIAccess object
    midiInputs: [],
    midiInput: null,
    midiOutputs: [],
    midiOutput: null,
    midiInitialisedCallback: 'undefined',

    logMidiEvent: function(ev){
        HoxtonOwl.midiClient.logMidiData(ev.data);
    },

    logMidiData: function(data){
      var arr = [];
      for(var i=0; i<data.length; i++) arr.push((data[i]<16 ? '0' : '') + data[i].toString(16));
      console.log('MIDI:', arr.join(' '));
    },

    onMIDIInit: function(midi, options) {
        log("MIDI sysex options: "+options);
        log("MIDI sysex: "+midi.sysexEnabled);
        log("MIDI onstatechange: "+midi.onstatechange);
        midiAccess = midi;

        var i = 0;
        var inputs = midiAccess.inputs.values();
        for(var input = inputs.next(); input && !input.done; input = inputs.next()) {
            HoxtonOwl.midiClient.midiInputs.push(input.value);
        	console.log("added MIDI input "+input.value.name+" ("+input.value.manufacturer+") "+input.value.id);
        }
        if(inputs.size === 0)
        	console.log("No MIDI input devices present.")

        i = 0;
        var outputs = midiAccess.outputs.values();
        for(var output = outputs.next(); output && !output.done; output = outputs.next()) {
            HoxtonOwl.midiClient.midiOutputs.push(output.value);
        	console.log("added MIDI output "+output.value.name+" ("+output.value.manufacturer+") "+output.value.id);
        }
        if(outputs.size === 0)
    	console.log("No MIDI output devices present.")

        if(midiInitialisedCallback)
    	midiInitialisedCallback();
    },

    onMIDIReject: function(err) {
        console.log("error "+err);
        var retry = confirm("The MIDI system failed to start.\n"+err+"\nRetry?");
        if(retry)
    	initialiseMidi();
    },

    // var sysexMessage = [];
    MIDIMessageEventHandler: function(event) {
        // console.log("MIDI 0x"+event.data[0].toString(16)+" "+event.data.length+" bytes");
        HoxtonOwl.midiClient.logMidiEvent(event);
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
    },

    selectMidiInput: function(index) {
        var midiInput = HoxtonOwl.midiClient.midiInput;

        if(midiInput)
        {
            midiInput.onmidimessage = undefined;
        }
        midiInput = HoxtonOwl.midiClient.midiInputs[index];
        if(midiInput){
        	console.log("selecting MIDI input "+index+": "+ midiInput.name+" ("+ midiInput.manufacturer+")");
        	midiInput.onmidimessage = this.MIDIMessageEventHandler;
        }
    },

    selectMidiOutput: function(index) {
        var midiOutput = HoxtonOwl.midiClient.midiOutput = HoxtonOwl.midiClient.midiOutputs[index];
        if(midiOutput)
        {
          console.log("selecting MIDI output "+index+": "+midiOutput.name+" ("+midiOutput.manufacturer+")");        
        }
    },

    sendPc: function(value) {
        console.log("sending PC "+value);
        if(midiOutput)
          midiOutput.send([0xC0, value], 0);
    },

    sendCc: function(cc, value) {
        console.log("sending CC "+cc+"/"+value);
        if(this.midiOutput)
        {
          this.midiOutput.send([0xB0, cc, value], 0);            
        }
    },

    sendNoteOn: function(note, velocity) {
        console.log("sending note on "+note+"/"+velocity);
        if(this.midiOutput)
        {
          this.midiOutput.send([0x90, note, velocity], 0);            
        }
    },

    sendNoteOff: function(note, velocity) {
        console.log("sending note off "+note+"/"+velocity);
        if(this.midiOutput)
        {
          this.midiOutput.send([0x80, note, velocity], 0);            
        }
    },

    // function sendSysexMessage(msg) {
    //     console.log("sending sysex msg "+msg);
    //     var msg = [0xf0, MIDI_SYSEX_MANUFACTURER, MIDI_SYSEX_DEVICE ];
    //     msg.push.apply(msg, data.split(''));
    //     msg.push(0xf7);
    //     logMidiData(msg);
    //     if(midiOutput)
    //       midiOutput.send(msg, 0);
    // }

    sendSysexCommand: function(cmd) {
        console.log("sending sysex command 0x"+cmd.toString(16));
        var msg = [0xf0, MIDI_SYSEX_MANUFACTURER, MIDI_SYSEX_DEVICE, cmd, 0xf7 ];
        logMidiData(msg);
        if(midiOutput)
          midiOutput.send(msg, 0);
    },

    sendSysexData: function(cmd, data) {
        console.log("sending sysex data");
        var msg = [0xf0, MIDI_SYSEX_MANUFACTURER, MIDI_SYSEX_DEVICE, cmd ];
        for(var i=0; i<data.length; ++i)
    	msg.push(data.charCodeAt(i));
        // msg.push.apply(msg, data);
        msg.push(0xf7);
        logMidiData(msg);
        if(midiOutput)
          midiOutput.send(msg, 0);
    },

    initialiseMidi: function(callback){
        midiInitialisedCallback = callback;
        window.AudioContext = window.AudioContext||window.webkitAudioContext;
        context = new AudioContext();
        var options = { sysex: true };
        if(navigator.requestMIDIAccess)
    	navigator.requestMIDIAccess( { sysex: true } ).then( this.onMIDIInit, this.onMIDIReject );
        else
    	alert("No MIDI support present in your browser.")
    }

}
