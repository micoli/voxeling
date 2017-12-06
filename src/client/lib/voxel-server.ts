var ndarray = require('ndarray');

module.exports = function(game: any, opts: any) {
	return new Randomland(game, opts);
};
module.exports.pluginInfo = {
	loadAfter: ['voxel-registry']
};

function getRandomInt(min: number, max: number) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

class Randomland {
	block: string;
	registry: any;
	game: any;
	voxelingClient : any;
	constructor(game: any, opts: any) {
		this.game = game;

		this.registry = game.plugins.get('voxel-registry');
		if (!this.registry) {
			throw 'voxel-flatland requires voxel-registry plugin';
		}
		this.block = opts.block;
		this.voxelingClient = opts.voxelingClient;
		this.enable();
	}

	enable() {
		this.game.voxels.on('missingChunk', this.onMissingChunk = this.missingChunk.bind(this));
	}

	disable() {
		this.game.voxels.removeListener('missingChunk', this.onMissingChunk);
	}

	onMissingChunk(position: any) {
		return this.missingChunk(position);
	}

	missingChunk(position: any) {
		console.log('missingChunk', position);

		if (position[1] > 0) {
			return; // everything above y=0 is air
		}
		this.voxelingClient.worker.postMessage([
			'regionChange',
			this.game.playerPosition(),
			//this.voxelingClient.camera.follow.getRotationQuat(),
			this.voxelingClient.settings.drawDistance,
			this.voxelingClient.settings.removeDistance
		]);
return;
		/*
		var blockIndex = this.registry.getBlockIndex(this.block);
		if (!blockIndex) {
			throw new Error('voxel-flatland unable to find block of name: ' + this.block);
		}

		var width = this.game.chunkSize;
		var pad = this.game.chunkPad;
		var arrayType = this.game.arrayType;

		var buffer = new ArrayBuffer((width + pad) * (width + pad) * (width + pad) * arrayType.BYTES_PER_ELEMENT);
		var voxelsPadded = ndarray(new arrayType(buffer), [width + pad, width + pad, width + pad]);
		var h = pad >> 1;
		var voxels = voxelsPadded.lo(h, h, h).hi(width, width, width);

		for (var x = 0; x < this.game.chunkSize; ++x) {
			for (var y = 0; y < this.game.chunkSize; ++y) {
				for (var z = 0; z < this.game.chunkSize; ++z) {
					voxels.set(x, y, z, blockIndex);
				}
			}
		}

		var chunk = voxelsPadded;
		chunk.position = position;

		console.log('about to showChunk', chunk);
		this.game.showChunk(chunk);
		*/
	}
}
