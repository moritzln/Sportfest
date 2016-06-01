var students = [];
var clusters = [];
var courses = [];
var user;
var currentStudent;
var currentCluster;
var currentPageId = "home";
var ip = "localhost";
var number_of_results_per_discipline = 3;

//////////////////////////////////////////////////////////////////////////////////
//								Server-Connection								//
//////////////////////////////////////////////////////////////////////////////////
window.WebSocket = window.WebSocket || window.MozWebSocket;
if (!window.WebSocket) {
	notificate("This browser doesn't support websocket connections");
}
var connection = new ReconnectingWebSocket('ws://'+ip+':1998');
var vOpen = 0;
var vError = 0;
connection.onopen = function () {
	if(vOpen == 0){
		vOpen = 1;
		vError = 0;
	}
	$("#onlineBox").css("background-color", "#58E870");
	$("#onlineBox").text("Online");
	if(getCookie("MoachLogin") != ""){
		var string = getCookie("MoachLogin");
		var username = string.split(" ")[0];
		var password = string.split(" ")[1];
		login(username, password);
	}
};
connection.onerror = function (error) {
	if(vError == 0){
		/*var rand = Math.floor(Math.random() * (offline.length - 0));
		notificate("Connection interrupted", offline[rand], 2);*/
		vError = 1;
		vOpen = 0;
	}
	$("#onlineBox").css("background-color", "#E7162C");
	$("#onlineBox").text("Offline");
	$('#editor').hide("slide", {direction: "top"});
	$("#login").show("slide", {direction: "up"});
};

connection.onmessage = function (msg) {
	try {
		var message = JSON.parse(msg.data);
	} catch (e) {
		return;
	}
	switch(message.type){
		case "allStudents":
			students = message.students;
			//createList();
			break;
		case "student":
			students[message.sid] = message.student;
			break;
		case "clusters":
			clusters = message.clusters;
			var select = document.getElementById("clusterSelection");
			for(var c in clusters){
				var option = document.createElement("option");
				option.text = "Riege "+clusters[c].cid;
				option.value = clusters[c].cid;
				select.add(option);
				$('#clusterPar').append("Riege "+c+": "+clusters[c].length+"<br>");
				$('#clusterNum').text(clusters.length);
				var entry = "<div class='entry' onclick='openClusterEditor("+clusters[c].cid+");' data-cid='"+clusters[c].cid+"'><span class='imgCon' data-cid='"+clusters[c].cid+"'>"+clusters[c].cid+"</span><span class='listName'>"+clusters[c].length+" Sch&uuml;ler</span></div>";
				$('#clusterView').append(entry)
			}
			break;
		case "login":
			user = message.user;
			if(user.rights < 3){
				$('#adminMenu').hide();
			}
			page(currentPageId);
			$('#login').hide( "slide", { direction: "up" }, "slow" );
			document.cookie = "MoachLogin="+user.username+" "+user.password;
			break;
		case "notification":
			notify(message.text, message.importance);
			break;
		case "loginFailed":
			$('[name=password]').effect('shake', {'distance': '5'})
			break;
		case "courses":
			courses = message.courses;
			var select = document.getElementById('courseSelection');
			for(var c in message.courses){
				var option = document.createElement("option");
				option.text = c;
				option.value = c;
				select.add(option);
			}
			break;
	}
}
function transmitt(obj){
	connection.send(JSON.stringify( obj ));	
}


