import { NextFunction, Request, Response, Router } from "express";
import { authentication, validation } from "../../middleware";
import { cloudFileUpload, fileFieldValidation } from "../../common/utils/multer";
import { successResponse } from "../../common/response";
import * as validators from './comment.validation'
import { commentService } from "./comment.service";
import { CreateCommentParamsDto, CreateReplyOnCommentParamsDto, DeleteCommentParamsDto, ReactCommentBodyDto, ReactCommentParamsDto, UpdateCommentBodyDto, UpdateCommentParamsDto } from "./comment.dto";
import { IComment } from "../../common/interfaces";
import { IReaction } from "../../common/interfaces/reaction.interface";


const router = Router({ mergeParams: true });

router.post(
    "/",
    authentication(),
    cloudFileUpload({ validation: fileFieldValidation.image }).array("attachments", 2),
    validation(validators.createComment),
    async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
        const data = await commentService.createComment(req.params as CreateCommentParamsDto, { ...req.body, files: req.files }, req.user)
        return successResponse<IComment>({ res, status: 201, data })
    }

)

router.post(
    "/:commentId/reply",
    authentication(),
    cloudFileUpload({ validation: fileFieldValidation.image }).array("attachments", 2),
    validation(validators.replyOnComment),
    async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
        const data = await commentService.replyOnComment(req.params as CreateReplyOnCommentParamsDto, { ...req.body, files: req.files }, req.user)
        return successResponse<IComment>({ res, status: 201, data })
    }
)

router.patch(
    "/:commentId/react",
    authentication(),
    validation(validators.reactComment),
    async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
        const data = await commentService.reactComment(
            req.params as ReactCommentParamsDto,
            req.body as ReactCommentBodyDto,
            req.user
        );

        return successResponse({ res, status: 201, data })

    }
);

router.patch(
    "/:commentId",
    authentication(),
    validation(validators.updateComment),

    async (req: Request, res: Response, next: NextFunction): Promise<Response> => {

        const data = await commentService.updateComment(
            req.params as UpdateCommentParamsDto,
            req.body as UpdateCommentBodyDto,
            req.user
        );

        return successResponse({ res, status: 200, data });
    }
)

router.delete(
    "/:commentId",
    authentication(),
    validation(validators.deleteComment),

    async (req: Request, res: Response): Promise<Response> => {

        const data = await commentService.deleteComment(
            req.params as DeleteCommentParamsDto,
            req.user
        );

        return successResponse({
            res,
            status: 200,
            data
        });
    }
)



export default router