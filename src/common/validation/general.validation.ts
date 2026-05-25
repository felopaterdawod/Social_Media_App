import { Types } from 'mongoose';
import { z } from 'zod';



export const generalValidationFields = {

    id: z.string().refine(value => { return Types.ObjectId.isValid(value) }, "Invalid ObjectId"),
    email: z.email(),

    password: z.string().regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*\W).{8,16}$/, { error: "weak Password" }),
    username: z.string({ error: "username is mandatory" }).min(2, { error: "min is 2 char" }).max(25, { error: "max is 25" }),
    confirmPassword: z.string(),
    phone: z.string({ error: "Phone is required" }).regex(new RegExp(/^(00201|\+201|01)(0|1|2|5)\d{8}$/)),
    otp: z.string({ error: "otp is required" }).regex(new RegExp(/^\d{6}$/)),
    file: function (mimetype: string[]) {
        return z.strictObject({
            fieldname: z.string(),
            originalname: z.string(),
            encoding: z.string(),
            mimetype: z.enum(mimetype),
            buffer: z.any().optional(),
            path: z.any().optional(),
            size: z.number()
        }).superRefine((args, ctx) => {
            if (!args.path && !args.buffer) {
                ctx.addIssue({ code: "custom", message: "buffer is requried", path: ['buffer'] })
            }
        })
    }
}

export const paginationValidationSchema = {
    query: z.strictObject({
        page: z.coerce.number().optional(),
        size: z.coerce.number().optional(),
        search: z.string().optional(),
    })
}

export type paginateDto = z.infer<typeof paginationValidationSchema.query>