function createList(){
	$('#list').html('');
	for(var s in students){
		createEntry(students[s]);
	}
}
function createEntry(student){
	var complete = 0;
	if(Object.getOwnPropertyNames(student.results).length != 0){
		for(var r in student.results){
			if(student.results[r].length == number_of_results_per_discipline){
				for(var v in student.results[r]){
					if(student.results[r][v] != ""){
						complete++;
					}
				}
			}else{
				complete = 0;
			}
		}
	}else{
		complete = 0;
	}
	if(student.cluster == undefined){
		var cluster = "";
	}else{
		var cluster = student.cluster;
	}
	var entry = "<div class='entry' onclick='openEditor("+student.sid+");' data-sid='"+student.sid+"'><span class='imgCon' data-sid='"+student.sid+"'>"+cluster+"</span><span class='listName'>"+student.first_name+" "+student.last_name+"</span>"
	if(complete >= 3*number_of_results_per_discipline){
		entry += "<span class='icon entry-complete'>&#10004;</span>";
	}
	entry += "</div>";
	$('#list').append(entry)
}
function openEditor(sid){
	if(currentStudent != undefined){
		saveEntry();
	}
	currentStudent = sid;
	transmitt({type: "getStudent", sid: sid});
	window.setTimeout(function(){
		$('#studentFirstName').text(students[sid].first_name);
		$('#studentName').text(students[sid].last_name);
		$('#studentCourse').text(students[sid].course);
		$('#studentYear').text(students[sid].birthday);
		$('#studentPic').text(students[sid].cluster);
		$('#studentFirstName').attr('title', "Riege "+students[sid].cluster);
		$('#editor').show('slide', {direction: "top"});
		if(students[sid].disciplines != undefined){
			for(var d in students[sid].disciplines){
				if(students[sid].disciplines[d] == false){
					$("input[data-discipline='"+d+"']").attr("disabled", "disabled");
				}else{
					$("input[data-discipline='"+d+"']").removeAttr("disabled");
				}
			}
		}
		for(var d in students[sid].disciplines){
			var inputs = $('#results input[data-discipline='+d.toLowerCase()+']').toArray();
			for(var i in inputs){
				inputs[i].value = "";
			}
		}
		var results = students[sid].results;
		for(var r in results){
			var inputs = $('#results input[data-discipline='+r.toLowerCase()+']').toArray();
			for(var v in results[r]){
				inputs[v].value = results[r][v];
			}
		}
		var disciplines = students[sid].disciplines;
		for(var d in disciplines){
			if(disciplines[d] != false && disciplines[d] != true){
				var reqSpan = $('#results span.requirements[data-discipline='+d.toLowerCase()+']').toArray()[0];
				reqSpan.innerHTML = disciplines[d];
			}
		}
	}, 10);
}
function openClusterEditor(c){
	currentCluster = c;
	$('#clusterName').html("Riege "+clusters[c].cid);
	$('#clusterPic').text(clusters[c].cid);
	$('#clusterSize').html(clusters[c].length+" Sch&uuml;ler");
	if(clusters[c].leader != undefined){
		$('#clusterLeader').html(clusters[c].leader);
	}else{
		$('#clusterLeader').html("Kein Riegenf&uuml;hrer festgelegt");
	}
	var obj = {
		weitsprung: [0,0],
		hochsprung: [0,0],
		sprint: [0,0],
		weitwurf: [0,0],
		kugelstossen: [0,0]
	}
	for(var s in clusters[c].students){
		var student = students[clusters[c].students[s]];
		for(var d in student.disciplines){
			if(student.disciplines[d] != false){
				obj[d][0]++;
				if(student.results[d] != undefined){
					if(student.results[d].length == number_of_results_per_discipline){
						var counter = 0;
						for(var r in student.results[d]){
							if(student.results[d][r] != ""){
								counter++;
							}
						}
						if(counter == number_of_results_per_discipline){
							obj[d][1]++;
						}
					}
				}
			}
		}
	}
	var string = "";
	for(var o in obj){
		string += "<tr><td>"+capitalizeFirstLetter(o)+":</td><td>"+obj[o][1]+" von "+obj[o][0]+" fertig.</td></tr>";
	}
	var distanceLength = 0;
	for(var i in clusters[c].evaluation.distances){
		distanceLength++;
	}
	var ageLength = 0;
	for(var i in clusters[c].evaluation.ages){
		ageLength++;
	}
	var courseLength = 0;
	for(var i in clusters[c].evaluation.courses){
		courseLength++;
	}
	string += "<tr><td>"+distanceLength+" unterschiedliche Gruppe/n in dieser Riege</td></tr>";
	string += "<tr><td>"+ageLength+" unterschiedliche/s Alter in dieser Riege</td></tr>";
	string += "<tr><td>"+courseLength+" unterschiedliche Klasse/n in dieser Riege</td></tr>";
	string += "<tr><td>"+clusters[c].evaluation.genders.male+" Jungen und "+clusters[c].evaluation.genders.female+" M&auml;dchen in dieser Riege</td></tr>";
	string = string.replace("undefined", "0");
	function capitalizeFirstLetter(string) {
	    return string.charAt(0).toUpperCase() + string.slice(1);
	}
	$('#clusterProgress').html(string);
	$('#clusterEditor').show('slide', {direction: "top"});
}
function saveCluster(){
	if($('#clusterLeader').attr('contenteditable') == "true"){
		var cid = currentCluster;
		clusters[cid].leader = $('#clusterLeader').text();
		transmitt({type: "saveCluster", cluster: clusters[cid]});
		$('#clusterLeader').attr('contenteditable', 'false');
	}
}
function saveEntry(){
	var sid = currentStudent;
	var student = students[sid];
	student.first_name = $('#studentFirstName').text();
	student.last_name = $('#studentName').text();
	student.birthday = $('#studentYear').text();
	student.course = $('#studentCourse').text();
	student.cluster = $('#studentPic').text();
	if(student.results == undefined){
		student.results = {};
	}
	for(var d in student.disciplines){
		if(student.disciplines[d] != false){
			student.results[d] = [];
			var inputs = $('#results input[data-discipline='+d.toLowerCase()+']').toArray();
			for(var i in inputs){
				student.results[d].push(inputs[i].value);
			}
		}
	}
	students[student.sid] = student;
	transmitt({type: "saveStudent", student: student})
	$('#studentPic').attr('contenteditable', 'false');
	$('#studentFirstName').attr('contenteditable', 'false');
	$('#studentName').attr('contenteditable', 'false');
	$('#studentCourse').attr('contenteditable', 'false');
	$('#studentYear').attr('contenteditable', 'false');
}

