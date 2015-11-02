var Heap = require("collections/heap");
var fs = require('fs')

function loadFile(cb) {
	fs.readFile('test2.txt', 'utf8', function (err, data) {
	  if (err) throw err;
	  var rows = data.split(/\n/);
	  var circuits = []
	  var jugglers = []
	  rows.forEach(function(row) {
	  	if(row.trim().length === 0) return;
	  	if(row[0] === 'C') {
	  		var index = parseInt(row.match(/C(\d+)/)[1]);
	  		var c = {};
	  		
	  		Circuit.apply(c,row.match(/[A-Z]:(\d+)/g).map(function(str){
	  			return parseInt(str.split(':')[1]);
	  		}))
	  		c.name = row.match(/C\d+/)[0]
	  		circuits[index] =  c;
	  		 
	  	} else if(row[0] === 'J') {
	  		var index = row.match(/J(\d+)/)[1]
	  		var j = {};
	  		Juggler.apply(j,row.match(/[A-Z]:(\d+)/g).map(function(str){
	  			return parseInt(str.split(':')[1]);
	  		}))
	  		j.preference = row.match(/C\d+/g).map(function(str){return parseInt(str.split("C")[1])})
	  		j.name = row.match(/J\d+/)[0]
	  		jugglers[index] = j
	  	}
	  })
	  cb(circuits,jugglers)
	});
}

function Juggler(h,e,p, preference) {
	this.current = 0;
	this.H = h
	this.E = e
	this.P = p
	this.preference = preference
	
}

function Circuit(h, e, p) {
	var self = this;
	this.H = h
	this.E = e
	this.P = p
	this.heap = new Heap([],null, function(b,a){
		return a.H * self.H + a.E * self.E + a.P * self.P - (b.H * self.H + b.E * self.E + b.P * self.P)
	})
}


function Run(circuits,jugglers) {
	var limit = jugglers.length / circuits.length;
	while(jugglers.length > 0) {
		var popouts = [];
		for(var i = jugglers.length-1; i>=0 ;i --) {
			var juggler = jugglers[i]
			var choose = circuits[juggler.preference[juggler.current]];
			if(!choose) {
				for(var k =0 ; k <circuits.length; k++) {
					if(circuits[k].heap.length < limit) {
						circuits[k].heap.push(juggler)
						jugglers.splice(i,1)
						break
					}
				}
			} else {
				juggler.current++;
				choose.heap.push(juggler);
				jugglers.splice(i,1)
				if(choose.heap.length > limit) {
					var temp = choose.heap.pop();
					popouts.push(temp)
				} 
			}
		}
		// console.log(jugglers, '************',popouts,'----------')
		jugglers = popouts.concat(jugglers);
	}
	console.log(circuits[1970].heap.reduce(function(pre, current){
		return pre + parseInt(current.name.split('J')[1])
	},0)) 
			// console.log(circuits.map(function(v){return v.heap.content.map(function(m){return m.name})}),'-------')

}

loadFile(Run)