// maybe replace pool with a version that handles types of objects too
var pool = require('./object-pool');

export class Growable {
	offset: number;
	data: any;
	size: any;
	type: any;

	constructor(_type: any, initialSize: any) {
		this.type = _type;
		this.size = initialSize;
		this.data = pool.malloc(_type, initialSize);
		// The offset to start writing at, also can be used as a count of items in the buffer
		this.offset = 0;
	}

	// We want to append size amount of data, at the current offset
	// Re-allocate the array if necessary
	// Returns a handle to the TypedArray to use
	need(size: any) {
		var needed = this.offset + size;
		if (needed > this.size) {
			var newSize = this.size * 2;
			var data;

			while (needed > newSize) {
				newSize *= 2;
			}

			//console.log('GROWABLE: Reallocating to ' + newSize)
			data = pool.malloc(this.type, newSize);
			data.set(this.data);
			pool.free(this.type, this.data);

			this.data = data;
			this.size = newSize;
		}
		return this.data;
	}

	append(arr: any) {
		this.data.set(arr, this.offset);
		this.offset += arr.length;
	}

	free() {
		pool.free(this.type, this.data);
	}
}
