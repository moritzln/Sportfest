"use strict";
var http = require("http");
var webSocketServer = require('websocket').server;
var http = require('http');
var fs = require("fs");
var jsonfile = require("jsonfile");
var store_file = "./db/store.json";
var repl = require("repl");
try{
	global.Student = require("./modules/students.js");
	global.store = require("./modules/database.js");
	global.Tournament = require("./modules/tournaments.js");
	if(global.store.tournament == undefined){
		global.store.tournament = new Tournament({title: "Sportfest", certificateTEX: "certificate.tex"});
	}else{
		global.store.tournament = new Tournament(global.store.tournament);
	}
}catch(e){
	console.log(e);
	if(store == undefined){
		console.log("This is a fatal error! Store is undefined!")
		process.exit();
	}
}
var control = require("./modules/control.js");


function startServer(){
	var rs = repl.start({prompt: "Control>"});
	rs.context.control = control;
	//STARTS WEBSOCKET-SERVER
	var server = http.createServer(function (req, res) {
	});
	var webSocketsServerPort = 1998;
	server.listen(webSocketsServerPort, function() {
	    console.log("Server is listening on port " + webSocketsServerPort);
	});
	var wss = new webSocketServer({
	    httpServer: server
	});

	global.connections = [];
	wss.on('request', function(request) {
		//Accept request
		var ws = request.accept(null, request.origin);
		ws.conId = global.connections.push(ws);

		ws.on('close', function() {
			global.connections[ws.conId] = undefined;		//!!!!!!!!!!!!!!!!!!!!!!!!!!!!! BAD SOLUTION (array will somewhen be too large)
			clearInterval(ws.interval);
		});
		//Message received
		ws.on('message', function(message) {				//!!!!!!!!!!!!!!!!!!!!!!!!!!!!! NOT FINISHED YET
			try{
				var msg = JSON.parse(message.utf8Data);
				if(ws.user != undefined || msg.type == "login"){
					switch(msg.type){
						case "getStudent":
							if(ws.user.rights >= 1 && (ws.user.clusters.indexOf(global.store.students[msg.sid].cluster) != -1 || ws.user.clusters == "all")){
								ws.sendUTF(JSON.stringify({type: "student", sid: msg.sid, student: global.store.students[msg.sid]}));
							}else{
								ws.sendUTF(JSON.stringify({type: "notification", text: "You're not allowed to see this user!", importance: 2}));
							}
							break;
						case "saveStudent":
							if(ws.user.rights >= 2 && (ws.user.clusters.indexOf(global.store.students[msg.student.sid].cluster) != -1 || ws.user.clusters == "all")){
								var sid = msg.student.sid;
								if(store.students[sid].cluster != msg.student.cluster){
									control.changeCluster(sid, msg.student.cluster);
								}
								store.students[sid] = new global.Student(msg.student);
								ws.sendUTF(JSON.stringify({type: "notification", text: msg.student.first_name+" "+msg.student.last_name+" gespeichert!", importance: 0}));
							}else{
								ws.sendUTF(JSON.stringify({type: "notification", text: "This is above your security clearance!", importance: 2}));
							}
							break;
						case "saveCluster":
							if(ws.user.rights >= 2 && (ws.user.clusters.indexOf(msg.cluster.cid) != -1 || ws.user.clusters == "all")){
								var cid = msg.cluster.cid;
								store.tournament.clusters[cid] = msg.cluster;
								ws.sendUTF(JSON.stringify({type: "notification", text: "Riege "+msg.cluster.cid+" gespeichert!", importance: 1}));
							}else{
								ws.sendUTF(JSON.stringify({type: "notification", text: "This is above your security clearance!", importance: 2}));
							}
							break;
						case "login":
							for(var u of global.store.users){
								if(u.username == msg.username && u.password == msg.password){
									ws.sendUTF(JSON.stringify({type: "login", user: u}));
									ws.user = u;
									console.log(u.username+" logged in from "+request.origin+" at "+new Date());
								}
							}
							if(ws.user != undefined){
								if(ws.user.clusters != "all"){
									var allowedStudents = [];
									for(var s of global.store.students){
										if(ws.user.clusters.indexOf(s.cluster) != -1){
											allowedStudents.push(s);
										}
									}
								}else{
									var allowedStudents = global.store.students;
								}
								ws.sendUTF(JSON.stringify({type: "allStudents", students: allowedStudents}));
								ws.interval = setInterval(function(){
									if(ws.user.clusters != "all"){
										var allowedStudents = [];
										for(var s of global.store.students){
											if(ws.user.clusters.indexOf(s.cluster) != -1){
												allowedStudents.push(s);
											}
										}
									}else{
										var allowedStudents = global.store.students;
									}
									ws.sendUTF(JSON.stringify({type: "allStudents", students: global.store.students}));
								}, 10000);
								if(ws.user.clusters != "all"){
									var allowedClusters = [];
									for(var cl of global.store.tournament.clusters){
										if(ws.user.clusters.indexOf(cl.cid) != -1){
											allowedClusters.push(cl);
										}
									}
								}else{
									var allowedClusters = global.store.tournament.clusters;
								}
								ws.sendUTF(JSON.stringify({type: "clusters", clusters: allowedClusters}));
								if(ws.user.rights >= 3){
									ws.sendUTF(JSON.stringify({type: "courses", courses: global.store.tournament.courses}));
								}
							}else{
								ws.sendUTF(JSON.stringify({type: "loginFailed"}));
							}
							break;
						case "logout":
							ws.user = undefined;
							ws.close();
							break;
						case "createUser":
							if(ws.user.rights >= 3){
								control.createUser(msg.username, msg.password, msg.rights, msg.clusters, ws);
							}else{
								ws.sendUTF(JSON.stringify({type: "notification", text: "This is above your security clearance!", importance: 2}));
							}
							break;
						case "cluster":
							if(ws.user.rights >= 3){
								control.cluster();
								ws.sendUTF(JSON.stringify({type: "notification", text: "Riegen werden eingeteilt!", importance: 2}));
							}else{
								ws.sendUTF(JSON.stringify({type: "notification", text: "This is above your security clearance!", importance: 2}));
							}
							break;
						case "importCSV":
							if(ws.user.rights >= 3){
								control.importCSV(msg.file);
								ws.sendUTF(JSON.stringify({type: "notification", text: "Daten werden importiert!", importance: 2}));
							}else{
								ws.sendUTF(JSON.stringify({type: "notification", text: "This is above your security clearance!", importance: 2}));
							}
							break;
						case "exportCSV":
							if(ws.user.rights >= 3){
								control.exportCSV();
								ws.sendUTF(JSON.stringify({type: "notification", text: "Daten wurden exportiert!", importance: 2}));
							}else{
								ws.sendUTF(JSON.stringify({type: "notification", text: "This is above your security clearance!", importance: 2}));
							}
							break;
						case "reset":
							if(ws.user.rights >= 3){
								control.clearStore();
								ws.sendUTF(JSON.stringify({type: "notification", text: "Alle Schülerdaten zurückgesetzt!", importance: 2}));
							}else{
								ws.sendUTF(JSON.stringify({type: "notification", text: "This is above your security clearance!", importance: 2}));
							}
							break;
						case "saveCourse":
							if(ws.user.rights >= 3){
								var course = msg.course;
								control.saveCourse(course);
								ws.sendUTF(JSON.stringify({type: "notification", text: "Datei in Courses/"+course+" gespeichert.", importance: 2}));
							}else{
								ws.sendUTF(JSON.stringify({type: "notification", text: "This is above your security clearance!", importance: 2}));
							}
							break;
					}
				}
			}catch(e){
				console.log("A message through the websocket almost killed the server! Message: ");
				console.log(message);
				console.log("Error: ");
				console.log(e);
				ws.sendUTF(JSON.stringify({type: "notification", text: "The last message through the websocket almost killed the server. Please take a look at the console.", importance: 2}));
			}
		});
	});
}

startServer();