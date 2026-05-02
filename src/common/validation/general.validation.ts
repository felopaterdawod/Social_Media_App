import {z} from 'zod';



export const generalValidationFields = {
    email: z.email(),
    password: z.string().regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*\W).{8,16}$/, {error:"weak Password"}),
    username: z.string({error: "username is mandatory"}).min(2,{error: "min is 2 char"}).max(25,{error:"max is 25"}),
    confirmPassword: z.string(),
    phone: z.string({error:"Phone is required"}).regex(new RegExp(/^(00201|\+201|01)(0|1|2|5)\d{8}$/)),
    otp: z.string({error:"otp is required"}).regex(new RegExp(/^\d{6}$/)),
} 





