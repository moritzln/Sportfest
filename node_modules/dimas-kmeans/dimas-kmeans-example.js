var kmeans = require('./dimas-kmeans')


var data = [
	[1,2],
	[2,1],
	[10,11],
	[12,13]
]


var clusters = kmeans.getClusters(data);


for (var i = 0; i < clusters.length; i++) {
	console.log('Cluster ' + i +1 );
	console.log('-----------------');
	console.log(clusters[i].data);
	console.log('')
};