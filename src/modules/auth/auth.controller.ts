import {Router, type NextFunction , type Request ,type Response } from 'express'
import authService from './auth.service'
import { successResponse } from '../../common/response'
import { ILoginResponse, ISignupResponse } from './auth.entity'
import { BadRequestException } from '../../common/exceptions'
import * as validators from './auth.validation'
import { validation } from '../../middleware'
const router = Router()

router.post('/login',
    validation(validators.login), 
    (req: Request ,res: Response , next: NextFunction): Response =>{
    
    
    
    const data = authService.login(req.body)
    return successResponse<ILoginResponse>({res, data})
})


router.post('/signup',
    validation(validators.signup),
    async (req: Request ,res: Response , next: NextFunction): Promise<Response> =>{
    
    
    const data = await authService.signup(req.body)
    return successResponse<ISignupResponse>({res, status:201, data})
})





export default router