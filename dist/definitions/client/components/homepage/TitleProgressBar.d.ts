import { Vue } from 'vue-property-decorator';
export default class TitleProgressBar extends Vue {
    width: Number;
    title: String;
    value: Number;
    color: String;
    mounted(): void;
}
