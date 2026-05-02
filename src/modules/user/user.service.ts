import { HydratedDocument } from "mongoose";
import { IUser } from "../../common/interfaces";
import { redisService, RedisService, TokenService } from "../../common/services";
import { LogoutEnum } from "../../common/enums";
import { ACCESS_EXPIRES_IN, REFRESH_EXPIRES_IN } from "../../config/config";
import { ConflictException } from "../../common/exceptions";

class UserService {
    private readonly redis: RedisService;
    private readonly tokenService: TokenService;

    constructor() {
        this.redis = redisService
        this.tokenService = new TokenService()
    }

    async profile(user: HydratedDocument<IUser>): Promise<any> {
        return user.toJSON()
    }

    async logout({ flag }: { flag: LogoutEnum }, user: HydratedDocument<IUser>, { jti, iat, sub }: { jti: string, iat: number, sub: string }): Promise<number> {
        let status = 200;

        switch (flag) {
            case LogoutEnum.ALL:
                user.changeCredentialsTime = new Date();
                await user.save();

                await this.redis.deleteKey(await this.redis.keys(this.redis.baseRevokeTokenKey(sub)));
                break;

            default:
                await this.tokenService.createRevokeToken({
                    userId: sub,
                    jti,
                    ttl: iat + REFRESH_EXPIRES_IN
                });
                status = 201;
                break;
        }

        return status;
    }

    async rotateToken(user: HydratedDocument<IUser>, { sub, jti, iat }: { jti: string, iat: number, sub: string }, issuer: string) {

    if ((iat + ACCESS_EXPIRES_IN) * 1000 >= Date.now() + (30000)) {
        throw new ConflictException("Current access token still valid")
    }

    await this.tokenService.createRevokeToken({
        userId: sub,
        jti,
        ttl: iat + REFRESH_EXPIRES_IN
    })

    return await this.tokenService.createLoginCredentials(user, issuer)
}
}

export default new UserService()