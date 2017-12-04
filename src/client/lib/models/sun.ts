var glm = require('gl-matrix'),
	vec3 = glm.vec3,
	vec4 = glm.vec4,
	mat4 = glm.mat4,
	quat = glm.quat;
var scratch = require('../scratch');
var Shapes = require('../shapes2');
import {Model2} from '../model2';
var Scene = require('../scene-graph');

export class Sun {
	tempSpeed: number;
	weatherTime: any;
	hierarchy: any;
	model: any;
	sun: any;
	sunRotation: number;
	constructor(gl: any, shader: any, textures: any, player: any) {
		var self = this;
		var d;
		var uv;
		var meshes = [];
		var i;
		var orbital: Model2;

		this.sunRotation = 0;

		meshes = [];
		d = 6;
		uv = [
			0, 0, d, d,
			0, 0, d, d,
			0, 0, d, d,
			0, 0, d, d,
			0, 0, d, d,
			0, 0, d, d
		];
		var sunMesh = this.sun = Shapes.three.rectangle(d, d, d, uv, 1, textures.byName.lava);
		meshes.push(sunMesh);

		this.model = new Model2(
			gl,
			shader,
			meshes,
			// Tick method for doing movement
			function() {
				var position = player.getPosition();
				//var translation = vec3.fromValues(position[0], position[1] - 20, position[2]);
				mat4.translate(this.localMatrix, scratch.identityMat4, position);
				mat4.rotateZ(this.localMatrix, this.localMatrix, self.sunRotation);
				mat4.translate(this.localMatrix, this.localMatrix, [0, -200, 0]);
			}
		);

		this.hierarchy = new Scene.Node(gl, this.model);


		// Cube orbiting around the sun
		d = 2;
		uv = [
			0, 0, d, d,
			0, 0, d, d,
			0, 0, d, d,
			0, 0, d, d,
			0, 0, d, d,
			0, 0, d, d
		];
		var shape = Shapes.three.rectangle(d, d, d, uv, 1, textures.byName.lava);
		meshes = [shape];

		var num = 10;
		var circ = Math.PI * 2;
		for (i = 0; i < num; i++) {
			orbital = new Model2(
				gl,
				shader,
				meshes,
				// Tick method for doing movement
				function(seconds: number) {
					var translation = vec3.fromValues(4, 0, 0);
					mat4.rotateY(this.localMatrix, scratch.identityMat4, self.tempSpeed + (this.num * (circ / num)));
					mat4.translate(this.localMatrix, this.localMatrix, translation);
					// Rotate them back for more pointy shimmer
					mat4.rotateY(this.localMatrix, this.localMatrix, -(self.tempSpeed + (this.num * (circ / num))));
				}
			);
			orbital.num = i;

			this.hierarchy.addChild(
				new Scene.Node(gl, orbital)
			);
		}
		for (i = 0; i < num; i++) {
			orbital = new Model2(
				gl,
				shader,
				meshes,
				// Tick method for doing movement
				function(seconds: number) {
					var translation = vec3.fromValues(0, 4, 0);
					mat4.rotateX(this.localMatrix, scratch.identityMat4, self.tempSpeed + (this.num * (circ / num)));
					mat4.translate(this.localMatrix, this.localMatrix, translation);
					mat4.rotateX(this.localMatrix, this.localMatrix, -(self.tempSpeed + (this.num * (circ / num))));
				}
			);
			orbital.num = i;

			this.hierarchy.addChild(
				new Scene.Node(gl, orbital)
			);
		}

	}

	tick(weatherTime: any, sunRotation: any) {
		this.weatherTime = weatherTime;
		this.sunRotation = sunRotation;

		// tick the models hierarchy
		// TODO: calculate self.weatherTime / 300.0 and cache somewhere so child Nodes don't have to repeatedly calculate?
		this.tempSpeed = this.weatherTime / 300.0;
		this.hierarchy.tick(scratch.identityMat4, 0);
	}

	render(parentView: any, ts: any) {
		this.hierarchy.render(scratch.identityMat4, ts);
	}
}
