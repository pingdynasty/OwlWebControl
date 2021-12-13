
function pitchBend(channel, value) {
    console.log("received PB "+channel+":"+value);
}    

function controlChange(status, cc, value){
    var ch = parseInt(status)&0x0f;
    cc = parseInt(cc);
    console.log("received CC "+ch+":"+cc+":"+value);
    switch(cc){
    case OpenWareMidiControl.PATCH_PARAMETER_A:
	$("#p1").val(value);
	s1.set({value: value/100}, false);
	break;
    case OpenWareMidiControl.PATCH_PARAMETER_B:
	$("#p2").val(value);
	s2.set({value: value/100}, false);
	break;
    case OpenWareMidiControl.PATCH_PARAMETER_C:
	$("#p3").val(value);
	s3.set({value: value/100}, false);
	break;
    case OpenWareMidiControl.PATCH_PARAMETER_D:
	$("#p4").val(value);
	s4.set({value: value/100}, false);
	break;
    case OpenWareMidiControl.PATCH_PARAMETER_E:
	$("#p5").val(value);
	s5.set({value: value/100}, false);
	break;
    case OpenWareMidiControl.PATCH_PARAMETER_F:
	$("#p6").val(value);
	s5.set({value: value/100}, false);
	break;
    case OpenWareMidiControl.PATCH_PARAMETER_G:
	$("#p7").val(value);
	s5.set({value: value/100}, false);
	break;
    case OpenWareMidiControl.PATCH_PARAMETER_H:
	$("#p8").val(value);
	s5.set({value: value/100}, false);
	break;
    }
}

function sendPatch(files, pid){
    sendProgram(files).then(function(){
	log("sent patch "+pid);
	if(pid <= 0)
	    sendProgramRun();
	else
	    sendProgramStore(pid);
	sendRequest(OpenWareMidiSysexCommand.SYSEX_PROGRAM_MESSAGE);
    }, function(err){ console.error(err); });
}

function selectPatch(idx){
    console.log("select patch "+idx);
    HoxtonOwl.midiClient.sendPc(idx);    
}

function sendMessage(msg){
    log("sending message: "+msg+".");
    var data = [0xf0, MIDI_SYSEX_MANUFACTURER, MIDI_SYSEX_OMNI_DEVICE, OpenWareMidiSysexCommand.SYSEX_PROGRAM_MESSAGE];
    for(i=0; i<msg.length; ++i)
	data.push(msg.charCodeAt(i) & 0x7f)
    data.push(0xf7);
    if(HoxtonOwl.midiClient.midiOutput)
        HoxtonOwl.midiClient.midiOutput.send(data, 0);
}

