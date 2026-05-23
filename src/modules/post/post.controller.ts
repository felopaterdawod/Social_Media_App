import { NextFunction, Request, Response, Router } from "express";
import { authentication, validation } from "../../middleware";
import { cloudFileUpload, fileFieldValidation } from "../../common/utils/multer";
import { successResponse } from "../../common/response";
import * as validators from './post.validation'
import { postService } from "./post.service";


const router  = Router();

router.post(
    "/",
    authentication(),
    cloudFileUpload({validation: fileFieldValidation.image}).array("attachments", 2),
    validation(validators.createPost),
    async(req:Request , res:Response , next:NextFunction):Promise<Response> => {
        const data = await postService.createPost({...req.body , files: req.files}, req.user)
        return successResponse({res , status : 201 , data})
    }


)










export default router