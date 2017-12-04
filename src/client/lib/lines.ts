/*
LineBuffer to hold all the lines we want to draw
*/
var vertexShaderCode =
	"uniform mat4 u_projection;" +
	"attribute vec4 a_position;" +
	"void main() { gl_Position = (u_projection * a_position); }";
var fragmentShaderCode =
	"precision mediump float;" +
	"uniform vec4 u_color;" +
	"void main() { gl_FragColor = u_color; }";

export class Lines {
	skipDraw: any;
	shaderProgram: any;
	pointOffsets: any[];
	color: any;
	points: any[];
	shaderAttributes: {
		position : any
		shaderUniforms:{
			projection : any
			color : any
		}
	};
	shaderUniforms:{
		projection : any
		color : any
	};
	shaders: {
		fragment : any;
		vertex : any;
	};
	tuples: number;
	glBuffer: any;
	gl: any;

	constructor(gl: any, color?: any) {
		this.gl = gl;
		this.glBuffer;
		this.tuples = 0;
		var errmsg = '';
		this.shaders = {
			fragment : null,
			vertex : null
		};
		this.shaderAttributes = {
			position : null,
			shaderUniforms:{
				projection : null,
				color : null
			}
		};
		this.shaderUniforms = {
			projection : null,
			color : null
		};
		this.points = [];
		this.pointOffsets = [];
		this.color = color || [ 255, 0, 0, 1 ];

		// Set up shaders
		var shader = gl.createShader(gl.FRAGMENT_SHADER);
		gl.shaderSource(shader, fragmentShaderCode);
		gl.compileShader(shader);
		if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
			errmsg = "fragment shader compile failed: " + gl.getShaderInfoLog(shader);
			alert(errmsg);
			throw new Error();
		}
		this.shaders.fragment = shader;

		shader = gl.createShader(gl.VERTEX_SHADER);
		gl.shaderSource(shader, vertexShaderCode);
		gl.compileShader(shader);
		if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
			errmsg = "vertex shader compile failed : " + gl.getShaderInfoLog(shader);
			alert(errmsg);
			throw new Error(errmsg);
		}
		this.shaders.vertex = shader;

		var shaderProgram = gl.createProgram();
		gl.attachShader(shaderProgram, this.shaders.vertex);
		gl.attachShader(shaderProgram, this.shaders.fragment);
		gl.linkProgram(shaderProgram);
		//gl.useProgram(shaderProgram);

		this.shaderAttributes.position = gl.getAttribLocation(shaderProgram, "a_position");
		this.shaderUniforms = {
			projection : gl.getUniformLocation(shaderProgram, "u_projection"),
			color : gl.getUniformLocation(shaderProgram, "u_color")
		};

		if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
			errmsg = "failed to initialize shader with data matrices";
			alert(errmsg);
			throw new Error(errmsg);
		}

		this.shaderProgram = shaderProgram;

		this.glBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this.glBuffer);
	}

	/*
	Buffer attributes will likely just be:
	{
		thickness: 1,
		points: []
	}
	*/
	// BAH, for now, all lines are the same
	fill (points: any) {
		var gl = this.gl;

		this.skipDraw = false;
		this.tuples = points.length / 3;

		gl.bindBuffer(gl.ARRAY_BUFFER, this.glBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, points, gl.STATIC_DRAW);
	}

	render (projection: any) {
		var gl = this.gl;
		if (this.skipDraw) {
			return;
		}
		gl.useProgram(this.shaderProgram);
		gl.lineWidth(3);

		// works!
		gl.uniformMatrix4fv(this.shaderUniforms.projection, false, projection);

		gl.bindBuffer(gl.ARRAY_BUFFER, this.glBuffer);
		gl.enableVertexAttribArray(this.shaderAttributes.position);
		gl.vertexAttribPointer(this.shaderAttributes.position, 3, gl.FLOAT, false, 0, 0);

		gl.uniform4fv(this.shaderUniforms.color, this.color);
		gl.drawArrays(gl.LINES, 0, this.tuples);
	}

	skip (yesno: any) {
		this.skipDraw = yesno;
	}
}
