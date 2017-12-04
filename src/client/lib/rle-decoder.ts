// Decoder
var decode = function(input: any, destination: any) {
	var out;
	var previous;
	var length = 0;
	var index = 0;
	var i;
	if (!destination) {
		// Determine length and allocate output array
		// Add up all the instance counts
		for (i = 1; i < input.length; i += 2) {
			length += input[i];
		}
		destination = new Uint8Array(length);
	}
	for (i = 0; i < input.length; i += 2) {
		var value = input[i];
		var count = input[i + 1];
		// TODO: would using TypedArray.fill() here be faster?
		for (var j = 0; j < count; j++, index++) {
			destination[index] = value;
		}
	}
	return destination;
};

module.exports = decode;
