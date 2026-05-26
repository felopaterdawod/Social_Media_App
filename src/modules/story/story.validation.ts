import { z } from "zod";
import { generalValidationFields } from "../../common/validation";
import { fileFieldValidation } from "../../common/utils/multer";

export const createStory = {
    body: z.strictObject({
        caption: z.string().optional(),
        files: z.array(generalValidationFields.file(fileFieldValidation.image)).optional()
    }).superRefine((args, ctx) => {
        if (!args.files?.length && !args.caption) {
            ctx.addIssue({
                code: "custom",
                message: "Story must contain caption or media"
            });
        }
    })
};

export const deleteStory = {
    params: z.strictObject({
        storyId: generalValidationFields.id
    })
};