export declare class SecurityService {
    private static _rightNotConnected;
    private static _currentIdentity;
    private static _authenticated;
    private static vue;
    private static jwtPrivateKey;
    private static returnToRoute;
    private static returnToRouteName;
    static userToken: string;
    static init(vue: any): void;
    static isIdentityResolved(): boolean;
    static isAuthenticated(): boolean;
    static isInAnyRights(rights: any): boolean;
    static removeAuthenticate(): void;
    static initTokenId(token: any): void;
    static setTokenId(token: any): void;
    static getTokenId(): string;
    static clearTokenId(): void;
    static checkAndLoadIdentity(): Promise<{}>;
    static getCurrentIdentity(): any;
    static login(credentials: any): Promise<{}>;
    static logout(): void;
    static setIdentity(token: any): void;
    static initInterceptor(): void;
    static authorize(rights: string[], to: any, next: any): Promise<void>;
    static finishAuth(): void;
}
