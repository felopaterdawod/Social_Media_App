import { type NextFunction, type Request, type Response, Router } from "express";
import { successResponse } from "../../common/response";
import { authentication, } from "../../middleware/authentication.middleware";
import userService from "./user.service";
import { authorization } from "../../middleware";
import { endpoint } from "./user.authorization";
import {  StorageApproachEnum, TokenTypeEnum, UploadApproachEnum } from "../../common/enums";
import { cloudFileUpload, fileFieldValidation } from "../../common/utils/multer";

const router = Router();


router.patch("/profile-cover-images",
    authentication(),
    cloudFileUpload({
        validation:fileFieldValidation.image,
        storageApproach:StorageApproachEnum.DISK,
        
    }).array("attachments",2),
    async (req: Request, res: Response, next: NextFunction) => {
        const data = await userService.profileCoverImages(req.files as Express.Multer.File[],req.user)
        return successResponse({ res, data });
    });

    router.patch("/profile-image",
    authentication(),
    
    async (req: Request, res: Response, next: NextFunction) => {
        const data = await userService.profileImage(req.body ,req.user)
        return successResponse({ res, data });
    });

router.get("/",
    authentication(),
    authorization(endpoint.profile),
    async (req: Request, res: Response, next: NextFunction) => {
        const data = await userService.profile(req.user)
        return successResponse({ res, data });
    });


    router.post("/logout", authentication(), async (req, res, next) => {
    const status = await userService.logout(req.body, req.user, req.decoded as { jti: string, iat: number, sub: string })
    return successResponse({ res, status })
})

router.post("/rotate-token", authentication(TokenTypeEnum.REFRESH), async (req, res, next) => {
    const credentials = await userService.rotateToken(req.user, req.decoded as { jti: string, iat: number, sub: string }, `${req.protocol}://${req.get('host')}`)
    return successResponse({ res, status: 201, data: { ...credentials } })
})


router.delete("/",
    authentication(),
    
    async (req: Request, res: Response, next: NextFunction) => {
        const data = await userService.deleteProfile(req.user)
        return successResponse({ res, data });
    });

export default router;