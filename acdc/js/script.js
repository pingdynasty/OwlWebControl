
var offsets;

function noteToFrequency(note){
    return 440 * Math.pow(2, (note - 69) / 12);
}
function frequencyToNote(freq){
    return 12 * Math.log2f(freq / 440) + 69;
}

function pitchBend(channel, value) {
    console.log("received PB "+channel+":"+value);
    offsets[channel] = value;
    switch(channel){
    case 0:
	document.getElementById("offset1").value = value;
	// document.getElementById("offset1").value = (value - 8192)/8192;
	break;
    case 1:
	document.getElementById("offset2").value = value;
	break;
    case 2:
	document.getElementById("offset3").value = value;
	break;
    case 3:
	document.getElementById("offset4").value = value;
	break;
    }
}    

function controlChange(status, controller, value){
    var ch = parseInt(status)&0x0f;
    controller = parseInt(controller);
    console.log("received CC "+ch+":"+controller+":"+value);
    switch(controller){
    // case cc.DYNAMIC_RANGE:
    // 	dyn_range.value = value;
    // 	break;
    }
}

function loadPatch(name){
    var url = "patches/"+name+".syx";
    console.log("loading patch "+url);
    sendProgramFromUrl(url)
	.then(function(){ sendProgramRun(); }, function(err){ console.error(err); });			    
}

function storePatch(name, slot){
    var url = "patches/"+name+".syx";
    console.log("storing patch "+url);
    sendProgramFromUrl(url)
	.then(function(){ sendProgramStore(slot); }, function(err){ console.error(err); });			    
}

function loadResource(name, slot){
    var url = "patches/"+name+".syx";
    console.log("storing resource "+url);
    sendResourceFromUrl(url)
	.then(function(){ console.log("loaded"); }, function(err){ console.error(err); });
}

function storeResource(name, slot){
    var url = "patches/"+name+".syx";
    console.log("storing resource "+url);
    sendResourceFromUrl(url)
	.then(function(){ sendResourceSave(slot); }, function(err){ console.error(err); });
}

function setButton(bid, ison){
    HoxtonOwl.midiClient.sendCc(ison ? OpenWareMidiControl.PATCH_BUTTON_ON :
				OpenWareMidiControl.PATCH_BUTTON_OFF, bid+3);
}

function drawAllADSR() {
    envADSR.setAttackRate(attack.value*200);
    envADSR.setDecayRate(decay.value*200);
    envADSR.setSustainLevel(sustain.value);
    envADSR.setReleaseRate(release.value*200);
    envADSR.setTargetRatioA(0.001 * (Math.exp(12.0*ratioASlider.value)-1.0));
    envADSR.setTargetRatioDR(0.001 * (Math.exp(12.0*ratioDRSlider.value)-1.0));
    drawADSR();
}

function drawADSR() {
    if(!$('#adsr').is(":visible"))
	return;
    var val;
    var envPlot = [];
    envADSR.reset();
    envADSR.gate(1);
    envPlot.push([0, 0]);
    var idx;
    for (idx = 1; idx < 400; idx++)
	envPlot.push([idx, envADSR.process()]);
    envADSR.gate(0);
    for (idx = 400; idx < 600; idx++)
	envPlot.push([idx, envADSR.process()]);
    
    // plot linear
    // colours: nexus azure #22bbbb, bootstrap grey dark: #5a5c69, secondary: #858796
    var options = {
	colors: ['#858796'],
	grid: { show: false },
	xaxis: { showLabels: false },
	yaxis: { max: 1.0, min: 0, showLabels: false }
    };
    Flotr.draw(document.getElementById('adsr'), [ envPlot ], options);
}

function showPatch(pid){
    $('.multi-collapse').collapse('hide');
    if(pid == 1){
	$('#cardSubtract').collapse('show');
	$('#cardAdsr').collapse('show');
	$('#cardLfo').collapse('show');
	$('#cardFx').collapse('show');
    }else if(pid == 2){
	$('#cardVosim').collapse('show');
	$('#cardAdsr').collapse('show');
	$('#cardLfo').collapse('show');
	$('#cardFx').collapse('show');
    }else if(pid == 3){
	$('#cardWavebank').collapse('show');
	$('#cardAdsr').collapse('show');
	$('#cardLfo').collapse('show');
	$('#cardFx').collapse('show');
    }else if(pid == 4){
	$('#cardQuadsampler').collapse('show');
	$('#cardFx').collapse('show');
    }else if(pid == 0){
	$('#cardIntro').collapse('show');	
    }
}

function msb16(value){
    return ((value*8192) >> 8) & 0xff;
}

function lsb16(value){
    return (value*8192) & 0xff;
}

function storeSettings(resolve){
    // var name = $('#patchname').text() + ".cfg";
    var name = "ACDC.cfg";
    console.log("storing settings for patch "+name);
    var cfg = [
	0x0e, 0xe0, offset1.value & 0x7f, (offset1.value >> 7) & 0x7f, 
	0x0e, 0xe1, offset2.value & 0x7f, (offset2.value >> 7) & 0x7f, 
	0x0e, 0xe2, offset3.value & 0x7f, (offset3.value >> 7) & 0x7f, 
	0x0e, 0xe3, offset4.value & 0x7f, (offset4.value >> 7) & 0x7f, 
	// 0x0e, 0xe0, msb16(offset1.value), lsb16(offset1.value),
	// 0x0e, 0xe1, msb16(offset2.value), lsb16(offset2.value),
	// 0x0e, 0xe2, msb16(offset3.value), lsb16(offset3.value),
	// 0x0e, 0xe3, msb16(offset4.value), lsb16(offset4.value),
    ];
    var promise = new Promise((resolve, reject) => {
	var data = new Uint8Array(cfg);
	resolve = sendDataChunks(0, packageSysexData(data), resolve);
	resolve && resolve();
    });
    promise.then(function(){
	console.log("saving resource "+name);
	sendResourceSave(name);
    }, function(err){ console.error(err); });
}

$(document).ready(function() {

    offsets = [0, 0, 0, 0];
    connectToOwl();
});