$(document).ready(function() {

    $('#clear').on('click', function() {
	$('#log').empty();
	$('#patchmessage').empty();
	$('#patchstatus').empty();
	return false;
    });

    if(typeof nx !== 'undefined') {
	nx.onload = function(){
	s1.sendsTo(function(data){HoxtonOwl.midiClient.sendCc(OpenWareMidiControl.PATCH_PARAMETER_A, data.value*127);});
	s2.sendsTo(function(data){HoxtonOwl.midiClient.sendCc(OpenWareMidiControl.PATCH_PARAMETER_B, data.value*127);});
	s3.sendsTo(function(data){HoxtonOwl.midiClient.sendCc(OpenWareMidiControl.PATCH_PARAMETER_C, data.value*127);});
	s4.sendsTo(function(data){HoxtonOwl.midiClient.sendCc(OpenWareMidiControl.PATCH_PARAMETER_D, data.value*127);});
	s5.sendsTo(function(data){HoxtonOwl.midiClient.sendCc(OpenWareMidiControl.PATCH_PARAMETER_E, data.value*127);});
	s6.sendsTo(function(data){HoxtonOwl.midiClient.sendCc(OpenWareMidiControl.PATCH_PARAMETER_F, data.value*127);});
	s7.sendsTo(function(data){HoxtonOwl.midiClient.sendCc(OpenWareMidiControl.PATCH_PARAMETER_G, data.value*127);});
	s8.sendsTo(function(data){HoxtonOwl.midiClient.sendCc(OpenWareMidiControl.PATCH_PARAMETER_H, data.value*127);});
	
	pb.draw();
	pb.sendsTo(function(data){HoxtonOwl.midiClient.sendPb(data.value*16383);});
	mod.sendsTo(function(data){HoxtonOwl.midiClient.sendCc(1, data.value*127);});
	vol.sendsTo(function(data){HoxtonOwl.midiClient.sendCc(7, data.value*127);});

	// env.sendsTo(function(data){
	//     console.log(data);
	//     if(data.points.length > 1)
	//     HoxtonOwl.midiClient.sendCc(OpenWareMidiControl.PATCH_PARAMETER_AA, data.points[1].x*127); // attack
	//     if(data.points.length > 2)
	//     HoxtonOwl.midiClient.sendCc(OpenWareMidiControl.PATCH_PARAMETER_AB, data.points[2].x*127); // decay
	//     if(data.points.length > 3)
	//     HoxtonOwl.midiClient.sendCc(OpenWareMidiControl.PATCH_PARAMETER_AC, data.points[3].y*127); // sustain
	//     if(data.points.length > 4)
	//     HoxtonOwl.midiClient.sendCc(OpenWareMidiControl.PATCH_PARAMETER_AD, data.points[4].x*127); // release
	// });
	push.sendsTo(function(data){
	    if(data.press != undefined)
		HoxtonOwl.midiClient.sendCc(OpenWareMidiControl.PATCH_BUTTON, data.press*127);
	    console.log(data);
	});
	b1.sendsTo(function(data){
	    if(data.press != undefined)
		HoxtonOwl.midiClient.sendCc(data.press ? OpenWareMidiControl.PATCH_BUTTON_ON :
					    OpenWareMidiControl.PATCH_BUTTON_OFF, 4);
	    console.log(data);
	});
	b2.sendsTo(function(data){
	    if(data.press != undefined)
		HoxtonOwl.midiClient.sendCc(data.press ? OpenWareMidiControl.PATCH_BUTTON_ON :
					    OpenWareMidiControl.PATCH_BUTTON_OFF, 5);
	    console.log(data);
	});
	b3.sendsTo(function(data){
	    if(data.press != undefined)
		HoxtonOwl.midiClient.sendCc(data.press ? OpenWareMidiControl.PATCH_BUTTON_ON :
					    OpenWareMidiControl.PATCH_BUTTON_OFF, 6);
	    console.log(data);
	});
	b4.sendsTo(function(data){
	    if(data.press != undefined)
		HoxtonOwl.midiClient.sendCc(data.press ? OpenWareMidiControl.PATCH_BUTTON_ON :
					    OpenWareMidiControl.PATCH_BUTTON_OFF, 7);
	    console.log(data);
	});
	// rc.sendsTo(function(data){
	//     HoxtonOwl.midiClient.sendCc(OpenWareMidiControl.PATCH_CONTROL, data.value*127);
	//     console.log(data);
	// });
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
	sliders3.setNumberOfSliders(8);
	sliders3.sendsTo(function(data){
	    var key = parseInt(Object.keys(data)[0]);
	    HoxtonOwl.midiClient.sendCc(OpenWareMidiControl.PATCH_PARAMETER_CA+key, data[key]*127);
	});
	sliders4.setNumberOfSliders(8);
	sliders4.sendsTo(function(data){
	    var key = parseInt(Object.keys(data)[0]);
	    HoxtonOwl.midiClient.sendCc(OpenWareMidiControl.PATCH_PARAMETER_DA+key, data[key]*127);
	});
	keyboard.octaves = 10;
	keyboard.midibase = 0;
	keyboard.init();
	keyboard.resize(800, 75);
	keyboard.mode = "sustain";
	keyboard.sendsTo(function(data){
	    // there's a bug in keyboard that sends out velocity up to 128
	    HoxtonOwl.midiClient.sendNoteOn(data.note, Math.min(data.on, 127));
	});
	// metroball.sendsTo(function(data){
	//     console.log(data);
	//     HoxtonOwl.midiClient.sendNoteOn(data.x*127, data.side*60);
	// });
    };
    }
    connectToOwl();

});
