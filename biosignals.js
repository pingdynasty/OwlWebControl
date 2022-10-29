
function pitchBend(channel, value) {
    // $("#pb").val(value);
    // console.log("received PB "+channel+":"+value);
    switch(channel){
    case 1:
	pb1.set({value: value/16384}, false);
	break;
    case 2:
	pb2.set({value: value/16384}, false);
	break;
    case 3:
	pb3.set({value: value/16384}, false);
	break;
    case 4:
	pb4.set({value: value/16384}, false);
	break;
    case 5:
	pb5.set({value: value/16384}, false);
	break;
    case 6:
	pb6.set({value: value/16384}, false);
	break;
    case 7:
	pb7.set({value: value/16384}, false);
	break;
    }
}

function controlChange(status, cc, value){
    var ch = parseInt(status)&0x0f;
    // console.log("received CC "+ch+":"+cc+":"+value);
    cc = parseInt(cc);
    switch(cc){
    case OpenWareMidiControl.PATCH_PARAMETER_A:
	s1.set({value: value/128}, false);
	break;
    case OpenWareMidiControl.PATCH_PARAMETER_B:
	s2.set({value: value/128}, false);
	break;
    case OpenWareMidiControl.PATCH_PARAMETER_C:
	s3.set({value: value/128}, false);
	break;
    case OpenWareMidiControl.PATCH_PARAMETER_D:
	s4.set({value: value/128}, false);
	break;
    // case OpenWareMidiControl.PATCH_PARAMETER_E:
    // 	$("#p5").val(value);
    // 	s5.set({value: value/128}, false);
    // 	break;
    // case OpenWareMidiControl.PATCH_PARAMETER_F:
    // 	$("#p6").val(value);
    // 	s5.set({value: value/128}, false);
    // 	break;
    // case OpenWareMidiControl.PATCH_PARAMETER_G:
    // 	$("#p7").val(value);
    // 	s5.set({value: value/128}, false);
    // 	break;
    // case OpenWareMidiControl.PATCH_PARAMETER_H:
    // 	$("#p8").val(value);
    // 	s5.set({value: value/128}, false);
	// 	break;
    case 1:
	switch(ch){
	case 1:	    
            cc1.set({value: value/128}, false);
	    break;
	case 2:	    
            cc2.set({value: value/128}, false);
	    break;
	case 3:	    
            cc3.set({value: value/128}, false);
	    break;
	case 4:	    
            cc4.set({value: value/128}, false);
	    break;
	case 5:	    
            cc5.set({value: value/128}, false);
	    break;
	case 6:	    
            cc6.set({value: value/128}, false);
	    break;
	case 7:	    
            cc7.set({value: value/128}, false);
	    break;
	}
	break;
    // default:
    // 	log("received CC "+ch+":"+cc+":"+value);
    }
}

function selectPatch(idx){
    console.log("select patch "+idx);
    HoxtonOwl.midiClient.sendPc(idx);    
    // patchname.innerHTML = "";
}

$(document).ready(function() {
    $("#patchupload").on('change', function(evt) {
    	sendProgram(evt);
    });

    $('#clear').on('click', function() {
	$('#log').empty();
	return false;
    });

    if(typeof nx !== 'undefined') {
	nx.onload = function(){
        vol.sendsTo(function(data){HoxtonOwl.midiClient.sendCc(7, data.value*127);});
	s1.sendsTo(function(data){HoxtonOwl.midiClient.sendCc(OpenWareMidiControl.PATCH_PARAMETER_A, data.value*127);});
	s2.sendsTo(function(data){HoxtonOwl.midiClient.sendCc(OpenWareMidiControl.PATCH_PARAMETER_B, data.value*127);});
	s3.sendsTo(function(data){HoxtonOwl.midiClient.sendCc(OpenWareMidiControl.PATCH_PARAMETER_C, data.value*127);});
	s4.sendsTo(function(data){HoxtonOwl.midiClient.sendCc(OpenWareMidiControl.PATCH_PARAMETER_D, data.value*127);});
	// s5.sendsTo(function(data){HoxtonOwl.midiClient.sendCc(OpenWareMidiControl.PATCH_PARAMETER_E, data.value*127);});
	// s6.sendsTo(function(data){HoxtonOwl.midiClient.sendCc(OpenWareMidiControl.PATCH_PARAMETER_F, data.value*127);});
	// s7.sendsTo(function(data){HoxtonOwl.midiClient.sendCc(OpenWareMidiControl.PATCH_PARAMETER_G, data.value*127);});
	// s8.sendsTo(function(data){HoxtonOwl.midiClient.sendCc(OpenWareMidiControl.PATCH_PARAMETER_H, data.value*127);});
	
	// pb.draw();
	// pb.sendsTo(function(data){HoxtonOwl.midiClient.sendPb(data.value*16383);});
	// mod.sendsTo(function(data){HoxtonOwl.midiClient.sendCc(1, data.value*127);});
	// vol.sendsTo(function(data){HoxtonOwl.midiClient.sendCc(7, data.value*127);});

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
	// push.sendsTo(function(data){
	//     if(data.press != undefined)
	// 	HoxtonOwl.midiClient.sendCc(OpenWareMidiControl.PATCH_BUTTON, data.press*127);
	//     console.log(data);
	// });
	// rc.sendsTo(function(data){
	//     HoxtonOwl.midiClient.sendCc(OpenWareMidiControl.PATCH_CONTROL, data.value*127);
	//     console.log(data);
	// });
	// sliders1.setNumberOfSliders(8);
	// sliders1.sendsTo(function(data){
	//     var key = parseInt(Object.keys(data)[0]);
	//     HoxtonOwl.midiClient.sendCc(OpenWareMidiControl.PATCH_PARAMETER_AA+key, data[key]*127);
	// });
	// sliders2.setNumberOfSliders(8);
	// sliders2.sendsTo(function(data){
	//     var key = parseInt(Object.keys(data)[0]);
	//     HoxtonOwl.midiClient.sendCc(OpenWareMidiControl.PATCH_PARAMETER_BA+key, data[key]*127);
	// });
	// keyboard.mode = "sustain";
	// keyboard.sendsTo(function(data){
	//     // there's a bug in keyboard that sends out velocity up to 128
	//     HoxtonOwl.midiClient.sendNoteOn(data.note, Math.min(data.on, 127));
	// });
	// metroball.sendsTo(function(data){
	//     console.log(data);
	//     HoxtonOwl.midiClient.sendNoteOn(data.x*127, data.side*60);
	// });
	};
    }

    $('#scope').on('click', function() {
	var context = new window.AudioContext()
	// if (context.state === 'suspended') {
	//     await context.resume();
	// SyntaxError: await is only valid in async functions and the top level bodies of modules
	// }
	myOscilloscope = new WavyJones(context, 'oscilloscope');
	// get user microphone
	var constraints = { video: false,
			    audio: {
				echoCancellation: false,
				autoGainControl: false,
				noiseSuppression: false,
				latency: 0
			    }
			  };
	navigator.mediaDevices.getUserMedia(constraints, function(stream) {
	    var source = context.createMediaStreamSource(stream);
	    source.connect(myOscilloscope);
	    // myOscilloscope.connect(context.destination);
	    console.log('mic connected')
	}, function (error) {
	    console.error("getUserMedia error:", error);
	});
	context.resume();
    });
    
    connectToOwl();
});
