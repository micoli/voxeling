import { Vue } from 'vue-property-decorator';
export default class ClosableWidget extends Vue {
    size: String;
    title: String;
    value: Number;
    color: String;
    heightClass: String;
    data(): {
        heightClasses: String[];
    };
    collapse(el: any): void;
    close(el: any): void;
}
