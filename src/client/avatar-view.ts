var glShader = require('gl-shader')
var glslify = require('glslify');
var avatarModule = require('avatar')
var createSkinMesh = avatarModule.createSkinMesh
var createSkinTexture = avatarModule.createSkinTexture

export class avatarView {
	shader: any;
	game: any;
	gl: any;
	skin:any;
	mesh:any;
	meshShader:any;
	t:number=0;
	constructor ( game:any ){
		this.game = game;

		this.shader = game.plugins.get( 'voxel-shader' );
		if ( !this.shader ) {
			throw 'voxel-webview requires voxel-shader plugin' ;
		}

		this.init();
		this.enable();
	}

	init(){
		var textureURI = '/textures/';
		var textureFile ='substack.png';
		var self = this;
		createSkinTexture(this.game.shell.gl, textureURI+textureFile, textureFile, 'image/png', function(err: any, texture: any) {
			self.skin = texture
		});

		self.mesh = createSkinMesh(this.game.shell.gl);

		self.meshShader = glShader(this.game.shell.gl,
			glslify ('./avatar.vert'),
			glslify ('./avatar.frag')
		);
	}

	enable() {

		if ( this.game.shell.gl ) {
			// gl is already initialized - we won't receive gl-init, or the first gl-resize
			// call it here (on-demand plugin loading) TODO: cleaner generic fix for plugins receiving init events too late
			this.ginit();
			this.updatePerspective();
		} else {
			this.game.shell.on( 'gl-init', this.onInit = this.ginit.bind( this ) );
		}

		this.shader.on( 'updateProjectionMatrix', this.onUpdatePerspective = this.updatePerspective.bind( this ) );
		this.game.shell.on( 'gl-render', this.onRender = this.render.bind( this ) );
	};

	disable() {
		this.game.shell.removeListener( 'gl-render', this.onRender );
		if ( this.onInit ) this.game.shell.removeListener( 'gl-init', this.onInit );
		this.shader.removeListener( 'updateProjectionMatrix', this.onUpdatePerspective );
	};

	ginit( ) {
		this.gl = this.game.shell.gl;
		//this.css3d.ginit( this.game.shell.gl );
	};

	updatePerspective() {
		var cameraFOVradians = this.shader.cameraFOV * Math.PI / 180;

		//this.css3d.updatePerspective( cameraFOVradians, this.game.shell.width, this.game.shell.height );
	};

	render() {
		//this.css3d.render( this.shader.viewMatrix, this.shader.projectionMatrix );
		this.gl.enable(this.gl.CULL_FACE)
		this.gl.enable(this.gl.DEPTH_TEST)

		/*camera.view(view)
		mat4.perspective(proj // note: shouldn't have to calculate this everytime (only if shell changes; add event), but this is only a demo
		, Math.PI / 4
		, shell.width / shell.height
		, 0.001
		, 1000
		)*/
		this.meshShader.bind()
		this.meshShader.attributes.position.location = 0
		this.meshShader.attributes.uv.location = 1
		this.meshShader.uniforms.projectionMatrix = this.shader.projectionMatrix
		this.meshShader.uniforms.modelViewMatrix = this.shader.viewMatrix
		this.t += 1;
		this.t %= 100
		this.meshShader.uniforms.rArmRotateX = Math.sin(this.t / 100 * 2 * Math.PI)
		this.meshShader.uniforms.lArmRotateX = Math.sin(this.t / 100 * 2 * Math.PI)
		this.meshShader.uniforms.rLegRotateX = Math.sin(2 * this.t / 100 * 2 * Math.PI)
		this.meshShader.uniforms.lLegRotateX = Math.cos(2 * this.t / 100 * 2 * Math.PI)

		if (this.skin){
			//this.meshShader.uniforms.skin = this.skin.bind();
		};
		this.meshShader.attributes.position.pointer()
		this.meshShader.attributes.uv.pointer()

		// Bind the VAO, and draw all of the elements
		// to the screen as triangles. The gl-vao module
		// will handle when to use gl.drawArrays/gl.drawElements
		// for you.
		this.mesh.bind()
		this.mesh.draw(this.gl.TRIANGLES, this.mesh.length)
		this.mesh.unbind()
	};
}
