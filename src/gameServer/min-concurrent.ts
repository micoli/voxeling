let activeCount:number = 0;
let pending:any = [];
let maxFilesInFlight:number = 100; // Set this value to some number that's safe for your system

module.exports = {
	operation: function(op:any) {
		if (activeCount < maxFilesInFlight) {
			activeCount++;
			op();
		} else {
			pending.push(op);
		}
	},
	callback: function(cb:any) {
		return function() {
			var args = new Array(arguments.length);
			for (var i = 0, l = arguments.length; i < l; i++) {
				args[i] = arguments[i];
			}
			activeCount--;
			cb.apply(null, args);
			if (activeCount < maxFilesInFlight && pending.length){
				console.log("Processing Pending read/write");
				activeCount++;
				pending.shift()();
			}
		};
	}
};
