import { Vue, Component, Prop, Provide } from 'vue-property-decorator';

@Component({
	props : {
		icon: {type:String,default:'fa-user'},
		title: {type:String,default:'Title'},
		delta: {type:Number,default:0},
		count: {type:Number,default:0},
		subText: {type:String,default:'From last week'}
	},
	template: `
	<div class="col-md-2 col-sm-4 col-xs-6 tile_stats_count">
		<span class="count_top">
			<i class="fa fa-user" ></i> {{ title}}
		</span>
		<div class="count">{{ count }}</div>
		<span class="count_bottom">
			<i v-bind:class="{red:delta<0, green:delta>0}">
				<i v-bind:class="{fa: (delta<-10||delta>10) ,'fa-sort-desc':delta<-10, 'fa-sort-asc':delta>10}"></i>
				{{delta}}%
			</i> {{subText}}
		</span>
	</div>`
})//v-bind:class="'fa'  _icon"
export default class TitleStatCount extends Vue {
	icon:String;
	title:String;
	delta:Number;
	count:Number;
	subText:String;

	_icon:String= 'fa-'+this.icon;
	mounted () {
	}

	destroyed () {
	}
}
