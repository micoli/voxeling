import { Vue, Component } from 'vue-property-decorator';

import ClosableWidget from '../common/ClosableWidget';
import voxelClient from '../../../gameClient/client';

@Component({
	template: `
		<closable-widget title="Game" size="col-md-12 col-sm-12 col-xs-12">
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
			voxelClient();
		},3000);
	}

	destroyed () {
	}
}
