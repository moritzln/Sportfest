var jsonfile = require("jsonfile");
var fs = require("fs");

var store_file = "./db/store.json";
var students_file = "./Data.csv";
var table = require("../sportabzeichen.json");

try{
	var store = jsonfile.readFileSync(store_file);
	global.store = store;
	for(var s in store.students){
		store.students[s] = new global.Student(store.students[s]);
	}
}catch(e){
	console.log(e);
	console.log("Store_file will be overwritten in 3 seconds. If you wanna save it kill the script!");
	store = {
		students: [],
		currentId: 0,
		users: [],
		tournaments: []
	};
	setTimeout(function(){store.importCSV(students_file)}, 3000)
}
if(typeof(store.students) == "undefined"){
	store = {
		students: [],
		currentId: 0,
		users: [],
		tournaments: []
	}
}
var standard_user = {"username": "Moritz", "password": "ae4626dceea083039516c1601acef530", rights: 42, clusters: "all"};
if(store.users.length == 0 || store.users[0].username != "Moritz"){
	store.users.push(standard_user);
}

store.settings = jsonfile.readFileSync("./settings.json");

function saveDatabase(store){
	jsonfile.writeFile(store_file, store, function (err) {
	});
}
setInterval(function(){saveDatabase(global.store)}, 3000);

store.export_csv = function(){
	var str = "Nachname;Vorname;Klasse;Geschlecht;Geburtsdatum;Hochsprung;Weitsprung;Riege;";
	for(var d of table.disciplines){
		var i = 1;
		while(i <= store.settings.attempts_per_discipline){
			str += d.name+" "+i.toString()+";"
			i++;
		}
	}
	str += "\r\n";
	for(var s of store.students){
		str += s.last_name+";"+s.first_name+";"+s.course+";"+s.gender+";"+s.birthday+";";
		if(s.disciplines.hochsprung != false){
			str += "X;;";
		}else if(s.disciplines.weitsprung != false){
			str += ";X;";
		}
		str += s.cluster+";";
		for(var d of table.disciplines){
			if(s.results != undefined && s.results[d.name.toLowerCase()] != undefined){
				var i = 0;
				while(i < store.settings.attempts_per_discipline){
					if(s.results[d.name.toLowerCase()][i] != "" && s.results[d.name.toLowerCase()][i] != undefined){
						str += s.results[d.name.toLowerCase()][i]+d.unit+";";
					}else{
						str += ";";
					}
					i++;
				}
			}else{
				var i = 0;
				while(i < store.settings.attempts_per_discipline){
					str += ";";
					i++;
				}
			}
		}
		str += "\r\n";
	}
	fs.writeFile('CSV/'+Date.now()+".csv", str, 'utf8', function(err){});
}
setInterval(function(){store.export_csv()}, 300000);

store.export_course = function(course){
	var str = "Nachname;Vorname;Klasse;Geschlecht;Geburtsdatum;Riege;";
	for(var d of table.disciplines){
		var i = 1;
		while(i <= store.settings.attempts_per_discipline){
			str += d.name+" "+i.toString()+";"
			i++;
		}
	}
	str += "\r\n";
	for(var s of store.students){
		if(s.course == course){
			str += s.last_name+";"+s.first_name+";"+s.course+";"+s.gender+";"+s.birthday+";"+s.cluster+";";
			for(var d of table.disciplines){
				if(s.results != undefined && s.results[d.name.toLowerCase()] != undefined){
					var i = 0;
					while(i < store.settings.attempts_per_discipline){
						if(s.results[d.name.toLowerCase()][i] != "" && s.results[d.name.toLowerCase()][i] != undefined){
							str += s.results[d.name.toLowerCase()][i]+d.unit+";";
						}else{
							str += ";";
						}
						i++;
					}
				}else{
					var i = 0;
					while(i < store.settings.attempts_per_discipline){
						str += ";";
						i++;
					}
				}
			}
			str += "\r\n";
		}
	}
	if (!fs.existsSync("./Courses/"+course)){
	    fs.mkdirSync("./Courses/"+course);
	}
	fs.writeFile('./Courses/'+course+'/'+Date.now()+".csv", str, 'utf8', function(err){});
}

store.findStudent = function(stud){
	studentLoop:
	for(var s of store.students){
		for(var a in stud){
			if(s[a] != stud[a]){
				continue studentLoop;
			}
		}
		return s.sid;
	}
	return false;
}
store.insertStudent = function(student){
	//if(store.findStudent({first_name: student.first_name, last_name: student.last_name}) == false){
		student.sid = store.currentId;
		store.students.push(student);
		store.currentId++;
	/*}else{
		return false;
	}*/
}
store.importCSV = function(students_file){
	console.log("Importing from "+students_file);
	fs.readFile(students_file, 'utf8', function(err, contents) {
	    var rows = contents.split("\r\n");
	    for(var r in rows){
	    	if(r != 0 && rows[r] != '' && rows[r] != undefined){
		    	var columns = rows[r].split(";");
		    	var student = {
	    			first_name: columns[1],
	    			last_name: columns[0],
	    			birthday: columns[4],
		    		gender: columns[3],
		    		course: columns[2],
		    		disciplines: {},
		    		results: {}
	    		};
	    		if(columns[5] == "X" || columns[5] == "x"){
	    			student.disciplines.weitsprung = false;
	    		}else if(columns[6] == "X" || columns[6] == "x"){
	    			student.disciplines.hochsprung = false;
	    		}
	    		student = new Student(student);
	    		store.insertStudent(student);
	    	}
	    }
	});
}

store.createUser = function(username, password, rights, clusters, ws){
	if(clusters == undefined){
		var clusters = "all";
	}
	console.log("New user");
	var ok = 1;
	for(var u of store.users){
		if(u.username == username){
			ok = 0;
		}
	}
	if(ok == 1){
		global.store.users.push({username: username, password: password, rights: rights, clusters: clusters});
		var notific = "Benutzer "+username+ " wurde erstellt!"
	}else{
		var notific = "Der Benutzername existiert bereits!";
	}
	ws.sendUTF(JSON.stringify({type: "notification", text: notific, importance: 2}));
}

store.reset = function(){
	store.students = [];
	store.currentId = 0;
}

module.exports = store;