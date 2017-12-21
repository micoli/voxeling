import { Vue, Component, Prop, Provide } from 'vue-property-decorator';

@Component({
	props : {
		width: {type:String,default:'76'},
		title: {type:String,default:'Title'},
		value: {type:Number,default:0},
		color: {type:String,default:'bg-green'}
	},
	template: `
	<div>
		<p>{{ title }}</p>
		<div class="">
			<div class="progress progress_sm" style="{width: width + '%'}">
				<div v-bind:class="" role="progressbar" v-bind:data-transitiongoal="value"></div>
			</div>
		</div>
	</div>`
})
//v-bind:class="'fa'  _icon"
//['progress-bar' 'color']
export default class TitleProgressBar extends Vue {
	width:Number;
	title:String;
	value:Number;
	color:String;

	mounted () {
		let self = this;
		setTimeout(function(){
			//$('.progress .progress-bar',self.$el).progressbar();
		},200)
	}
}
