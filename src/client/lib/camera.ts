var glm = require('gl-matrix');
/*,
vec3 = glm.vec3,
vec4 = glm.vec4,
mat4 = glm.mat4,
quat = glm.quat;
 */
var inherits = require('inherits');

import {Movable} from './movable';
import {Player} from './player';

var scratch = require('./scratch');

export class Camera extends Movable {
	view: number;
	shoulderOffset: number[];
	thirdPersonOffset: number[];
	ratio: any;
	protected _follow: Player;
	projection: any;
	farDistance: number;
	verticalFieldOfView: number;
	inverse: any;
	canvas: any;
	matrix: any;

	constructor(canvas: any, follow: any) {
		super();
		this.canvas = canvas;
		this.matrix = glm.mat4.create();
		this.inverse = glm.mat4.create();

		this.verticalFieldOfView = Math.PI / 4;
		this.ratio;
		// 32 * 20 = 640 ... 20 chunks away
		this.farDistance = 640;
		this.projection = glm.mat4.create();

		this.follow = follow;
		this.view = 0;
		this.shoulderOffset = [0.4, 2, 2];
		this.thirdPersonOffset = [0, 2, 4];

		this.canvasResized();
	}

	get follow() {
		return this._follow;
	}

	set follow(_follow: Player) {
		this._follow = _follow;
	}

	canvasResized() {
		this.ratio = this.canvas.clientWidth / this.canvas.clientHeight;

		// Adjusts coordinates for the screen's aspect ration
		// Not sure to set near and far to ... seems arbitrary. Surely those values should match the frustum
		glm.mat4.perspective(this.projection, this.verticalFieldOfView, this.ratio, 0.1, this.farDistance);
	}

	updateProjection() {
		var offset;
		switch (this.view) {
			// Over shoulder
			case 1:
				offset = this.shoulderOffset;
				//glm.vec3.transformQuat(this.tempVector, offset, this.follow.getRotationQuat());
				// transform this offset, according to yaw
				//glm.vec3.add(this.position, this.follow.getPosition(), this.tempVector);
				break;

			// Birds-eye
			case 2:
				offset = this.thirdPersonOffset;
				//glm.vec3.transformQuat(this.tempVector, offset, this.follow.getRotationQuat());
				// transform this offset, according to yaw
				//glm.vec3.add(this.position, this.follow.getPosition(), this.tempVector);
				break;

			// First-person
			default:
				offset = this.follow.getEyeOffset();
				break;
		}

		// Rotate eye offset into tempVector, which we'll then add to player position
		glm.quat.rotateY(scratch.quat, scratch.identityQuat, this.follow.getYaw());
		glm.vec3.transformQuat(scratch.vec3, offset, scratch.quat);
		glm.vec3.add(this.position, this.follow.getPosition(), scratch.vec3);

		glm.mat4.fromRotationTranslation(this.matrix, this.follow.getRotationQuat(), this.position);
		glm.mat4.invert(this.inverse, this.matrix);
		glm.mat4.multiply(this.inverse, this.projection, this.inverse);

		return this.inverse;
	}

	nextView() {
		this.view++;
		if (this.view > 2) {
			this.view = 0;
		}
	}
}
