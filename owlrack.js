function isManualControl(owl){
    return true;
}

function sendParameter(owl, slider, value){
    // console.log("parameter "+slider+" : "+value);
    if(isManualControl(owl))
	HoxtonOwl.midiClient.sendChCc(owl, OpenWareMidiControl.PATCH_PARAMETER_A+slider-1, value);
}

function updateSlider(owl, slider, value){
    var sid = "#o"+owl+"s"+slider;
    // console.log("slider "+sid+" : "+value);
    // if(!isManualControl(owl)){
	// $(sid).val(value);
    // }
}

function updateSelect(owl, value){
    console.log("select "+owl+" : "+value);
    if(owl == 1)
	$("#p1").val(value);
    else
	$("#p2").val(value);
}

function controlChange(status, cc, value){
    var ch = parseInt(status)&0x0f;
    cc = parseInt(cc);
    // console.log("received CC "+ch+":"+cc+":"+value);
    if(ch == 0 && cc == OpenWareMidiControl.PATCH_PARAMETER_A)
    	updateSelect(1, value);
    else if(ch == 0 && cc == OpenWareMidiControl.PATCH_PARAMETER_B)
    	updateSelect(2, value);
    else if(cc == OpenWareMidiControl.PATCH_PARAMETER_E){
    	if(ch == 1)
    	    updateSelect(1, value);
    	else if(ch == 3)
    	    updateSelect(2, value);
    } else 
    if(ch >= 1 && ch <= 4)
	updateSlider(ch, 1+cc-OpenWareMidiControl.PATCH_PARAMETER_A, value);
}

function changePreset(ab, value){
    if(ab == 1)
	HoxtonOwl.midiClient.sendChCc(0, OpenWareMidiControl.PATCH_PARAMETER_A, value);
    else
	HoxtonOwl.midiClient.sendChCc(0, OpenWareMidiControl.PATCH_PARAMETER_B, value);
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

    $("#patchupload").on('change', function(evt) {
	sendProgram(evt);
    });

    $("#connect").on('click', function() {
    	console.log("connect");
    	if(navigator && navigator.requestMIDIAccess)
            navigator.requestMIDIAccess({sysex:true});
	connectToOwl();
	// doStatusRequestLoop = false;
    	// if(navigator && navigator.requestMIDIAccess)
        //     navigator.requestMIDIAccess({sysex:true});
    	// HoxtonOwl.midiClient.initialiseMidi(HoxtonOwl.midiClient.onMidiInitialised);
    });

    $('#clear').on('click', function() {
	$('#log').empty();
	return false;
    });
});
