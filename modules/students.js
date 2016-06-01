"use strict";

var table = require("../sportabzeichen.json");

class Student{
	constructor(obj){
		this.sid = obj.sid;
		this.first_name = obj.first_name;
		this.last_name = obj.last_name;
		var dateReg = /\d{1,2}(\.|-)\d{1,2}(\.|-)\d{2,4}/gi;
		if(dateReg.exec(obj.birthday)!= null){
			this.birthday = obj.birthday;
		}else{
			this.birthday = /[1,2](0|9|8)[0-9]{2}/gi.exec(obj.birthday);
		}
		if(obj.course != undefined && obj.course != ""){
			this.course = obj.course;
		}else{
			this.course = this.simulate_course();
		}
		var gradeReg = /[0-9]*/gi;
		this.grade = parseInt(gradeReg.exec(this.course)[0]);
		this.gender = obj.gender;
		if(this.gender.substr(0,1) == "m"){
			this.gender = "male";
		}else if(this.gender == "weiblich"){
			this.gender = "female";
		}
		this.disciplines = {};
		this.results = obj.results;
		if(this.results == undefined){
			this.results = {};
		}
		this.cluster = obj.cluster;
		this.age = this.getAge;
		//this.simulate_disciplines();
		for(var d of table.disciplines){
			var max_course = d.max_course;
			var min_course = d.min_course;
			var obligatory_not = d.obligatory_not;
			d = d.name;
			if(obj.disciplines[d.toLowerCase()] != undefined){
				this.disciplines[d.toLowerCase()] = obj.disciplines[d.toLowerCase()];
			}
			if(this.disciplines[d.toLowerCase()] != false){
				var age = this.age;
				var gender = this.gender;
				if(table[gender] != undefined && table[gender][age.toString()] != undefined && table[gender][age.toString()][d.toLowerCase()] != undefined){
					this.disciplines[d.toLowerCase()] = table[gender][age.toString()][d.toLowerCase()].req;
					if(obligatory_not != undefined && obligatory_not.indexOf(this.grade) != -1){
						this.disciplines[d.toLowerCase()] = false;
					}
					if(this.disciplines[d.toLowerCase()] == undefined){
						this.disciplines[d.toLowerCase()] = true;
					}
					if(this.grade > max_course){
						this.disciplines[d.toLowerCase()] = false;
					}
					if(this.grade < min_course){
						this.disciplines[d.toLowerCase()] = false;
					}
					if((this.disciplines.weitsprung == false && this.disciplines.hochsprung == false) || (this.disciplines.weitsprung == true && this.disciplines.hochsprung == true)){
						this.disciplines.weitsprung = true;
						this.disciplines.weitsprung = false;
					}
				}else{
					console.log(gender, age, d);
				}
			}
		}
	}
	simulate_disciplines(){
		if(this.disciplines.weitwurf == undefined || this.disciplines.kugelstossen == undefined){
			var rand = Math.random();
			if(this.birthday > 2001 || rand < 0.5){																		//!!!!!!!! SAVE 2001 in file...
				this.disciplines.kugelstossen = false;
			}else{
				this.disciplines.weitwurf = false;
			}
		}
	}
	get getAge(){
		var arr = this.birthday.split(".");
		if(arr.length > 1){
			var day = arr[0];
			var month = arr[1];
			var year = arr[2];
		}else{
			var year = this.birthday;
		}
		var diff = new Date(store.settings.date)-new Date(year, month, day);
		var years = Math.floor(diff / (86400000*365.2422));
		return years;
	}
	day(){
		var age = this.age;
		function weightedRand2(spec) {
		  var i, sum=0, r=Math.random();
		  for (i in spec) {
		    sum += spec[i];
		    if (r <= sum) return i;
		  }
		}
		var class1 = age-6;
		var class2 = age-7;
		var next_class = age-5;
		var rep_class = age-8;
		var obj = {};
		obj[class1.toString()] = 0.7;
		obj[class2.toString()] = 0.275;
		obj[next_class.toString()] = 0.01;
		obj[rep_class.toString()] = 0.015;
		var grade = weightedRand2(obj);
		var letter = "";
		if(parseInt(grade)<11){
			letter = weightedRand2({a:0.21, b:0.21, c:0.21, d:0.21, e:0.16})
		}
		return grade+letter;
	}
	calculate_points(){
		
	}
	generateCertificate(certificateTEX){
		fs.readFile(certificateTEX, 'utf8', function(err, contents) {
			if(err){
				console.log(err);
			}
			contents = contents.replace(/%name%/gi, student.first_name+" "+student.last_name);
			var writerStream = fs.createWriteStream('certificates/'+student.sid+".pdf");

			require("latex")([contents]).pipe(writerStream);
		});
	}
}

module.exports = Student;


