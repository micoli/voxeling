import { EventEmitter } from 'events';
import { Engine } from './voxel-engine-stackgl';

var debug = false;

module.exports = (engine: any, opts: any) => new VoxelSandbox(engine, opts);
module.exports.pluginInfo = {
	loadAfter: ['voxel-shell']
};

export class VoxelSandbox extends EventEmitter {
	opts: any;
	engine: Engine;
	shaderPlugin: any;
	gl: any;
	isReady : boolean = false;
	onInit:any;
	onUpdatePerspective:any;
	onRender:any;

	constructor(engine: Engine, opts: any) {
		super();
		var self = this;
		this.engine = engine
		this.shaderPlugin = engine.plugins.get( 'voxel-shader' );

	}
	enable(){
		this.onInit = this.ginit.bind( this );
		this.onUpdatePerspective = this.updatePerspective.bind( this );
		this.onRender = this.render.bind( this );
		if ( this.engine.shell.gl ){
			// gl is already initialized - we won't receive gl-init, or the first gl-resize
			// call it here (on-demand plugin loading) TODO: cleaner generic fix for plugins receiving init events too late
			this.ginit();
			this.updatePerspective();
		} else {
			this.engine.shell.on( 'gl-init', this.onInit);
		}

		this.shaderPlugin.on( 'updateProjectionMatrix',  this.onUpdatePerspective);
		this.engine.shell.on( 'gl-render', this.onRender);
	}

	disable() {
		if ( this.onInit ) {
			this.engine.shell.removeListener( 'gl-init', this.onInit );
		}
		this.shaderPlugin.removeListener( 'updateProjectionMatrix', this.onUpdatePerspective );
		this.engine.shell.removeListener( 'gl-render', this.onRender );
	}

	ginit() {
		this.gl = this.engine.shell.gl;
		var self = this;

		/*self.mesh = createSkinMesh(this.engine.shell.gl);
		self.meshShader = glShader(this.engine.shell.gl ,
			glslify ('./avatar.vert'),
			glslify ('./avatar.frag')
		);*/
	}

	updatePerspective() {
		//this.css3d.updatePerspective( cameraFOVradians, this.engine.shell.width, this.engine.shell.height );
	}

	update(data:any){
	}

	render() {
		this.gl.enable(this.gl.CULL_FACE);
		this.gl.enable(this.gl.DEPTH_TEST);

		/*this.meshShader.bind();
		this.meshShader.attributes.position.location = 0;
		this.meshShader.attributes.uv.location = 1;
		this.meshShader.uniforms.projectionMatrix = this.shaderPlugin.projectionMatrix;
		this.meshShader.uniforms.modelViewMatrix = this.shaderPlugin.viewMatrix;
		if(this.isWalking){
			this.dt += 1;
			this.dt %= 100;
		}else{
			if(this.dt!=0){
				this.dt += 1;
				this.dt %= 100;
			}
		}

		this.meshShader.uniforms.rArmRotateX = Math.sin(this.dt / 100 * 2 * Math.PI);
		this.meshShader.uniforms.lArmRotateX = Math.sin(this.dt / 100 * 2 * Math.PI);
		this.meshShader.uniforms.rLegRotateX = Math.sin(2 * this.dt / 100 * 2 * Math.PI);
		this.meshShader.uniforms.lLegRotateX = Math.cos(2 * this.dt / 100 * 2 * Math.PI);
		this.meshShader.uniforms.globalPosX = this.globalPosX;
		this.meshShader.uniforms.globalPosY = this.globalPosY+this.engine.playerHeight*2;
		this.meshShader.uniforms.globalPosZ = this.globalPosZ;
		this.meshShader.uniforms.globalYaw = this.globalYaw;
		this.meshShader.uniforms.globalPitch = this.globalPitch;
		if (this.skin){
			this.meshShader.uniforms.skin = this.skin.bind();
		}
		this.meshShader.attributes.position.pointer();
		this.meshShader.attributes.uv.pointer();

		this.mesh.bind();
		this.mesh.draw(this.gl.TRIANGLES,this.mesh.length);
		this.mesh.unbind();
		*/
	}

}
