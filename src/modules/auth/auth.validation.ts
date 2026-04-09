import {z} from 'zod';
import { generalValidationFields } from '../../common/validation';


export const login = {
    body: z.strictObject({
        email: generalValidationFields.email,
        password: generalValidationFields.password,
        
    })
}






export const signup = { 
    body: login.body.safeExtend({
        
        username: generalValidationFields.username,
        confirmPassword: generalValidationFields.confirmPassword, 
    }).refine((data)=>{
        return data.password === data.confirmPassword
    },{error: 'password mismatch with confirm password'}),

    query: z.strictObject({
        flag: z.boolean()
    })

}



