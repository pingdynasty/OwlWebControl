
$(document).ready(function() {
    // if(navigator && navigator.permissions){
    // 	navigator.permissions.query({name:'midi', sysex:false}).then(function(p) {
    // 	    updatePermission('midi', p.status);
    // 	    p.onchange = function() {
    // 		updatePermission('midi', this.status);
    // 	    };
    // 	});

    // 	navigator.permissions.query({name:'midi', sysex:true}).then(function(p) {
    // 	    updatePermission('midi-sysex', p.status);
    // 	    p.onchange = function() {
    // 		updatePermission('midi-sysex', this.status);
    // 		HoxtonOwl.midiClient.initialiseMidi(onMidiInitialised);
    // 	    };
    // 	});
    // }

    $("#patchupload").on('change', function(evt) {
	sendProgram(evt);
    });

    $("#connect").on('click', function() {
    	console.log("connect");
    	if(navigator && navigator.requestMIDIAccess)
            navigator.requestMIDIAccess({sysex:true});
	connectToOwl();
    	// if(navigator && navigator.requestMIDIAccess)
        //     navigator.requestMIDIAccess({sysex:true});
    	// HoxtonOwl.midiClient.initialiseMidi(HoxtonOwl.midiClient.onMidiInitialised);
    });

    $("#monitor").on('click', function() {
	doStatusRequestLoop = !doStatusRequestLoop;
	if(doStatusRequestLoop)
	    statusRequestLoop();
	console.log("monitor "+doStatusRequestLoop);
    });

    $('#clear').on('click', function() {
	$('#log').empty();
	return false;
    });

    nx.onload = function(){
	s1.sendsTo(function(data){HoxtonOwl.midiClient.sendCc(OpenWareMidiControl.PATCH_PARAMETER_A, data.value);});
	s2.sendsTo(function(data){HoxtonOwl.midiClient.sendCc(OpenWareMidiControl.PATCH_PARAMETER_B, data.value);});
	s3.sendsTo(function(data){HoxtonOwl.midiClient.sendCc(OpenWareMidiControl.PATCH_PARAMETER_C, data.value);});
	s4.sendsTo(function(data){HoxtonOwl.midiClient.sendCc(OpenWareMidiControl.PATCH_PARAMETER_D, data.value);});
	s5.sendsTo(function(data){HoxtonOwl.midiClient.sendCc(OpenWareMidiControl.PATCH_PARAMETER_E, data.value);});
	rc.sendsTo(function(data){
	    HoxtonOwl.midiClient.sendCc(OpenWareMidiControl.PATCH_CONTROL, data.val);	    
	    console.log(data);
	});
	sliders.setNumberOfSliders(8);
	sliders.sendsTo(function(data){
	    var key = parseInt(Object.keys(data)[0]);
	    HoxtonOwl.midiClient.sendCc(OpenWareMidiControl.PATCH_PARAMETER_AA+key, data[key]*127);
	});
	keyboard.mode = "sustain";
	keyboard.sendsTo(function(data){
	    // there's a bug in keyboard that sends out velocity up to 128
	    HoxtonOwl.midiClient.sendNoteOn(data.note, Math.min(data.on, 127));
	});
    };
});
