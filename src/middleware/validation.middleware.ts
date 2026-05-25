import  type { NextFunction, Request, Response } from "express"
import { BadRequestException } from "../common/exceptions";
import { ZodError, ZodType } from "zod";

type keyReqType = keyof Request

type SchemType = Partial<Record<keyReqType, ZodType>>

type IssuesType = Array<{
            key:keyReqType,
            issues: Array<{
                message: string,
                path:Array< (symbol | number | string | undefined | null)>
            }>
        }>
export const validation = (schema : SchemType) => {

    return (req: Request , res: Response , next: NextFunction) => {
        
        const issues: IssuesType = []

        for (const key of Object.keys(schema) as keyReqType[]) {
            if(!schema[key]) continue;
            if (req.file) {
                req.body.file = req.file
            }

             if (req.files) {
                req.body.files = req.files
            }

            const validationResult = schema[key].safeParse(req[key]);

            if (!validationResult.success) {
                const error = validationResult.error as ZodError
                issues.push({key, issues: error.issues.map(issue => {return{path:issue.path, message: issue.message}})})
            }
            
        }

        if (issues.length) {
            throw new BadRequestException("validaion Eroor", {issues})
        }

        next()
        
    }
}