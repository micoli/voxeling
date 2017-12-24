voxeling
====

Originally Inspired by [voxel-engine](https://github.com/maxogden/voxel-engine) and [voxel.js](http://voxeljs.com), this is a multiplayer sandbox (like Minecraft creative mode) implemented in WebGL with very few dependencies. Very much a work in progress.

Original Demo: http://voxeling.greaterscope.com (Google Chrome and Firefox 46+)

Original Project blog: http://voxeling.tumblr.com/

Textures provided by:

* https://github.com/deathcap/ProgrammerArt

Player skins from:

* https://github.com/maxogden/voxel-client
* https://github.com/deathcap/avatar


Gameplay Features
====

* Multiplayer, with maxogden, substack and viking skins
* Block creation and destruction (batch operations via click-and-drag)
* Jumping and flying
* First-person, over-shoulder, third person camera views (these need some love, though)
* Building materials and material picker dialog
* Gamepad support (80% complete)
* Adjustable draw distance (change it according to your GPU speed and memory)
* World state is saved to files or mysql (install mysql npm module)


Technical Features
====

* Client and Server (ported bits from my voxel-client and voxel-server forks)
* Simple physics engine for player movements
* Meshing algorithms
* Sample world generators
* Improved websocket emitter - disconnects are handled gracefully
* Object pool to reduce memory allocations and garbage-collection pauses
* voxel-highlight replacement
* Simple run-length encoder/decoder (voxel-crunch did bitwise ops, and was buggy across node versions)
* LRU cache for minimizing trips to the file-system or database for frequently requested chunks
* Relatively flat architecture means it's easy to get a WebGL handle and the inverse camera matrix for drawing
* All IO and chunk meshing is done in a web worker, which keeps the framerate very high
* Uses view frustum to prioritize world chunk fetching
* Directional lighting
* Day and night cycle (still needs some love)

Or follow the installation instructions below to run it locally.


Installation
====

In terminal 1:

```
# git clone the repo into voxeling folder
cd /path/to/voxeling
yarn install

# copy the default config and customize
cp config-example.js config.js
vim config.js

#run the develop www server
yarn run dev
```

In terminal 2:

```
cd /path/to/voxeling
# start the game and application server
gulp develop
```

Now, point your browser to http://127.0.0.1:8081.


License
====

MIT License
