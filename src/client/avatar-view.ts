var glShader = require('gl-shader')
var glslify = require('glslify');
var avatarModule = require('avatar')
var createSkinMesh = avatarModule.createSkinMesh
var createSkinTexture = avatarModule.createSkinTexture

export class avatarView {
	game: any;
	gameShader: any;
	gl: any;

	skin:any;
	mesh:any;
	meshShader:any;

	dt:number=0;

	globalPosX: any=0;
	globalPosY: any=0;
	globalPosZ: any=0;
	u_Translation: any;

	onInit:any;
	onUpdatePerspective:any;
	onRender:any;

	isWalking:boolean = true;
	constructor ( game:any ){
		this.game = game;

		this.gameShader = game.plugins.get( 'voxel-shader' );

		if ( !this.gameShader ) {
			throw 'voxel-webview requires voxel-shader plugin' ;
		}

		this.init();
		this.enable();
	}

	init(){
		var self = this;
		var textureURI = '/textures/';
		var textureFile ='SnDKuc1.png';

		createSkinTexture(this.game.shell.gl, textureURI+textureFile, textureFile, 'image/png', function(err: any, texture: any) {
			self.skin = texture;
		});

		self.mesh = createSkinMesh(this.game.shell.gl);
		self.meshShader = glShader(this.game.shell.gl ,
			glslify ('./avatar.vert'),
			glslify ('./avatar.frag')
		);
	}

	walk(){
		this.isWalking=true;
	}
	halt(){
		this.isWalking=false;
	}

	enable(){
		this.onInit = this.ginit.bind( this );
		this.onUpdatePerspective = this.updatePerspective.bind( this );
		this.onRender = this.render.bind( this );
		if ( this.game.shell.gl ){
			// gl is already initialized - we won't receive gl-init, or the first gl-resize
			// call it here (on-demand plugin loading) TODO: cleaner generic fix for plugins receiving init events too late
			this.ginit();
			this.updatePerspective();
		} else {
			this.game.shell.on( 'gl-init', this.onInit);
		}

		this.gameShader.on( 'updateProjectionMatrix',  this.onUpdatePerspective);
		this.game.shell.on( 'gl-render', this.onRender);
	};

	disable() {
		this.game.shell.removeListener( 'gl-render', this.onRender );
		if ( this.onInit ) this.game.shell.removeListener( 'gl-init', this.onInit );
		this.gameShader.removeListener( 'updateProjectionMatrix', this.onUpdatePerspective );
	}

	ginit() {
		this.gl = this.game.shell.gl;
	}

	updatePerspective() {
		var cameraFOVradians = this.gameShader.cameraFOV * Math.PI / 180;
		//this.css3d.updatePerspective( cameraFOVradians, this.game.shell.width, this.game.shell.height );
	}

	render() {
		if(!this.u_Translation){
			this.u_Translation = this.gl.getUniformLocation(this.meshShader.program, 'u_Translation');
		}
		this.gl.enable(this.gl.CULL_FACE);
		this.gl.enable(this.gl.DEPTH_TEST);

		this.meshShader.bind();
		this.meshShader.attributes.position.location = 0;
		this.meshShader.attributes.uv.location = 1;
		this.meshShader.uniforms.projectionMatrix = this.gameShader.projectionMatrix;
		this.meshShader.uniforms.modelViewMatrix = this.gameShader.viewMatrix;
		if(this.isWalking){
			this.dt += 1;
			this.dt %= 100;
		}else{
			if(this.dt!=0){
				this.dt += 1;
				this.dt %= 100;
			}
		}
		this.gl.uniform4f(this.u_Translation, this.globalPosX, this.globalPosY, this.globalPosZ, 0.0);
		this.meshShader.uniforms.rArmRotateX = Math.sin(this.dt / 100 * 2 * Math.PI);
		this.meshShader.uniforms.lArmRotateX = Math.sin(this.dt / 100 * 2 * Math.PI);
		this.meshShader.uniforms.rLegRotateX = Math.sin(2 * this.dt / 100 * 2 * Math.PI);
		this.meshShader.uniforms.lLegRotateX = Math.cos(2 * this.dt / 100 * 2 * Math.PI);

		if (this.skin){
			this.meshShader.uniforms.skin = this.skin.bind();
		}
		this.meshShader.attributes.position.pointer();
		this.meshShader.attributes.uv.pointer();

		this.mesh.bind();
		this.mesh.draw(this.gl.TRIANGLES,this.mesh.length);
		this.mesh.unbind();
	}
}
