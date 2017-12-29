export function weightedRandomA(corpus: any){
	// https://stackoverflow.com/questions/12672765/elegant-way-to-generate-a-random-value-regarding-percentage
	var totalWeight=0;
	var sortedCorpus=[];
	var n,k;
	for (k in corpus){
		totalWeight+=corpus[k];
		sortedCorpus.push({'k':k,'v':corpus[k]});
	}
	sortedCorpus.sort(function(a,b){
		return b.v - a.v;
	});
	let r = Math.random()*totalWeight;
	for(k in sortedCorpus){
		r-=sortedCorpus[k].v;
		if(r<=0){
			return sortedCorpus[k].k;
		}
	}
}

export function weightedRandomB(corpus: any){
	let weightedCorpus=[];
	for (let k in corpus){
		for (let n=0;n<Math.ceil(corpus[k]);n++){
			weightedCorpus.push(k);
		}
	}
	let alea = Math.floor(Math.random() * (Math.floor(weightedCorpus.length-1) +1));
	return weightedCorpus[alea];
}

export function getRandomInt(min:number, max:number) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

export class weightedRandomCorpusA{
	totalWeight:number=0;
	sortedCorpus:any[]=[];
	constructor(corpus: any){
		// https://stackoverflow.com/questions/12672765/elegant-way-to-generate-a-random-value-regarding-percentage
		this.totalWeight=0;
		this.sortedCorpus=[];
		for (let k in corpus){
			this.totalWeight+=corpus[k];
			this.sortedCorpus.push({'k':k,'v':corpus[k]});
		}
		this.sortedCorpus.sort(function(a,b){
			return b.v - a.v;
		});
	}

	pick (){
		var r = Math.random()*this.totalWeight;
		for(var k in this.sortedCorpus){
			r-=this.sortedCorpus[k].v;
			if(r<=0){
				return this.sortedCorpus[k].k;
			}
		}
	}
}

export class weightedRandomCorpusB{
	weightedCorpus:any[]=[];
	constructor(corpus:any){
		for (let k in corpus){
			for (let n=0;n<Math.ceil(corpus[k]);n++){
				this.weightedCorpus.push(k);
			}
		}
	}

	pick (){
		var alea = Math.floor(Math.random() * (Math.floor(this.weightedCorpus.length-1) +1));
		return this.weightedCorpus[alea];
	}
}


function testAll(corpus: any){
	var testOne = function (corpus: any,fn?: any){
		function _(v: any,n: any){
			return (' ').repeat(n - (''+v).length).substr(0,n)+(''+v)
		}
		var result: any={};
		var t1,t2,o,res;
		t1 = new Date().getTime();
		var n=100000;
		for (var i=0;i<n;i++){
			if(fn){
				res = fn(corpus);
			}else{
				res = corpus.pick();
			}

			if(!result.hasOwnProperty(res)){
				result[res]=0;
			}
			result[res]+=1;
		}
		t2 = new Date().getTime();
		for (var k in result){
			result[k]=Math.round(result[k]/n*100)
		}
		return JSON.stringify({'TotalTime':_(t2-t1,7),'OneTime':_((t2-t1)/n,10),'result':result});
	}
	console.log('method A',testOne(corpus,weightedRandomA));
	console.log('method B',testOne(corpus,weightedRandomB));
	console.log('class  A',testOne(new weightedRandomCorpusA(corpus)));
	console.log('class  B',testOne(new weightedRandomCorpusB(corpus)));
	console.log('-----------');
}

/*
testAll({0:10,1:85,2:5});
testAll({0:1,1:1,2:2,3:1});
testAll({0:100,1:100,2:100,3:200});
testAll({0:530,1:100,2:100,3:1000});
*/
