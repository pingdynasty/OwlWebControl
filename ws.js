
$(document).ready(function() {
    var oscPort;

    $("#clear").on("click", function() {
	$("#log").empty();
	return false;
    });

    $("#connect").on("click", function() {
	oscPort = new osc.WebSocketPort({
            url: "ws://localhost:8008/osc",
	    useSLIP: false
        });

	oscPort.on("message", function (msg) {
	    // $("#log").append(JSON.stringify(msg)).append("<br>");
	    if(msg.address == "/osm/a/cv"){
		cvArx.set({value: msg.args[0]}, false);
		console.log("/osm/a/cv "+msg.args[0]);
	    }else if(msg.address == "/osm/a/tr"){
		trArx.set({press: msg.args[0]}, false);
	    }else if(msg.address == "/osm/b/cv"){
		cvBrx.set({value: msg.args[0]}, false);
	    }else if(msg.address == "/osm/b/tr"){
		trBrx.set({press: msg.args[0]}, false);
	    }else if(msg.address == "/osm/status"){
		$("#log").append("Status: "+msg.args[0]).append("<br>");
	    }else{
		$("#log").append("Unrecognised message: "+JSON.stringify(msg)).append("<br>");
	    }
        });
        oscPort.on("close", function(){
	    $("#log").append("Web socket closed").append("<br>");
	    console.log("connection closed");
	});
        oscPort.on("open", function(){
	    $("#log").append("Web socket open").append("<br>");
	    console.log("connection opened");
	});
        oscPort.open();
	oscPort.socket.onmessage = function (e) {
            console.log("onmessage", e);
        };

	console.log("connected?");
	return false;
    });


    $("#disconnect").on("click", function() {
	// oscPort.socket.close();
	oscPort.close(1000, "Bye");
	return false;
    });

    nx.onload = function(){
	trAtx.mode = "toggle";
	trArx.mode = "toggle";
	trBtx.mode = "toggle";
	trBrx.mode = "toggle";

	cvAtx.sendsTo(function(data){
	    var msg = { address: "/osm/a/cv", args: data.value };
	    // $("#log").append(JSON.stringify(msg)).append("<br>");
	    if(oscPort)
		oscPort.send(msg);
	});

	trAtx.sendsTo(function(data){
	    var msg = { address: "/osm/a/tr", args: data.press };
	    // $("#log").append(JSON.stringify(msg)).append("<br>");
	    if(oscPort)
		oscPort.send(msg);
	});

	cvBtx.sendsTo(function(data){
	    if(oscPort) oscPort.send({address: "/osm/b/cv", args: data.value });
	});

	trBtx.sendsTo(function(data){
	    if(oscPort) oscPort.send({address: "/osm/b/tr", args: data.press });
	});

	cvAAtx.sendsTo(function(data){
	    if(oscPort) oscPort.send({address: "/osm/aa", args: data.value });
	});
	cvABtx.sendsTo(function(data){
	    if(oscPort) oscPort.send({address: "/osm/ab", args: data.value });
	});
	cvACtx.sendsTo(function(data){
	    if(oscPort) oscPort.send({address: "/osm/ac", args: data.value });
	});
	cvADtx.sendsTo(function(data){
	    if(oscPort) oscPort.send({address: "/osm/ad", args: data.value });
	});
	cvAEtx.sendsTo(function(data){
	    if(oscPort) oscPort.send({address: "/osm/ae", args: data.value });
	});
	cvAFtx.sendsTo(function(data){
	    if(oscPort) oscPort.send({address: "/osm/af", args: data.value });
	});
	cvAGtx.sendsTo(function(data){
	    if(oscPort) oscPort.send({address: "/osm/ag", args: data.value });
	});
	cvAHtx.sendsTo(function(data){
	    if(oscPort) oscPort.send({address: "/osm/ah", args: data.value });
	});

	cvBAtx.sendsTo(function(data){
	    if(oscPort) oscPort.send({address: "/osm/ba", args: data.value });
	});
	cvBBtx.sendsTo(function(data){
	    if(oscPort) oscPort.send({address: "/osm/bb", args: data.value });
	});
	cvBCtx.sendsTo(function(data){
	    if(oscPort) oscPort.send({address: "/osm/bc", args: data.value });
	});
	cvBDtx.sendsTo(function(data){
	    if(oscPort) oscPort.send({address: "/osm/bd", args: data.value });
	});
	cvBEtx.sendsTo(function(data){
	    if(oscPort) oscPort.send({address: "/osm/be", args: data.value });
	});
	cvBFtx.sendsTo(function(data){
	    if(oscPort) oscPort.send({address: "/osm/bf", args: data.value });
	});
	cvBGtx.sendsTo(function(data){
	    if(oscPort) oscPort.send({address: "/osm/bg", args: data.value });
	});
	cvBHtx.sendsTo(function(data){
	    if(oscPort) oscPort.send({address: "/osm/bh", args: data.value });
	});

    };
});
