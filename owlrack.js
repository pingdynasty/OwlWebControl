function isManualControl(owl){
    return true;
}

function sendParameter(owl, pid, value){
    // console.log("parameter "+pid+" : "+value);
    if(isManualControl(owl))
	HoxtonOwl.midiClient.sendChCc(owl, pid, value);
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
    // else
    // 	$("#p2").val(value/2);
}

function controlChange(status, cc, value){
    var ch = parseInt(status)&0x0f;
    cc = parseInt(cc);
    console.log("received CC "+ch+":"+cc+":"+value);
    if(ch == 0 && cc == OpenWareMidiControl.PATCH_PARAMETER_A){
    	updateSelect(1, value);
    // }else if(ch == 0 && cc == OpenWareMidiControl.PATCH_PARAMETER_B){
    // 	updateSelect(2, value);
    }else if(cc == OpenWareMidiControl.PATCH_PARAMETER_E){
    	if(ch == 1)
    	    updateSelect(1, value);
    // 	else if(ch == 3)
    // 	    updateSelect(2, value);
    // }else if(cc == OpenWareMidiControl.PATCH_PARAMETER_F && ch == 1){
    // 	updateSelect(2, value);
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

    connectToOwl();
   
    $("#patchupload").on('change', function(evt) {
	sendProgram(evt);
    });

    $("#connect").on('click', function() {
    	console.log("connect");
    	if(navigator && navigator.requestMIDIAccess)
            navigator.requestMIDIAccess({sysex:true});
	connectToOwl();
	setMonitor(false);
    });

    $('#clear').on('click', function() {
	$('#log').empty();
	return false;
    });
});
