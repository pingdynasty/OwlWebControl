
function loadPatch(name){
    var url = "https://witch.rebeltech.org/patches/"+name+".syx";
    console.log("loading patch "+url);
    $('.btn').toggleClass('disabled');
    $('#spinner_patch').toggleClass('show');
    sendProgramFromUrl(url)
	.then(function(){
	    sendProgramRun();
	    $('#spinner_patch').toggleClass('show');
	    $('.btn').toggleClass('disabled');
	}, function(err){ console.error(err); });			    
}

function storePatch(slot, name){
    var url = "https://witch.rebeltech.org/patches/"+name+".syx";
    console.log("storing patch "+url);
    $('.btn').toggleClass('disabled');
    $('#spinner_patch').toggleClass('show');
    sendProgramFromUrl(url)
	.then(function(){
	    sendProgramStore(slot);
	    console.log("stored patch in slot "+slot);	    
	    $('#spinner_patch').toggleClass('show');
	    $('.btn').toggleClass('disabled');
	}, function(err){ console.error(err); });			    
}

function storeResource(slot, name){
    var url = "https://witch.rebeltech.org/resources/"+name;
    console.log("storing resource "+url);
    $('.btn').toggleClass('disabled');
    $('#spinner_resource').toggleClass('show');
    sendResourceFromUrl(url)
	.then(function(){
	    sendResourceSave(slot);
	    console.log("stored resource in slot "+slot);	    
	    $('#spinner_resource').toggleClass('show');
	    $('.btn').toggleClass('disabled');
	}, function(err){ console.error(err); });
}

function controlChange(status, cc, value){
}

$(document).ready(function() {

    connectToOwl();
});
