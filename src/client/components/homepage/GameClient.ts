import { Vue, Component } from 'vue-property-decorator';
import ClosableWidget from '../common/ClosableWidget';
import {VoxelClientInstance} from '../../../gameClient/voxel-client-instance';

@Component({
	template: `
		<closable-widget title="Game" size="col-md-12 col-sm-12 col-xs-12" height-class="fixed_height_480">
			<div class="col-md-12 col-sm-12 col-xs-12 content-holder">
				<div class="toolbox_place_holder" style="position:absolute;right:0;z-index:11;"></div>
				<div id="game-holder" class="demo-placeholder" style="height:400px;width:1110px;z-index:10;"></div><!--1110-->
				<div class="inventory_place_holder" style="position:absolute;bottom:0;z-index:11;"></div>
			</div>
		</closable-widget>
	`,
	components:{
		ClosableWidget:ClosableWidget,
	}
})
export default class GameClient extends Vue {
	getVisibleDimensions(node:any, referenceNode?:any) {
		referenceNode = referenceNode || node.parentNode;

		var pos = node.getBoundingClientRect();
		var referencePos = referenceNode.getBoundingClientRect();

		return {
			"width": Math.min(
				node.clientWidth,
				referencePos.left + referenceNode.clientWidth - pos.left,
				node.clientWidth - (referencePos.left - pos.left)
			),
			"height": Math.min(
				node.clientHeight,
				referencePos.top + referenceNode.clientHeight - pos.top,
				node.clientHeight - (referencePos.top - pos.top)
			)
		}
	}
	mounted () {
		let cmp = this;
		//let dims = this.getVisibleDimensions(<any>cmp.$el);
		let canvas = <HTMLDivElement>document.getElementById('game-holder');
		//canvas.width = dims.width;
		//canvas.height = dims.height;
		//canvas.setAttribute('height',dims.height+'px');
		VoxelClientInstance.get(canvas);
	}

	destroyed () {
	}
}
