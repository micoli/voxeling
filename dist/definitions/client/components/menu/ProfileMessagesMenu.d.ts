import { Vue } from 'vue-property-decorator';
export default class ProfileMessagesMenu extends Vue {
    username: string;
    nbMessages: number;
    messages: any[];
    _nbMessages: number;
    _messages: any[];
    seeAll(): void;
    mounted(): void;
}
