import { HydratedDocument } from "mongoose";
import { IUser } from "../../common/interfaces";
import { redisService, RedisService, s3Service, S3Service, TokenService } from "../../common/services";
import { LogoutEnum, StorageApproachEnum, UploadApproachEnum } from "../../common/enums";
import { ACCESS_EXPIRES_IN, REFRESH_EXPIRES_IN } from "../../config/config";
import { ConflictException, NotFoundException } from "../../common/exceptions";
import { UserRepository } from "../../DB/repository";

class UserService {
    private readonly redis: RedisService;
    private readonly tokenService: TokenService;
    private readonly userRepository: UserRepository;
    private readonly s3: S3Service;

    constructor() {
        this.redis = redisService
        this.tokenService = new TokenService()
        this.userRepository = new UserRepository()
        this.s3 = s3Service
    }

    async profileImage({ContentType, Originalname}:{ContentType:string, Originalname:string}, user: HydratedDocument<IUser>):Promise<{user:IUser, url:string}> {
        const oldPic = user.profilePicture
        const { url,key } = await this.s3.createPreSignedUploadLink({
            path: `Users/${user._id.toString()}/Profile`,
            ContentType,
            Originalname,
        }) 
        user.profilePicture = key as string
        await user.save()

        if (oldPic) {
            await this.s3.deleteAsset({Key:oldPic})
        }
        return {url,user}
    }

    async profileCoverImages(files: Express.Multer.File[], user: HydratedDocument<IUser>) {
        const oldUrls = user.ProfileCoverPictures
        const urls = await this.s3.uploadAssets({
            files,
            path: `Users/${user._id.toString()}/Profile/Cover`,
            storageApproach: StorageApproachEnum.DISK,
            uploadApproach:UploadApproachEnum.LARGE
        }) 
        user.ProfileCoverPictures = urls
        await user.save()

        if (oldUrls) {
            await this.s3.deleteAssets({
                Keys: oldUrls.map(ele => {return {Key:ele}})
            })
        }
        return user.toJSON()
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

    async deleteProfile(user:HydratedDocument<IUser>){

        const account = await this.userRepository.deleteOne({filter: {_id: user._id , force:true}})

        if (!account.deletedCount) {
            
            throw new NotFoundException("Invalid account")
        }
        await this.s3.deleteFolderByPrefix({prefix: `User/${user._id.toString()}`})

        return account

    }
}

export default new UserService()