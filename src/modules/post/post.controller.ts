import { NextFunction, Request, Response, Router } from "express";
import { authentication, validation } from "../../middleware";
import { cloudFileUpload, fileFieldValidation } from "../../common/utils/multer";
import { successResponse } from "../../common/response";
import * as validators from './post.validation'
import { paginateDto, paginationValidationSchema } from "../../common/validation";
import { DeletePostParamsDto, GetSinglePostParamsDto, ReactPostBodyDto, ReactPostParamsDto, UpdatePostBodyDto, UpdatePostParamsDto } from "./post.dto";
import { commentRouter } from "../comment";
import { postService } from "./post.service";


const router = Router();

router.use('/:postId/comment', commentRouter)

router.post(
    "/",
    authentication(),
    cloudFileUpload({ validation: fileFieldValidation.image }).array("attachments", 2),
    validation(validators.createPost),
    async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
        const data = await postService.createPost({ ...req.body, files: req.files }, req.user)
        return successResponse({ res, status: 201, data })
    }


)

router.get(
    "/",
    authentication(),
    validation(paginationValidationSchema),
    async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
        const data = await postService.postList(req.query as paginateDto, req.user)
        return successResponse({ res, status: 201, data })
    }


)


router.get(
    "/:postId",
    authentication(),
    validation(validators.getSinglePost),
    async (req: Request, res: Response, next: NextFunction): Promise<Response> => {

        const data = await postService.getSinglePost(
            req.params as GetSinglePostParamsDto,
            req.user
        );

        return successResponse({ res, status: 200, data });
    }
)


router.patch(
    "/:postId/react",
    authentication(),
    validation(validators.reactPost),

    async (req, res) => {

        const data = await postService.reactPost(
            req.params as ReactPostParamsDto,
            req.body as ReactPostBodyDto,
            req.user
        )

        return successResponse({ res, status: 200, data })
    }
)

router.patch(
    "/:postId",
    authentication(),
    cloudFileUpload({ validation: fileFieldValidation.image }).array("attachments", 2),

    validation(validators.updatePost),
    async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
        const data = await postService.updatePost(req.params as UpdatePostParamsDto, req.body as UpdatePostBodyDto, req.user)
        return successResponse({ res, status: 200, data })
    }
)


router.delete(
    "/:postId",
    authentication(),
    validation(validators.deletePost),

    async (req: Request, res: Response): Promise<Response> => {

        const data = await postService.deletePost(
            req.params as DeletePostParamsDto,
            req.user
        );

        return successResponse({ res, status: 200, data });
    }
)






export default router