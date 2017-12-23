import { Vue } from 'vue-property-decorator';
export default class TitleStatCount extends Vue {
    icon: String;
    title: String;
    delta: Number;
    count: Number;
    subText: String;
    _icon: String;
    mounted(): void;
    destroyed(): void;
}
