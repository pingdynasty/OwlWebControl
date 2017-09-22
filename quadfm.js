
function controlChange(status, cc, value){
    var ch = parseInt(status)&0x0f;
    cc = parseInt(cc);
    console.log("received CC "+ch+":"+cc+":"+value);
    // if(ch == 0 && cc == OpenWareMidiControl.PATCH_PARAMETER_A)
    // 	updateSelect(1, value);
    // else if(ch == 0 && cc == OpenWareMidiControl.PATCH_PARAMETER_B)
    // 	updateSelect(2, value);
    // else if(cc == OpenWareMidiControl.PATCH_PARAMETER_E){
    // 	if(ch == 1)
    // 	    updateSelect(1, value);
    // 	else if(ch == 3)
    // 	    updateSelect(2, value);
    // } else 
    // if(ch >= 1 && ch <= 4)
    // 	updateSlider(ch, 1+cc-OpenWareMidiControl.PATCH_PARAMETER_A, value);
}

function updateValue(itm, val){
    itm.value = val;
    itm.dispatchEvent(new Event('change'));
}

function setPreset(idx){
    console.log("set preset "+idx);
    updateValue(o1i, 0);
    updateValue(o2i, 0);
    updateValue(o3i, 0);
    updateValue(o4i, 0);
    updateValue(i1i, 0.3);
    updateValue(i2i, 0.3);
    updateValue(i3i, 0.3);
    updateValue(i4i, 0.3);
    if(idx == 1){
	updateValue(r1i, 3);
	updateValue(r2i, 2);
	updateValue(r3i, 0.5);
	updateValue(r4i, 1);
	updateValue(ai, 1);
    }else if(idx == 2){
	updateValue(r1i, 2.5);
	updateValue(r2i, 3.5);
	updateValue(r3i, 0.5);
	updateValue(r4i, 2);
	updateValue(ai, 8);
    }else if(idx == 3){
	updateValue(r1i, 3);
	updateValue(r2i, 2);
	updateValue(r3i, 0.25);
	updateValue(r4i, 1);
	updateValue(ai, 10);
    }else if(idx == 4){
	updateValue(r1i, 4);
	updateValue(r2i, 3);
	updateValue(r3i, 2);
	updateValue(r4i, 1);
	updateValue(ai, 11);
    }
}
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

    // $("#patchupload").on('change', function(evt) {
    // 	sendProgram(evt);
    // });

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

    
    connectToOwl();
    setPreset(1);

});
