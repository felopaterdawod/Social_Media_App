import { z } from 'zod';
import { AvailabilityEnum } from '../../common/enums';
import { Types } from 'mongoose';
import { generalValidationFields } from '../../common/validation';
import { fileFieldValidation } from '../../common/utils/multer';

export const createPost = {
    body: z.strictObject({
        content: z.string().optional(),
        files: z.array(generalValidationFields.file(fileFieldValidation.image)).optional(),
        tags: z.array(z.string()).optional(),
        availability: z.coerce.number().default(AvailabilityEnum.PUBLIC)
    }).superRefine((args, ctx) => {
        if (!args.files?.length && !args.content) {
            ctx.addIssue({
                code: "custom",
                path: ['content'],
                message: "Content is required"
            })
        }

        if (args.tags?.length) {
            const uniqueTags = [...new Set(args.tags)]
            if (uniqueTags.length !== args.tags.length) {
                ctx.addIssue({
                    code: "custom",
                    path: ['tags'],
                    message: "Duplicate tags are not allowed"
                })
            }

            for (const tag of args.tags) {
                if (!Types.ObjectId.isValid(tag)) {
                    ctx.addIssue({
                        code: "custom",
                        path: ['tags'],
                        message: `Invalid tagged objectId ${tag}`
                    })
                }
            }
        }
    })
}