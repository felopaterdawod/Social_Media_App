import {config} from 'dotenv'
import { resolve } from "path";


config({path:resolve(`./.env.${process.env.NODE_ENV}`)})


export const PORT = process.env.PORT


export const DB_URI = process.env.DB_URI as string
export const RESIS_DB_URI = process.env.RESIS_DB_URI as string
export const APPLICATION_NAME = process.env.APPLICATION_NAME as string
export const EMAIL_APP = process.env.EMAIL_APP as string
export const EMAIL_APP_PASSWORD = process.env.EMAIL_APP_PASSWORD as string
export const USER_ACCESS_TOKEN_SECRET_KEY = process.env.USER_ACCESS_TOKEN_SECRET_KEY as string
export const SYSTEM_ACCESS_TOKEN_SECRET_KEY = process.env.SYSTEM_ACCESS_TOKEN_SECRET_KEY as string
export const USER_REFRESH_TOKEN_SECRET_KEY = process.env.USER_REFRESH_TOKEN_SECRET_KEY as string 
export const SYSTEM_REFRESH_TOKEN_SECRET_KEY = process.env.SYSTEM_REFRESH_TOKEN_SECRET_KEY as string
export const ENC_KEY = process.env.ENC_KEY as string
export const FACEBOOK = process.env.FACEBOOK as string
export const INSTAGRAM = process.env.INSTAGRAM as string
export const TWITTER = process.env.TWITTER as string
export const ENC_IV_LENGTH = parseInt(process.env.ENC_IV_LENGTH ?? '16') 
export const ACCESS_EXPIRES_IN = parseInt(process.env.ACCESS_EXPIRES_IN ?? '1800') 
export const REFRESH_EXPIRES_IN = parseInt(process.env.REFRESH_EXPIRES_IN ?? '1800') 
export const CLIENT_IDS = (process.env.CLIENT_IDS?.split(",")||[]) as string[]


export const SALT_ROUND = parseInt(process.env.SALT_ROUND ?? '10') 