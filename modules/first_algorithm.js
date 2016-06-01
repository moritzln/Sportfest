/*
	obj = Object to cluster,
	k = number of clusters,
	min = minimum number of vertices per cluster,
	accuracy = 
*/

function cluster(obj, k, min, accuracy, weight, store){
	var count = obj.length;
	var centers = [];
	var clusters = [[]];
	centers[0] = obj[0];
	var spec = [];
	var dist = -1;
	var finished = 0;
	return start_clustering();
	function start_clustering(){
		centers = [];
		clusters = [[]];
		centers[0] = obj[0];
		spec = [];
		dist = -1;
		console.log("Clustering: Starting with "+k+" Clusters")
		for(var i=1; i<k; i++){
			centers.push(getCenter(obj,centers));
			clusters.push([]);
		}
		console.log("Trying to find clusters");
		findClusters();
		if(finished == 1){
			var sum = 0;
			var num = 0;
			var big = clusters[0].length;
			var small = clusters[0].length;
			var too_small = [];
			function check(){
				for(var c in clusters){
					if(clusters[c].length > 1.5*count/k){
						var i = 1;
						var oc = [];
						while(i <= Math.round(clusters[c].length/(count/k))){
							var nc = clusters[c].slice(Math.ceil((i-1)/Math.round(clusters[c].length/(count/k))*clusters[c].length), Math.ceil((i)/Math.round(clusters[c].length/(count/k))*clusters[c].length));
							if(i == 1){
								oc = nc;
							}else{
								var id = clusters.push(nc);
								for(var sid of nc){
									store.students[sid].cluster = id.toString();
								}
							}
							i++;
						}
						clusters[c] = oc;
						for(var sid of oc){
							store.students[sid].cluster = c.toString();
						}
					}
					if(clusters[c].length < min || clusters[c].length == 0){
						too_small = too_small.concat(clusters[c]);
						delete clusters[c];
					}
				}
			}
			var tsid = clusters.push(too_small);
			check();
			for(var sid in too_small){
				store.students[sid].cluster = tsid;
			}
			for(var c in clusters){
				sum += clusters[c].length;
				if(clusters[c].length != 0){
					//console.log(clusters[c].length);
					num++;
					if(clusters[c].length > big){
						big = clusters[c].length;
					}
					if(clusters[c].length < small){
						small = clusters[c].length;
					}
				}
			}
			var cluster_ids = [];
			for(var s of store.students){
				if(cluster_ids.indexOf(s.cluster) == -1){
					cluster_ids.push(s.cluster);
				}
			}
			cluster_ids.sort(function(a,b){if(isNaN(a)){a = parseInt(a)}if(isNaN(b)){b = parseInt(b)} return a-b;});
			store.clusters = [];
			for(var c in cluster_ids){
				store.clusters.push({number: c, count: 0});
			}
			for(var s of store.students){
				s.cluster = cluster_ids.indexOf(s.cluster);
				store.clusters[s.cluster].count += 1;
			}
			console.log(sum+" students clustered. "+num+" clusters needed. Average size: "+Math.round(sum/num)+"; Biggest cluster: "+big+"; Smallest cluster: "+small);
			return clusters;
		}
	}
	function findClusters(){
		for(var o in obj){
			var dist = [];
			for(var c of centers){
				dist.push(getDistance(c, obj[o]));
			}
			obj[o].dist = dist;
			obj[o].cluster = -1;
			var index = minId(dist);
			if(minVal(dist)>accuracy){
				k += 1;
				setTimeout(start_clustering, 0);
				return;
			}
			if(obj[o].sid != undefined){
				clusters[index].push(obj[o].sid);
			}else{
				clusters[index].push(obj[o])
			}
			obj[o].cluster = index;
			delete obj[o].dist;
		}
		finished = 1;
	}
	function getCenter(obj, centers){
		spec = [];
		for(o of obj){
			dist = -1;
			for(c of centers){
				if(dist == -1){
					dist = getDistance(c, o);
				}else{
					dist = dist*getDistance(c, o);
				}
			}
			spec[o.sid] = dist;
		}
		var center = maxId(spec);
		return obj[center];
	}
	function getDistance(obj1, obj2){
		if(obj1 != undefined && obj2 != undefined){
			var vec1 = [],
				vec2 = [],
				res = [];
			var len = 0;
			for(var w of weight){
				vec1.push(obj1[w.name]*w.weight);
				vec2.push(obj2[w.name]*w.weight);
			}
			for(var v in vec1){
				res.push(vec2[v]-vec1[v]);
			}
			for(var r of res){
				len += Math.pow(r, 2);
			}
			len = Math.sqrt(len);
			return len;
		}else{
			//obj1==undefined? console.log("obj1 is undefined"):console.log("obj2 is undefined");
		}
	}
	function maxId(numArray) {
		var b = 0;
		var bid;
		for(n in numArray){
			if(numArray[n] > b){
				b = numArray[n];
				bid = n;
			}
		}
		return bid;
	}
	function minId(numArray) {
		var t = numArray[0];
		var tid = 0;
		for(n in numArray){
			if(numArray[n] < t){
				t = numArray[n];
				tid = n;
			}
		}
		return tid;
	}
	function maxVal(numArray) {
		var b = 0;
		for(n in numArray){
			if(numArray[n] > b){
				b = numArray[n];
			}
		}
		return b;
	}
	function minVal(numArray) {
		var t = numArray[0];
		for(n in numArray){
			if(numArray[n] < t){
				t = numArray[n];
			}
		}
		return t;
	}
}

module.exports = cluster;