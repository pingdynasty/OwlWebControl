function sleep(milliseconds) {
  var start = new Date().getTime();
  for (var i = 0; i < 1e7; i++) {
    if ((new Date().getTime() - start) > milliseconds){
      break;
    }
  }
}

function noteOn(status, note, velocity) {
    console.log("received noteOn "+(status&0x0f)+"/"+note+"/"+velocity);
}

function noteOff(status, note) {
    console.log("received noteOff "+(status&0x0f)+"/"+note);
}

function getStringFromSysex(data, startOffset, endOffset){
  var str = "";
  for(i=startOffset; i<(data.length-endOffset) && data[i] != 0x00; ++i)
    str += String.fromCharCode(data[i]);
  return str;
}

function registerPatch(idx, name){
    $('#patchnames').append($("<option>").attr('value',idx).text(name));
}

function log(msg){
    $('#log').append('<li><span class="badge">' + msg + '</span></li>');
}

function systemExclusive(data) {
    if(data.length > 3 && data[0] == 0xf0
       && data[1] == MIDI_SYSEX_MANUFACTURER){
       // && data[2] == MIDI_SYSEX_DEVICE){
	// console.log("sysex: 0x"+data[3].toString(16)+" length: "+data.length);
	switch(data[3]){
	case OpenWareMidiSysexCommand.SYSEX_PRESET_NAME_COMMAND:
            var name = getStringFromSysex(data, 5, 1);
	    var idx = data[4];
	    registerPatch(idx, name);
	    // log("preset "+idx+": "+name);
	    break;
	case OpenWareMidiSysexCommand.SYSEX_RESOURCE_NAME_COMMAND:
            var name = getStringFromSysex(data, 5, 1);
	    var idx = data[4];
	    log("resource "+idx+": "+name);
	    break;
	case OpenWareMidiSysexCommand.SYSEX_PARAMETER_NAME_COMMAND:
            var name = getStringFromSysex(data, 5, 1);
	    var pid = data[4]+1;
	    console.log("parameter "+pid+" :"+name);
	    if(pid >= 1 && pid <= 8)
		$("#p"+pid).text(name); // update the prototype slider names
	    break;
	case OpenWareMidiSysexCommand.SYSEX_DEVICE_ID:
            var msg = getStringFromSysex(data, 4, 1);
	    console.log("device id "+msg);
	    log("Unique Device ID: "+msg);
	    break;
	case OpenWareMidiSysexCommand.SYSEX_FIRMWARE_UPLOAD:
	    var index = decodeInt(data.slice(4, 5));
	    log("Resource sequence: "+index);
	    if(index == 0){
		var size = decodeInt(data.slice(9, 5));
		log("Resource size: "+size);
	    }
	    break;
	case OpenWareMidiSysexCommand.SYSEX_FIRMWARE_VERSION:
            var msg = getStringFromSysex(data, 4, 1);
	    console.log("firmware "+msg);
	    log("Firmware version: "+msg);
	    $("#ourstatus").text("Connected to "+msg);	    
	    break;
	case OpenWareMidiSysexCommand.SYSEX_BOOTLOADER_VERSION:
            var msg = getStringFromSysex(data, 4, 1);
	    console.log("bootloader "+msg);
	    log("Bootloader version: "+msg);
	    break;
	case OpenWareMidiSysexCommand.SYSEX_PROGRAM_MESSAGE:
            var msg = getStringFromSysex(data, 4, 1);
	    console.log("program message "+msg);
	    log("Program Message: "+msg);
	    $("#patchmessage").text(msg);
	    break;
	case OpenWareMidiSysexCommand.SYSEX_PROGRAM_STATS:
            var msg = getStringFromSysex(data, 4, 1);
	    console.log("program stats "+msg);
	    // log("Program Stats: "+msg);
	    $("#patchstatus").text(msg);
	    break;
	case OpenWareMidiSysexCommand.SYSEX_PROGRAM_ERROR:
            var msg = getStringFromSysex(data, 4, 1);
	    console.log("program error "+msg);
	    $("#patchstatus").text(msg);
	    log("Error: "+msg);
	    break;
	case OpenWareMidiSysexCommand.SYSEX_DEVICE_STATS:
            var msg = getStringFromSysex(data, 4, 1);
	    console.log("device stats "+msg);
	    log("Device Stats: "+msg);
	    break;
	default:
	    log("Unhandled message["+data[3]+", "+data.length+"]: "+data);
	    break;
	}
    }
}

