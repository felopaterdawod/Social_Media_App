import {z} from 'zod'

// export interface ILoginDto{
// email : string;
// password : string

import { login, signup } from "./auth.validation";



// }

export type loginDto = z.infer<typeof login.body>
export type signupDto = z.infer<typeof signup.body>



// export interface ISignupDto extends ILoginDto{
//     username : string;
// }