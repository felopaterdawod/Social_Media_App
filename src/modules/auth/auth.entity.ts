export interface ILoginResponse { 
    email: string,
    password: string
}


export interface ISignupResponse extends ILoginResponse { 
    username:string;
    _id:string
}