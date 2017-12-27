import { Vue, Component } from 'vue-property-decorator';
import ClosableWidget from '../common/ClosableWidget';
import {VoxelClientInstance} from '../../../gameClient/voxel-client-instance';

@Component({
	template: `
		<closable-widget title="Game" size="col-md-12 col-sm-12 col-xs-12" height-class="fixed_height_480">
			<div class="col-md-12 col-sm-12 col-xs-12">
				<div id="game-holder" class="demo-placeholder" ></div>
			</div>
		</closable-widget>
	`,
	components:{
		ClosableWidget:ClosableWidget,
	}
})
export default class GameClient extends Vue {
	mounted () {
		setTimeout(function(){
			VoxelClientInstance.get(<HTMLCanvasElement>document.getElementById('game-holder'));
		},1000);
	}

	destroyed () {
	}
}
