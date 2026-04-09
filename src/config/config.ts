import {config} from 'dotenv'
import { resolve } from "path";


config({path:resolve(`./.env.${process.env.NODE_ENV}`)})


export const PORT = process.env.PORT


export const DB_URI = process.env.DB_URI as string
export const OTP_EMAIL = process.env.OTP_EMAIL
export const OTP_PASS = process.env.OTP_PASS
export const USER_ACCESS_TOKEN_SECRET_KEY = process.env.USER_ACCESS_TOKEN_SECRET_KEY as string
export const SYSTEM_ACCESS_TOKEN_SECRET_KEY = process.env.SYSTEM_ACCESS_TOKEN_SECRET_KEY as string
export const USER_REFRESH_TOKEN_SECRET_KEY = process.env.USER_REFRESH_TOKEN_SECRET_KEY as string 
export const SYSTEM_REFRESH_TOKEN_SECRET_KEY = process.env.SYSTEM_REFRESH_TOKEN_SECRET_KEY as string
export const ACCESS_EXPIRES_IN = parseInt(process.env.ACCESS_EXPIRES_IN ?? '1800') 
export const REFRESH_EXPIRES_IN = parseInt(process.env.REFRESH_EXPIRES_IN ?? '1800') 


export const SALT_ROUND = parseInt(process.env.SALT_ROUND ?? '10') 