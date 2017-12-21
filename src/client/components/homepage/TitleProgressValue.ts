import { Vue, Component, Prop, Provide } from 'vue-property-decorator';

@Component({
	props : {
		width: {default:'100'},
		title: {default:'Title'},
		value: {default:'0'},
		tvalue: {default:'0.0'}
	},
	template: `
	<div class="widget_summary">
		<div class="w_left w_25">
			<span>{{ title }}</span>
		</div>
		<div class="w_center w_55">
			<div class="progress">
				<div class="progress-bar bg-green" role="progressbar" v-bind:aria-valuenow="value" aria-valuemin="0" aria-valuemax="100" style="{width: width + '%'}">
					<span class="sr-only">{{ value }} % Complete</span>
				</div>
			</div>
		</div>
		<div class="w_right w_20">
			<span>{{ tvalue }}</span>
		</div>
		<div class="clearfix"></div>
	</div>`
})
//v-bind:class="'fa'  _icon"
//['progress-bar' 'color']
export default class TitleProgressValue extends Vue {
	width:any;
	title:any;
	value:any;
	tvalue:any;

	mounted () {
		setTimeout(function(){
			//$('.progress .progress-bar',this.$el).progressbar();
		},200)
	}

	destroyed () {
	}
}
