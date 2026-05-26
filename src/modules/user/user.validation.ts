import z from "zod";
import { generalValidationFields } from "../../common/validation";




export const changePassword = {
    body : z.strictObject({
        oldPassword : generalValidationFields.password ,
        newPassword : generalValidationFields.password ,
        confirmPassword : generalValidationFields.password ,
    }).refine((data) => data.newPassword === data.confirmPassword, {
      message: "Passwords do not match",
      path: ["confirmPassword"],
    }),
}


export const updateProfile ={
  body: z.strictObject({
    userName: generalValidationFields.username,
    phone: generalValidationFields.phone,
    gender: z.enum(["male", "female"]).optional()
    
    ,
  
}),
}