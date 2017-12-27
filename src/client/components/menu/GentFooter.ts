import { Vue, Component,Provide } from 'vue-property-decorator';

@Component({
	template: `
	<footer>
		<div class="pull-right">
			Gentelella by <a href="https://colorlib.com">Colorlib</a>
		</div>
		<div class="clearfix"></div>
	</footer>`
})
export default class GentFooter extends Vue {
	mounted () {
	}
}
