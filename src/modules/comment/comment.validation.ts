import { z } from 'zod';
import { generalValidationFields } from '../../common/validation';
import { fileFieldValidation } from '../../common/utils/multer';
import { ReactionEnum, ReactionTargetEnum } from '../../common/enums';

export const createComment = {
    params: z.strictObject({
        postId: generalValidationFields.id
    }),
    body: z.strictObject({
        content: z.string().optional(),
        files: z.array(generalValidationFields.file(fileFieldValidation.image)).optional(),
        tags: z.array(generalValidationFields.id).optional(),
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

            
        }
    })
}

export const replyOnComment = {
    params: z.strictObject({
        postId: generalValidationFields.id,
        commentId: generalValidationFields.id
    }),
    body: createComment.body
}


export const reactComment = {

    params: z.strictObject({
        postId: generalValidationFields.id,


        commentId: generalValidationFields.id

    }),

    body: z.strictObject({

        targetType: z.enum(ReactionTargetEnum),

        type: z.enum(ReactionEnum)

    })
}

export const updateComment = {
    params: z.strictObject({
        postId: generalValidationFields.id,
        commentId: generalValidationFields.id
    }),

    body: z.strictObject({
        content: z.string().min(1)
    })
}

export const deleteComment = {
    params: z.strictObject({
        postId: generalValidationFields.id,
        commentId: generalValidationFields.id
    })
}