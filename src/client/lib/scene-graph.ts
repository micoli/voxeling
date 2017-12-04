var glm = require('gl-matrix'),
	vec3 = glm.vec3,
	vec4 = glm.vec4,
	mat4 = glm.mat4,
	quat = glm.quat;

// http://webglfundamentals.org/webgl/lessons/webgl-scene-graph.html
export class Node {
	worldMatrix: any;
	localMatrix: any;
	model: any;
	children: any[];
	gl: any;

	constructor(gl: any, model: any) {
		this.gl = gl;
		this.children = [];
		this.model = model;

		this.localMatrix = mat4.create();
		this.worldMatrix = mat4.create();
	}

	// setParent helps us prevent a child from being added to multiple parents
	/*
	setParent = function(parent) {
		// remove us from our parent
		if (this.parent) {
			var ndx = this.parent.children.indexOf(this);
			if (ndx >= 0) {
				this.parent.children.splice(ndx, 1);
			}
		}

		// Add us to our new parent
		if (parent) {
			parent.children.append(this);
		}
		this.parent = parent;
	};
	*/
	addChild(node: any) {
		this.children.push(node);
	}

	// Update
	tick(parentWorldMatrix: any, ts: number) {
		this.model.tick(parentWorldMatrix, ts);

		for (var i = 0; i < this.children.length; i++) {
			var child = this.children[i];
			// Don't really like that this reaches in
			child.tick(this.model.worldMatrix, ts);
		}
	}

	render(ts: number) {
		// Now render this item?
		this.model.render(ts);

		for (var i = 0; i < this.children.length; i++) {
			var child = this.children[i];
			child.render(ts);
		}
	}

}
