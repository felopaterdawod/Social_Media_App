import {
    NextFunction,
    Request,
    Response,
    Router
} from "express";

import { authentication, validation } from "../../middleware";
import {
    cloudFileUpload,
    fileFieldValidation
} from "../../common/utils/multer";

import { successResponse } from "../../common/response";

import * as validators from "./story.validation";
import {
    CreateStoryBodyDto,
    DeleteStoryParamsDto
} from "./story.dto";

import { storyService } from "./story.service";

const router = Router();

router.post(
    "/",
    authentication(),
    cloudFileUpload({
        validation: fileFieldValidation.image
    }).array("attachments", 1),

    validation(validators.createStory),

    async (req: Request,res: Response): Promise<Response> => {
        const data = await storyService.createStory(
            {
                ...req.body,
                files: req.files
            } as CreateStoryBodyDto,
            req.user
        );

        return successResponse({res,status: 201,data});
    }
);

router.get(
    "/",
    authentication(),
    async (
        req: Request,
        res: Response
    ): Promise<Response> => {
        const data = await storyService.getStories();

        return successResponse({
            res,
            status: 200,
            data
        });
    }
);

router.delete(
    "/:storyId",
    authentication(),
    validation(validators.deleteStory),

    async (
        req: Request,
        res: Response
    ): Promise<Response> => {
        const data = await storyService.deleteStory(
            req.params as DeleteStoryParamsDto,
            req.user
        );

        return successResponse({
            res,
            status: 200,
            data
        });
    }
);

export default router;