function programChange(pc){
    console.log("received PC "+pc);
    // resetParameterNames();
    var name = $("#patchnames option:eq("+pc+")").text();
    console.log("patch name "+name);
    $("#patchname").text(name);			    
}


function sendRequest(type){
    HoxtonOwl.midiClient.sendCc(OpenWareMidiControl.REQUEST_SETTINGS, type);
}

function sendStatusRequest(){
    sendRequest(OpenWareMidiSysexCommand.SYSEX_PROGRAM_MESSAGE);
    // sendRequest(OpenWareMidiSysexCommand.SYSEX_DEVICE_STATS);
    sendRequest(OpenWareMidiSysexCommand.SYSEX_PROGRAM_STATS);
    // sendRequest(OpenWareMidiControl.PATCH_PARAMETER_A); // request parameter values
}

function setParameter(pid, value){
    console.log("parameter "+pid+": "+value);
    HoxtonOwl.midiClient.sendCc(OpenWareMidiControl.PATCH_PARAMETER_A+pid, value);
}

function resetParameterNames(){
    for(var i=1; i<=8; ++i)
        $("#p"+i).text(String.fromCharCode(64+i)); // reset the prototype slider names
}

function selectOwlPatch(pid){
    console.log("select patch "+pid);
    sendPc(pid);
}

function sendLoadRequest(){
    sendRequest(OpenWareMidiSysexCommand.SYSEX_PRESET_NAME_COMMAND);
    sendRequest(OpenWareMidiSysexCommand.SYSEX_PARAMETER_NAME_COMMAND);
}

function onMidiInitialised(){
    // auto set the input and output to an OWL   
    var outConnected = false,
        inConnected = false;
    for (var i = 0; i < HoxtonOwl.midiClient.midiOutputs.length; i++) {
	var name = HoxtonOwl.midiClient.midiOutputs[i].name;
	console.log("option: "+i+": "+name);
        if (!outConnected && name.match('^OWL-')) {
            HoxtonOwl.midiClient.selectMidiOutput(i);
            outConnected = true;
	    $('#midiOutputs').append($('<option>', {value:i, text: name, selected: true}));
        }else{
	    $('#midiOutputs').append($('<option>', {value:i, text: name}));
	}
    }
    for (var i = 0; i < HoxtonOwl.midiClient.midiInputs.length; i++) {
	var name = HoxtonOwl.midiClient.midiInputs[i].name;
	console.log("option: "+i+": "+name);
        if (!inConnected && name.match('^OWL-')) {
            HoxtonOwl.midiClient.selectMidiInput(i);
            inConnected = true;
	    $('#midiInputs').append($('<option>', {value:i, text: name, selected: true}));
        }else{
	    $('#midiInputs').append($('<option>', {value:i, text: name}));
	}
    }
    if (inConnected && outConnected) {
        console.log('connected to an OWL');
        $('#ourstatus').text('Connected')
        $('#load-owl-button').show();
	sendRequest(OpenWareMidiSysexCommand.SYSEX_FIRMWARE_VERSION);
	sendLoadRequest(); // load patches
	setMonitor(true);
    } else {
        console.log('failed to connect to an OWL');
        $('#ourstatus').text('Failed to connect. Try again.')
        $('#load-owl-button').hide();
    }
}

