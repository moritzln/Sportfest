"use strict";

class Tournament{
	constructor(obj){
		this.title = obj.title;
		this.date = new Date(store.settings.date);
		this.location = obj.location;
		this.certificateTEX = obj.certificateTEX;
		this.cluster_size = obj.cluster_size;
		if(obj.clusters != undefined && obj.clusters != []){
			this.clusters = obj.clusters;
		}else{
			this.clusters = [];
		}
		this.courses = {};
		for(var s of global.store.students){
			if(this.courses[s.course] == undefined){
				this.courses[s.course] = [];
			}
			this.courses[s.course].push(s.sid);
		}
	}
	cluster(students){
		this.clusters = require("./cluster1.js")(students);
	}
	getWinner(students){
		var best = {};
		for(var s of students){
			var year;
			if(global.store.settings.years_or_days == "years"){
				year = parseInt(s.birthday.slice(-4))
			}else if(global.store.settings.years_or_days == "days"){
				year = s.age;
			}
		}
	}
	changeCluster(sid, newCluster){
		var oldCluster = global.store.students[sid].cluster;
		this.clusters[oldCluster].length--;
		var index = this.clusters[oldCluster].students.indexOf(sid);
		this.clusters[oldCluster].students.splice(index, 1);
		this.clusters[newCluster].students.push(sid);
		this.clusters[newCluster].length++;
		global.store.students[sid].cluster = newCluster;
		this.clusters[oldCluster].evaluation = this.evaluateCluster(this.clusters[oldCluster]);
		this.clusters[newCluster].evaluation = this.evaluateCluster(this.clusters[newCluster]);
	}
	evaluateCluster(cluster){
		var genders = {};
		var ages = {};
		var courses = {};
		var grades = {};
		var dist = {};
		var firstStudent = global.store.students[cluster.students[0]];
		for(var s of cluster.students){
			var student = global.store.students[s];
			if(genders[student.gender.toString()] != undefined){
				genders[student.gender.toString()]++;
			}else{
				genders[student.gender.toString()] = 1;
			}
			if(ages[student.age.toString()] != undefined){
				ages[student.age.toString()]++;
			}else{
				ages[student.age.toString()] = 1;
			}
			if(courses[student.course.toString()] != undefined){
				courses[student.course.toString()]++;
			}else{
				courses[student.course.toString()] = 1;
			}
			if(grades[student.grade.toString()] != undefined){
				grades[student.grade.toString()]++;
			}else{
				grades[student.grade.toString()] = 1;
			}
			var distance = getDistance(student, firstStudent);
			if(dist[distance.toString()] != undefined){
				dist[distance.toString()]++;
			}else{
				dist[distance.toString()] = 1;
			}
		}
		return {genders: genders, ages: ages, courses: courses, grades: grades, distances: dist};
	}
}

class Spot{
	constructor(obj){
		this.name = obj.name;
		this.type = obj.type;
	}
}

class Sport{
	constuctor(obj){
		this.name = obj.name;
		this.spotType = obj.spotType;
	}
}

class Cluster{
	constructor(){

	}
}

module.exports = Tournament;