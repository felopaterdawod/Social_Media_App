import { createClient, RedisClientType } from "redis";
import { RESIS_DB_URI } from "../../config/config";
import { EmailEnum } from "../enums";
import { Types } from "mongoose";


type RedisKeytype = { email: string, subject?: EmailEnum }

export class RedisService {

    private readonly client: RedisClientType;
    constructor() {

        this.client = createClient({ url: RESIS_DB_URI })
        this.handleEvents()

    }
    private handleEvents() {
        this.client.on("error", (error) => { console.log(`REDIS ERROR ,,, ${error}`); })
        this.client.on("ready", () => { console.log(`REDIS Is Ready 🚀😎`); })

    }

    public async connect() {
        await this.client.connect()
        console.log(`Redis Is Connected 🚀😍`);


    }



    otpKey = ({ email, subject = EmailEnum.CONFIRM_EMAIL }: RedisKeytype):string => {
        return `OTP::User::${email}::${subject}`
    }

    maxAttemptOtpKey = ({ email, subject = EmailEnum.CONFIRM_EMAIL }: RedisKeytype):string => {
        return `${this.otpKey({ email, subject })}::MaxTrial`
    }

    blockOtpKey = ({ email, subject = EmailEnum.CONFIRM_EMAIL }: RedisKeytype):string => {
        return `${this.otpKey({ email, subject })}::Block`
    }

    baseRevokeTokenKey = (userId: Types.ObjectId | string):string => {
        return `RevokeToken::${userId.toString()}`
    }

    revokeTokenKey = ({ userId, jti }: { userId: Types.ObjectId | string, jti: string }):string => {
        return `${this.baseRevokeTokenKey(userId)}::${jti}`
    }



set = async ({
    key,
    value,
    ttl
}: {
    key: string,
    value: any,
    ttl?: number | undefined
}): Promise<string | null> => {
    try {
        let data = typeof value === 'string' ? value : JSON.stringify(value)
        return ttl ? await this.client.set(key, data, { EX: ttl }) : await this.client.set(key, data)
    } catch (error) {
        console.log(`Fail in redis set operation ${error}`);
        return null;
    }
}

update = async ({
    key,
    value,
    ttl
}: {
    key: string,
    value: any,
    ttl?: number | undefined
}): Promise<string | number | null> => {
    try {
        if (!await this.client.exists(key)) return 0;
        return await this.set({ key, value, ttl })
    } catch (error) {
        console.log(`Fail in redis update operation ${error}`);
        return 0;
    }
}


get = async (key: string): Promise<any> => {
    try {
        try {
            return JSON.parse(await this.client.get(key) as string)
        } catch (error) {
            return await this.client.get(key)
        }
    } catch (error) {
        console.log(`Fail in redis get operation ${error}`);
        return;
    }
}

ttl = async (key: string): Promise<number> => {
    try {
        return await this.client.ttl(key)
    } catch (error) {
        console.log(`Fail in redis ttl operation ${error}`);
        return -2;
    }
}


exists = async (key: string): Promise<number> => {
    try {
        return await this.client.exists(key)
    } catch (error) {
        console.log(`Fail in redis exists operation ${error}`);
        return -2;
    }
}

incr = async (key: string): Promise<number> => {
    try {
        return await this.client.incr(key)
    } catch (error) {
        console.log(`Fail in redis incr operation ${error}`);
        return -2;
    }
}


expire = async ({ key, ttl }: { key: string, ttl: number }): Promise<number> => {
    try {
        return await this.client.expire(key, ttl)
    } catch (error) {
        console.log(`Fail in redis add-expire operation ${error}`);
        return 0;
    }
}

mGet = async (keys: string[]): Promise<(string | null)[]> => {
    try {
        if (!keys.length) return [];
        
        
        const data = await this.client.mGet(keys);
        return data; 
        
    } catch (error) {
        console.log(`Fail in redis mGet operation ${error}`);
        return [];
    }
}

keys = async (prefix: string): Promise<string[]> => {
    try {
        return await this.client.keys(`${prefix}*`)
    } catch (error) {
        console.log(`Fail in redis keys operation ${error}`);
        return []
    }
}

deleteKey = async (key: string | string[]): Promise<number> => {
    try {
        if (!key.length) return 0;
        return await this.client.del(key)
    } catch (error) {
        console.log(`Fail in redis dell operation ${error}`);
        return 0
    }
}







}

export const redisService = new RedisService()