function updatePermission(name, status) {
    console.log('update permission for ' + name + ' with ' + status);
    log('update permission for ' + name + ' with ' + status);
}

function connectToOwl() {
    if(navigator && navigator.requestMIDIAccess){
        navigator.requestMIDIAccess({sysex:true});
	HoxtonOwl.midiClient.initialiseMidi(onMidiInitialised);
    }
}

var monitorTask = undefined;
function setMonitor(poll){
    if(poll && monitorTask == undefined){
    	monitorTask = window.setInterval(sendStatusRequest, 1000);
    }else if(!poll && monitorTask != undefined){
    	clearInterval(monitorTask);
    	monitorTask = undefined;
    }
}

var makeCRCTable = function(){
    var c;
    var crcTable = [];
    for(var n =0; n < 256; n++){
        c = n;
        for(var k =0; k < 8; k++){
            c = ((c&1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1));
        }
        crcTable[n] = c;
    }
    return crcTable;
}

var crc32 = function(str) {
    var crcTable = window.crcTable || (window.crcTable = makeCRCTable());
    var crc = 0 ^ (-1);
    for (var i = 0; i < str.length; i++ ) {
        crc = (crc >>> 8) ^ crcTable[(crc ^ str.charCodeAt(i)) & 0xFF];
    }
    return (crc ^ (-1)) >>> 0;
};

function decodeInt(x){
    console.log("data: "+x);
    var msb = x[0];
    var y = x[1] << 24;
    y += x[2] << 16;
    y += x[3] << 8;
    y += x[4] << 0;
    y += (msb & 0x01) ? 0x80000000 : 0;
    y += (msb & 0x02) ? 0x800000 : 0;
    y += (msb & 0x04) ? 0x8000 : 0;
    y += (msb & 0x08) ? 0x80 : 0;
    return y;
}

function encodeInt(x){
    var b = [ ((x&0x80000000)?1:0) | ((x&0x800000)?2:0) | ((x&0x8000)?4:0) | ((x&0x80)?8:0),
	      (x>>24) & 0x7f, (x>>16) & 0x7f, (x>>8) & 0x7f, (x>>0) & 0x7f];
    return b;
}

function encodeSysexData(data){
    console.log("encoding "+data.length+" bytes");
    var sysex = [];
    var cnt = 0;
    var cnt7 = 0;
    var pos = 0;
    sysex[0] = 0;
    for(cnt = 0; cnt < data.length; cnt++) {
	var c = data.charCodeAt(cnt) & 0x7F;
	var msb = data.charCodeAt(cnt) >> 7;
	sysex[pos] |= msb << cnt7;
	sysex[pos + 1 + cnt7] = c;
	if(cnt7++ == 6) {
	    pos += 8;
	    sysex[pos] = 0;
	    cnt7 = 0;
	}
    }
    return sysex;
}

function packageSysexData(raw){
    var data = encodeSysexData(raw);
    // returns array of Sysex messages 
    var chunks = [];
    var i = 0;
    // all messages must have message index
    // first message contains data length
    var packageIndex = 0;
    var msg = [0xf0, MIDI_SYSEX_MANUFACTURER, MIDI_SYSEX_OMNI_DEVICE, OpenWareMidiSysexCommand.SYSEX_FIRMWARE_UPLOAD];
    msg = msg.concat(encodeInt(packageIndex++));
    msg = msg.concat(encodeInt(raw.length));
    msg.push(0xf7);
    chunks.push(msg);
    while(i < data.length){
	msg = [0xf0, MIDI_SYSEX_MANUFACTURER, MIDI_SYSEX_OMNI_DEVICE, OpenWareMidiSysexCommand.SYSEX_FIRMWARE_UPLOAD];
	msg = msg.concat(encodeInt(packageIndex++));
	var j = msg.length;
	for(; j<249 && i<data.length; ++j)
	    msg[j] = data[i++];
	msg[j] = 0xf7;
	chunks.push(msg);
    }
    // add CRC message
    msg = [0xf0, MIDI_SYSEX_MANUFACTURER, MIDI_SYSEX_OMNI_DEVICE, OpenWareMidiSysexCommand.SYSEX_FIRMWARE_UPLOAD];
    msg = msg.concat(encodeInt(packageIndex++));
    var checksum = crc32(raw);
    console.log("Checksum: "+checksum);
    msg = msg.concat(encodeInt(checksum));
    msg.push(0xf7);
    chunks.push(msg);
    return chunks;
}

