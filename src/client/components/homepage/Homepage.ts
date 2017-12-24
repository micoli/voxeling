import { Vue, Component } from 'vue-property-decorator';

import ClosableWidget from '../common/ClosableWidget';

import TitleStatCount from './TitleStatCount';
import GameClient from './GameClient';

@Component({
	template: `
	<div class="right_col" role="main">
		<!-- top tiles -->
		<div class="row tile_count">
			<title-stat-count :icon="'fa-user'" :title="'Total Users'" :count="2500" :delta="4"></title-stat-count>
			<title-stat-count :icon="'fa-clock-o'" :title="'Average Time'" :count="132.5" :delta="3"></title-stat-count>
			<title-stat-count :icon="'fa-user'" :title="'Total Males'" :count="2500" :delta="-5"></title-stat-count>
			<title-stat-count :icon="'fa-user'" :title="'Total Females'" :count="1250" :delta="10"></title-stat-count>
			<title-stat-count :icon="'fa-clock-o'" :title="'Total Collections'" :count="98" :delta="20"></title-stat-count>
			<title-stat-count :icon="'fa-user'" :title="'Total Connections'" :count="7654.12" :delta="-15"></title-stat-count>
		</div>
		<!-- /top tiles -->
		<div class="row">
			<game-client></game-client>
		</div>
	</div>`,
	components:{
		ClosableWidget: ClosableWidget,
		TitleStatCount: TitleStatCount,
		GameClient: GameClient
	}
})
export default class Homepage extends Vue {
	mounted () {
	}

	destroyed () {
	}
}