/*var table = {
	"male": {
		10:{
			"weitwurf": {
				req: "80g",
				b: 21,
				s: 25,
				g: 28
			},
			"sprint": {
				req: "50m",
				b: 11.0,
				s: 10.0,
				g: 9.1
			},
			"hochsprung": {
				b: 0.85,
				s: 0.95,
				g: 1.05
			},
			"weitsprung": {
				b: 2.6,
				s: 2.9,
				g: 3.2
			}
		},
		11:{
			"weitwurf": {
				req: "80g",
				b: 21,
				s: 25,
				g: 28
			},
			"sprint": {
				req: "50m",
				b: 11.0,
				s: 10.0,
				g: 9.1
			},
			"hochsprung": {
				b: 0.85,
				s: 0.95,
				g: 1.05
			},
			"weitsprung": {
				b: 2.6,
				s: 2.9,
				g: 3.2
			}
		},
		12:{
			"weitwurf": {
				req: "200g",
				b: 26,
				s: 30,
				g: 33
			},
			"kugelstossen": {
				req: "3kg",
				b: 6.25,
				s: 6.75,
				g: 7.25
			},
			"sprint": {
				req: "50m",
				b: 10.4,
				s: 9.6,
				g: 8.8
			},
			"hochsprung": {
				b: 0.95,
				s: 1.05,
				g: 1.15
			},
			"weitsprung": {
				b: 3.2,
				s: 3.5,
				g: 3.8
			}
		},
		13:{
			"weitwurf": {
				req: "200g",
				b: 26,
				s: 30,
				g: 33
			},
			"kugelstossen": {
				req: "3kg",
				b: 6.25,
				s: 6.75,
				g: 7.25
			},
			"sprint": {
				req: "50m",
				b: 10.4,
				s: 9.6,
				g: 8.8
			},
			"hochsprung": {
				b: 0.95,
				s: 1.05,
				g: 1.15
			},
			"weitsprung": {
				b: 3.2,
				s: 3.5,
				g: 3.8
			}
		},
		14:{
			"weitwurf": {
				req: "200g",
				b: 30,
				s: 34,
				g: 37
			},
			"kugelstossen": {
				req: "4kg",
				b: 7,
				s: 7.5,
				g: 8
			},
			"sprint": {
				req: "100m",
				b: 16.3,
				s: 15.0,
				g: 13.6
			},
			"hochsprung": {
				b: 1.1,
				s: 1.2,
				g: 1.3
			},
			"weitsprung": {
				b: 3.8,
				s: 4.1,
				g: 4.4
			}
		},
		15:{
			"weitwurf": {
				req: "200g",
				b: 30,
				s: 34,
				g: 37
			},
			"kugelstossen": {
				req: "4kg",
				b: 7,
				s: 7.5,
				g: 8
			},
			"sprint": {
				req: "100m",
				b: 16.3,
				s: 15.0,
				g: 13.6
			},
			"hochsprung": {
				b: 1.1,
				s: 1.2,
				g: 1.3
			},
			"weitsprung": {
				b: 3.8,
				s: 4.1,
				g: 4.4
			}
		},
		16:{
			"weitwurf": {
				req: "200g",
				b: 32,
				s: 36,
				g: 40
			},
			"kugelstossen": {
				req: "5kg",
				b: 7.5,
				s: 8,
				g: 8.5
			},
			"sprint": {
				req: "100m",
				b: 15.3,
				s: 14.1,
				g: 12.9
			},
			"hochsprung": {
				b: 1.2,
				s: 1.3,
				g: 1.4
			},
			"weitsprung": {
				b: 4.3,
				s: 4.6,
				g: 4.9
			}
		},
		17:{
			"weitwurf": {
				req: "200g",
				b: 32,
				s: 36,
				g: 40
			},
			"kugelstossen": {
				req: "5kg",
				b: 7.5,
				s: 8,
				g: 8.5
			},
			"sprint": {
				req: "100m",
				b: 15.3,
				s: 14.1,
				g: 12.9
			},
			"hochsprung": {
				b: 1.2,
				s: 1.3,
				g: 1.4
			},
			"weitsprung": {
				b: 4.3,
				s: 4.6,
				g: 4.9
			}
		},
		"female": {
		10:{
			"weitwurf": {
				req: "80g",
				b: 11,
				s: 15,
				g: 18
			},
			"sprint": {
				req: "50m",
				b: 11.2,
				s: 10.3,
				g: 9.3
			},
			"hochsprung": {
				b: 0.8,
				s: 0.9,
				g: 1.0
			},
			"weitsprung": {
				b: 2.3,
				s: 2.6,
				g: 2.9
			}
		},
		11:{
			"weitwurf": {
				req: "80g",
				b: 11,
				s: 15,
				g: 18
			},
			"sprint": {
				req: "50m",
				b: 11.2,
				s: 10.3,
				g: 9.3
			},
			"hochsprung": {
				b: 0.8,
				s: 0.9,
				g: 1.0
			},
			"weitsprung": {
				b: 2.3,
				s: 2.6,
				g: 2.9
			}
		},
		12:{
			"weitwurf": {
				req: "200g",
				b: 16,
				s: 19,
				g: 23
			},
			"kugelstossen": {
				req: "3kg",
				b: 4.75,
				s: 5.25,
				g: 5.75
			},
			"sprint": {
				req: "50m",
				b: 10.6,
				s: 9.8,
				g: 9.0
			},
			"hochsprung": {
				b: 0.9,
				s: 1.0,
				g: 1.10
			},
			"weitsprung": {
				b: 2.8,
				s: 3.1,
				g: 3.4
			}
		},
		13:{
			"weitwurf": {
				req: "200g",
				b: 16,
				s: 19,
				g: 23
			},
			"kugelstossen": {
				req: "3kg",
				b: 4.75,
				s: 5.25,
				g: 5.75
			},
			"sprint": {
				req: "50m",
				b: 10.6,
				s: 9.8,
				g: 9.0
			},
			"hochsprung": {
				b: 0.9,
				s: 1.0,
				g: 1.10
			},
			"weitsprung": {
				b: 2.8,
				s: 3.1,
				g: 3.4
			}
		},
		14:{
			"weitwurf": {
				req: "200g",
				b: 20,
				s: 24,
				g: 27
			},
			"kugelstossen": {
				req: "3kg",
				b: 5.5,
				s: 6,
				g: 6.5
			},
			"sprint": {
				req: "100m",
				b: 18.1,
				s: 16.5,
				g: 14.9
			},
			"hochsprung": {
				b: 0.95,
				s: 1.05,
				g: 1.15
			},
			"weitsprung": {
				b: 3.2,
				s: 3.5,
				g: 3.8
			}
		},
		15:{
			{
			"weitwurf": {
				req: "200g",
				b: 20,
				s: 24,
				g: 27
			},
			"kugelstossen": {
				req: "3kg",
				b: 5.5,
				s: 6,
				g: 6.5
			},
			"sprint": {
				req: "100m",
				b: 18.1,
				s: 16.5,
				g: 14.9
			},
			"hochsprung": {
				b: 0.95,
				s: 1.05,
				g: 1.15
			},
			"weitsprung": {
				b: 3.2,
				s: 3.5,
				g: 3.8
			}
		},
		16:{
			"weitwurf": {
				req: "200g",
				b: 24,
				s: 27,
				g: 32
			},
			"kugelstossen": {
				req: "3kg",
				b: 5.75,
				s: 6.25,
				g: 6.75
			},
			"sprint": {
				req: "100m",
				b: 17.1,
				s: 15.8,
				g: 14.5
			},
			"hochsprung": {
				b: 1.05,
				s: 1.15,
				g: 1.25
			},
			"weitsprung": {
				b: 3.4,
				s: 3.7,
				g: 4
			}
		},
		17:{
			"weitwurf": {
				req: "200g",
				b: 24,
				s: 27,
				g: 32
			},
			"kugelstossen": {
				req: "3kg",
				b: 5.75,
				s: 6.25,
				g: 6.75
			},
			"sprint": {
				req: "100m",
				b: 17.1,
				s: 15.8,
				g: 14.5
			},
			"hochsprung": {
				b: 1.05,
				s: 1.15,
				g: 1.25
			},
			"weitsprung": {
				b: 3.4,
				s: 3.7,
				g: 4
			}
		}
	}
}


/* OLD

var wordVals = ["Hochsprung", "Weitsprung", "Kugelstossen"]
createVec(weight, obj) {
		if(obj == undefined){
			var obj = this;
		}
		var vec = [];
		for(var w in weight){
			if(obj[w] != undefined){
				if(typeof(weight[w]) != "object"){
					if(typeof(obj[w]) == "number" && w != "birthday"){
						var x = obj[w];
					}else if(w == "birthday"){
						var x = new Date().getFullYear()-this.year;
					}else if(typeof(obj[w]) == "string"){
						var course_pattern = /([5-9]{1}|10)[a-e]/g;
						if(course_pattern.test(obj[w])){
							var x = parseInt(obj[w].substr(0,obj[w].length))*10;
				    		if(obj[w].charCodeAt(obj[w].length-1) >= 97){
				    			x += (obj[w].charCodeAt(obj[w].length-1)-97);
				    		}
						}
						else if(wordVals.indexOf(obj[w]) != -1){
							var x = wordVals.indexOf(obj[w]);
						}
					}
					while(x>100){
						x /= 10;
					}
					x = Math.round(x*10000)/10000;
					vec.push(x*weight[w]);
				}else{
					vec = vec.concat(this.createVec(weight[w], obj[w]));
				}
			}else{
				console.log("Weight property "+w+" does not exist in "+obj)
			}
		}
		return vec;
	}

	*/