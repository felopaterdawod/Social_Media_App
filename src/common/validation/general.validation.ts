import {z} from 'zod';



export const generalValidationFields = {
    email: z.email(),
    password: z.string().regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*\W).{8,16}$/, {error:"weak Password"}),
    username: z.string({error: "username is mandatory"}).min(2,{error: "min is 2 char"}).max(25,{error:"max is 25"}),
    confirmPassword: z.string()    
} 