function saveResource(name, files){
    console.log("sending resource "+name);
    sendResource(files).then(function(){
	console.log("saving resource "+name);
	sendResourceSave(name);
	log("Saved resource "+name);
	sendRequest(OpenWareMidiSysexCommand.SYSEX_RESOURCE_NAME_COMMAND);
    }, function(err){ console.error(err); });
}

function eraseResource(slot){
    log("Erasing resource "+slot);
    var msg = [0xf0, MIDI_SYSEX_MANUFACTURER, MIDI_SYSEX_OMNI_DEVICE, OpenWareMidiSysexCommand.SYSEX_FLASH_ERASE];
    msg = msg.concat(encodeInt(slot));
    msg.push(0xf7);
    if(HoxtonOwl.midiClient.midiOutput)
        HoxtonOwl.midiClient.midiOutput.send(msg, 0);            
}

function requestResource(slot){
    log("Requesting resource "+slot);
    var msg = [0xf0, MIDI_SYSEX_MANUFACTURER, MIDI_SYSEX_OMNI_DEVICE, OpenWareMidiSysexCommand.SYSEX_FIRMWARE_SEND];
    msg = msg.concat(encodeInt(slot));
    msg.push(0xf7);
    if(HoxtonOwl.midiClient.midiOutput)
        HoxtonOwl.midiClient.midiOutput.send(msg, 0);
}

function sendResource(files, resolve){
    return new Promise((resolve, reject) => {
	for (var i = 0, len = files.length; i < len; i++) {
            var f = files[i];
	    var reader = new FileReader();
	    reader.onload = (function(theFile) {
		return function(e) {
		    console.log("Read resource "+theFile.name);
		    var chunks = packageSysexData(e.target.result);
		    sendDataChunks(0, chunks, resolve);
		};
	    })(f);
	    // reader.readAsDataURL(f);
	    reader.readAsBinaryString(f);
	}	
    });
}

function sendProgram(files, resolve){
    return new Promise((resolve, reject) => {
	for (var i = 0, f; f = files[i]; i++) {
	    // Only process syx files.
	    // if (!f.name.match('*\\.syx')) {
            //     continue;
	    // }
	    var reader = new FileReader();

	    // Closure to capture the file information.
	    reader.onload = (function(theFile) {
		return function(e) {
		    log("Reading file "+theFile.name);
		    sendProgramFromUrl(e.target.result, resolve).then(
			function(){resolve && resolve();});
		};
	    })(f);
	    reader.readAsDataURL(f);
	    // reader.readAsBinaryString(f);
	}	
    });
}

function sendFirmwareFlash(checksum){
    var crc = parseInt(checksum, 16);
    console.log("sending firmware flash ["+checksum+":"+crc+"] command");
    var b = encodeInt(crc);
    console.log("bytes ["+b+"] command");
    var msg = [0xf0, MIDI_SYSEX_MANUFACTURER, MIDI_SYSEX_OMNI_DEVICE, 
               OpenWareMidiSysexCommand.SYSEX_FIRMWARE_FLASH, b[0], b[1], b[2], b[3], b[4], 0xf7 ];
    HoxtonOwl.midiClient.logMidiData(msg);
    if(HoxtonOwl.midiClient.midiOutput)
        HoxtonOwl.midiClient.midiOutput.send(msg, 0);
}

