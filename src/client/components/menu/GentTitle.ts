import { Vue, Component,Provide } from 'vue-property-decorator';

@Component({
	template: `
	<div class="navbar nav_title" style="border: 0;">
		<a href="index.html" class="site_title"><i class="fa fa-paw"></i> <span>Voxeling</span></a>
	</div>`
})
export default class GentTitle extends Vue {
	mounted () {
	}
}
