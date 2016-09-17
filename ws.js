
$(document).ready(function() {
    var oscPort;

    $("#clear").on("click", function() {
	$("#log").empty();
	return false;
    });

    $("#connect").on("click", function() {
	oscPort = new osc.WebSocketPort({
            url: "ws://192.168.0.1:8008/osc",
	    useSLIP: false
        });

	oscPort.on("message", function (msg) {
	    // $("#log").append(JSON.stringify(msg)).append("<br>");
	    if(msg.address == "/osm/a/cv"){
		cvArx.set({value: msg.args[0]}, false);
		console.log("/osm/a/cv "+msg.args[0]);
	    }else if(msg.address == "/osm/a/tr"){
		trArx.set({press: msg.args[0]}, false);
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

    };
});
