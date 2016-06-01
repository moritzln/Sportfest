var k = 30;
var max_cluster_length = 25;
var min_cluster_length = 10;

function cluster(students){
	console.log("Going to cluster");
	var clusters = [];
	var clustered = [];
	var centers = [];
	var n = students.length/k;
	centers[0] = students[0];
	var std = students.length;
	var possible_centers = [];
	var i = true;
	var c = 0;
	for(s of students){
		s.cluster = -1;
	}
	while(i == true){
		possible_centers = [];
		clusters[c] = [];
		for(var s of students){
			if(getDistance(s, centers[c]) == 0 && clustered.indexOf(s.sid) == -1){
				clusters[c].push(s.sid);
				clustered.push(s.sid);
				std--;
			}else if(clustered.indexOf(s.sid) == -1){
				possible_centers.push(s);
			}
		}
		if(std > 0){
			centers.push(possible_centers[0]);
			c++;
		}else{
			i = false;
		}
	}
	var clusters1 = [];
	for(var cl in clusters){
		var obj = {
			cid: cl,
			length: clusters[cl].length,
			students: clusters[cl]
		}
		clusters1.push(obj);
	}
	return cluster_size(clusters1);
}
function cluster_size(clusters){
	var ideal = 0;
	var total_length = 0;
	function pushCluster(length, students){
		clusters.push({
			cid: clusters.length,
			length: length,
			students: students
		})
	}
	while(ideal < 1){
		ideal = 1.5;
		var mergeCluster = {
			length: 0,
			students: []
		}
		for(var c in clusters){
			var cl = clusters[c];
			if(cl.length > max_cluster_length){
				ideal = 0;
				var desired_length = Math.floor(cl.length / Math.ceil((cl.length / max_cluster_length)));
				var new_students = clusters[c].students.splice(0, desired_length);
				cl.length = cl.students.length;
				pushCluster(new_students.length, new_students)
			}else if(cl.length < min_cluster_length){
				mergeCluster.length += cl.length;
				mergeCluster.students = mergeCluster.students.concat(cl.students);
				clusters.splice(c,1);
				ideal -= 0.5;
			}

			if(mergeCluster.length > min_cluster_length){
				pushCluster(mergeCluster.length, mergeCluster.students);
				mergeCluster = {
					length: 0,
					students: []
				}
			}
		}
		if(mergeCluster.length != 0){
			pushCluster(mergeCluster.length, mergeCluster.students);
			mergeCluster = {
				length: 0,
				students: []
			}
		}
	}
	for(var c in clusters){
		var cl = clusters[c];
		if(cl.cid != c){
			clusters[c].cid = c;
		}
		for(var s of cl.students){
			global.store.students[s].cluster = cl.cid;
			total_length++;
		}
	}
	console.log(total_length);
	return clusters;
}

global.getDistance = function(student1, student2){
	var weight = {
		age: 1,
		disciplines: 1
	};
	var distances = [];
	distances.push(Math.abs(student1.age-student2.age));
	var disciplineDist = 0;
	for(var d in student1.disciplines){
		if(student2.disciplines[d] == undefined || student2.disciplines[d] != student1.disciplines[d]){
			disciplineDist += 1/9;
		}
	}
	distances.push(weight.disciplines*disciplineDist);
	var length = 0;
	for(var d of distances){
		length += Math.pow(d, 2);
	}
	length = Math.sqrt(length);
	return length;
}

module.exports = cluster;