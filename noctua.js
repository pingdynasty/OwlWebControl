
function pitchBend(channel, value) {
    // console.log("received PB "+channel+":"+value);
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

$(document).ready(function() {
    $('#clear').on('click', function() {
	$('#log').empty();
	return false;
    });
    connectToOwl();
});
