export declare const getRefreshTokenFromCookie: (req: any) => any;
export declare const getAccessTokenFromHeader: (req: any) => any;
export declare const generateToken: (user: any, secret: any, expiresIn: any) => any;
export declare const getHashedPassword: (password: any) => Promise<string>;
export declare const setRefreshCookie: (res: any, refreshToken: any) => void;
