import { Vue, Component} from 'vue-property-decorator';

@Component({
	template: `
	<div class="nav toggle">
		<a @click="toggle"><i class="fa fa-bars"></i></a>
	</div>`
})
export default class TopMenuToggle extends Vue {
	toggle(){
		this.$root.$emit('navigation:menuToggle');
	}
}
