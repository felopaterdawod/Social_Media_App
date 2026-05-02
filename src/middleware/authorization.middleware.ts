import { NextFunction, Request, Response } from "express"
import { RoleEnum } from "../common/enums";
import { ForbiddenException } from "../common/exceptions";

export const authorization = (accessRoles: RoleEnum[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!accessRoles.includes(req.user.role)) {
            throw new ForbiddenException("Not authorized account")
        }
        
        return next()
    }
}