import { Vue } from 'vue-property-decorator';
export default class Auth extends Vue {
    credentials: any;
    rememberCredentials: boolean;
    error: string;
    mode: string;
    displayRegister(): void;
    displayLogin(): void;
    displayLostPassword(): void;
    lostPassword(): void;
    login(): void;
    register(): void;
    destroyed(): void;
}