function editInfos(){
	$('#studentPic').attr('contenteditable', 'true');
	$('#studentFirstName').attr('contenteditable', 'true');
	$('#studentName').attr('contenteditable', 'true');
	$('#studentCourse').attr('contenteditable', 'true');
	$('#studentYear').attr('contenteditable', 'true');
}
var notificationCounter = 0;
function notify(msg, importance, color){
	var notification = "<div id='notification"+notificationCounter+"' class='notification";
	var notC = notificationCounter;
	if(importance != undefined && importance > 3){
		notification += "important";	
	}		
	notification += "'><span>"+msg+"</span></div>";
	$('#notifications').append(notification);
	switch(importance){
		case 0:
			var time = 2000;
			break;
		case 1:
			var time = 5000;
			break;
		case 2:
			var time = 10000;
			break;
		case 3:
			var time = 9999999999;
			break;
	}
	window.setTimeout(function(){
		$('#notification'+notC).fadeOut(function(){
		$('#notification'+notC).remove();});
	},time);
	notificationCounter++;
	return notificationCounter-1;
}

function filterByName(str){
	if(str != true){
		str = str.split(" ");
		for(var s in students){
			if(students[s] != undefined){
				var hide = -1;
				for(var st in str){
					if((students[s].first_name.toLowerCase().search(str[st].toLowerCase()) != -1 || students[s].last_name.toLowerCase().search(str[st].toLowerCase()) != -1) && hide != 1){
						hide = 0;
					}else{
						hide = 1;
					}
				}
				if(hide == 1){
					$("[data-sid='"+students[s].sid+"']").hide();
				}else if(hide == 0){
					$("[data-sid='"+students[s].sid+"']").show();
				}
			}
		}
	}else{
		for(var s in students){
			$("[data-sid='"+students[s].sid+"']").show();
		}
	}
}
function filterByCluster(cluster){
	if(cluster != "all"){
		for(var s in students){
			if(students[s] != undefined){
				var hide = 1;
				if(students[s].cluster == cluster){
					hide = 0;
				}
				if(hide == 1){
					$("[data-sid='"+students[s].sid+"']").hide();
				}else{
					$("[data-sid='"+students[s].sid+"']").show();
				}
			}
		}
	}else{
		for(var s in students){
			$("[data-sid='"+students[s].sid+"']").show();
		}
	}
}

function page(id){
	if(id == "listView"){
		createList();
		filterByCluster($('#clusterSelection').val());
	}
	$('#'+currentPageId).hide();
	currentPageId = id;
	$('#'+id).show();
	if($('#navButton').css('display') == "block"){
		$('nav').css('left', '-300px')
	}
}

function login(username, password){
	if(username==undefined && password == undefined){
		var username = $("[name='username']").val();
		var password = md5($("[name='password']").val());
	}
	transmitt({type: "login", username: username, password: password});
	$('[name=password]').val('Passwort');
}

function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for(var i=0; i<ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1);
        if (c.indexOf(name) == 0) return c.substring(name.length,c.length);
    }
    return "";
}
function delete_cookie( name ) {
  document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
}

function logout(){
	transmitt({type: "logout"});
	students = [];
	user = [];
	clusters = [];
	createList();
	delete_cookie("MoachLogin");
	$('[name=password]').val('Passwort');
	$('#editor').hide("slide", {direction: "top"});
	$('#userEditor').hide("slide", {direction: "top"});
	$('#clusterEditor').hide("slide", {direction: "top"});
	$("#login").show("slide", {direction: "up"});
}

function new_user(){
	var username = $("[name='newUsername']").val();
	var password = md5($("[name='newPassword']").val());
	var rights = $("[name='newRights']").val();
	var clusters = "all";
	var obj = {type: "createUser", username: username, password: password, rights: rights, clusters: clusters};
	transmitt(obj);
	$('#userEditor').hide('slide', {direction: 'top'});
}

function enter(event, callback){
	console.log("Enter?");
    var keypressed = event.keyCode || event.which;
    if (keypressed == 13) {
    	console.log("ENTER");
        callback();
    }
}