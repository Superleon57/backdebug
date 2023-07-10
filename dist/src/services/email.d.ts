export declare const sendMjmlMail: ({ to, variables, subject, fileName, locale }: {
    to: any;
    variables: any;
    subject: any;
    fileName: any;
    locale: any;
}) => Promise<void>;
export declare const welcome: ({ user }: {
    user: any;
}) => Promise<void>;
export declare const sendMessage: ({ idUser, object, message }: {
    idUser: any;
    object: any;
    message: any;
}) => Promise<void>;
