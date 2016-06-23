
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
	s1.sendsTo(function(data){HoxtonOwl.midiClient.sendCc(OpenWareMidiControl.PATCH_PARAMETER_A, data.value*127);});
	s2.sendsTo(function(data){HoxtonOwl.midiClient.sendCc(OpenWareMidiControl.PATCH_PARAMETER_B, data.value*127);});
	s3.sendsTo(function(data){HoxtonOwl.midiClient.sendCc(OpenWareMidiControl.PATCH_PARAMETER_C, data.value*127);});
	s4.sendsTo(function(data){HoxtonOwl.midiClient.sendCc(OpenWareMidiControl.PATCH_PARAMETER_D, data.value*127);});
	s5.sendsTo(function(data){HoxtonOwl.midiClient.sendCc(OpenWareMidiControl.PATCH_PARAMETER_E, data.value*127);});
	s6.sendsTo(function(data){HoxtonOwl.midiClient.sendCc(OpenWareMidiControl.PATCH_PARAMETER_F, data.value*127);});
	s7.sendsTo(function(data){HoxtonOwl.midiClient.sendCc(0x12, data.value*127);});
	s8.sendsTo(function(data){HoxtonOwl.midiClient.sendCc(OpenWareMidiControl.PATCH_PARAMETER_H, data.value*127);});
	// pb.hslider = true;
	// pb.draw();
	pb.sendsTo(function(data){HoxtonOwl.midiClient.sendPb(data.value*16383);console.log(data)});
	push.sendsTo(function(data){
	    if(data.press != undefined)
		HoxtonOwl.midiClient.sendCc(OpenWareMidiControl.PATCH_BUTTON, data.press*127);
	    console.log(data);
	});
	rc.sendsTo(function(data){
	    HoxtonOwl.midiClient.sendCc(OpenWareMidiControl.PATCH_CONTROL, data.value*127);
	    console.log(data);
	});
	sliders1.setNumberOfSliders(8);
	sliders1.sendsTo(function(data){
	    var key = parseInt(Object.keys(data)[0]);
	    HoxtonOwl.midiClient.sendCc(OpenWareMidiControl.PATCH_PARAMETER_AA+key, data[key]*127);
	});
	sliders2.setNumberOfSliders(8);
	sliders2.sendsTo(function(data){
	    var key = parseInt(Object.keys(data)[0]);
	    HoxtonOwl.midiClient.sendCc(OpenWareMidiControl.PATCH_PARAMETER_BA+key, data[key]*127);
	});
	keyboard.mode = "sustain";
	keyboard.sendsTo(function(data){
	    // there's a bug in keyboard that sends out velocity up to 128
	    HoxtonOwl.midiClient.sendNoteOn(data.note, Math.min(data.on, 127));
	});
	metroball.sendsTo(function(data){
	    console.log(data);
	    HoxtonOwl.midiClient.sendNoteOn(data.x*127, data.side*60);
	});
    };
});