function sendProgramRun(){
    return new Promise((resolve, reject) => {
	console.log("sending sysex run command");
	var msg = [0xf0, MIDI_SYSEX_MANUFACTURER, MIDI_SYSEX_OMNI_DEVICE, 
		   OpenWareMidiSysexCommand.SYSEX_FIRMWARE_RUN, 0xf7 ];
	HoxtonOwl.midiClient.logMidiData(msg);
	if(HoxtonOwl.midiClient.midiOutput)
            HoxtonOwl.midiClient.midiOutput.send(msg, 0);
    });
}

function sendResourceSave(name){
    return new Promise((resolve, reject) => {
	console.log("sending sysex save ["+name+"] command");
	var msg = [0xf0, MIDI_SYSEX_MANUFACTURER, MIDI_SYSEX_OMNI_DEVICE, 
		   OpenWareMidiSysexCommand.SYSEX_FIRMWARE_SAVE];
	for(var i=0; i<name.length; ++i)
	    msg.push(name.charCodeAt(i));
	msg.push(0x00);
	msg.push(0xf7);
	HoxtonOwl.midiClient.logMidiData(msg);
	if(HoxtonOwl.midiClient.midiOutput)
            HoxtonOwl.midiClient.midiOutput.send(msg, 0);
    });    
}

function sendProgramStore(slot){
    return new Promise((resolve, reject) => {
	console.log("sending sysex store ["+slot+"] command");
	var msg = [0xf0, MIDI_SYSEX_MANUFACTURER, MIDI_SYSEX_OMNI_DEVICE, 
		   OpenWareMidiSysexCommand.SYSEX_FIRMWARE_STORE, 0, 0, 0, 0, slot, 0xf7 ];
	HoxtonOwl.midiClient.logMidiData(msg);
	if(HoxtonOwl.midiClient.midiOutput)
            HoxtonOwl.midiClient.midiOutput.send(msg, 0);
    });
}

function chunkData(data){
    var chunks = [];
    var start = 0;
    for(var i = 0; i < data.length; ++i){
        if(data[i] == 0xf0){
            start = i;
        } else if(data[i] == 0xf7){
            chunks.push(data.subarray(start, i + 1));
        }
    }
    return chunks;
}

function sendDataChunks(index, chunks, resolve){
    if(index < chunks.length){
        HoxtonOwl.midiClient.logMidiData(chunks[index]);
        if(HoxtonOwl.midiClient.midiOutput){
            console.log("sending chunk "+ index + ' with '+ chunks[index].length +" bytes sysex");
            HoxtonOwl.midiClient.midiOutput.send(chunks[index], 0);            
        }
        window.setTimeout(function(){
            sendDataChunks(++index, chunks, resolve);
        }, 1);
    } else {
        resolve && resolve();
    }
}

function sendProgramData(data, resolve){
    return new Promise( (resolve, reject) => {
        log("Sending data "+data.length+" bytes"); 
        var chunks = chunkData(data);
        sendDataChunks(0, chunks, resolve);
    });
}

function sendProgramFromUrl(url, resolve){
    return new Promise((resolve, reject) => {
        console.log("sending patch from url "+url.substring(0, 64));
        var oReq = new XMLHttpRequest();
        oReq.responseType = "arraybuffer";
        oReq.onload = function (oEvent) {   
            var arrayBuffer = oReq.response; // Note: not oReq.responseText
            if(arrayBuffer) {  
                var data = new Uint8Array(arrayBuffer);
                resolve(
                    sendProgramData(data, resolve).then(function(){
			console.log("data sent");
			resolve && resolve();
                    }, function(err){
                        console.error(err);
                    })
                );
            }
        }
        oReq.open("GET", url, true);
        oReq.send();
    });
}

function loadPatchFromServer(patchId){
    return sendProgramFromUrl(API_END_POINT + '/builds/' + patchId + '?format=sysex&amp;download=1');
}

