import { IUser } from "../../common/interfaces"
import { BadRequestException, ConflictException, NotFoundException } from "../../common/exceptions";
import { UserRepository } from "../../DB/repository/user.repository";
import { compareHash, generateEncryption, generateHash } from "../../common/utils/security";
import { emailEvent, emailTemplate, sendEmail } from "../../common/utils/email";
import { notificationService, NotificationService, redisService, RedisService, TokenService } from "../../common/services";
import { EmailEnum, ProviderEnum } from "../../common/enums";
import { createRandomOtp } from "../../common/utils/otp";
import { ConfirmEmailDto, LoginDto, ResendConfirmEmailDto, SignupDto } from "./auth.dto";
import { ILoginResponse } from "./auth.entity";
import { OAuth2Client, TokenPayload } from "google-auth-library";
import { CLIENT_IDS } from "../../config/config";


export class AuthenticationService {
    private readonly userRepository: UserRepository;
    private readonly redis: RedisService
    private readonly tokenService: TokenService;
    private readonly notification: NotificationService

    constructor() {
        this.userRepository = new UserRepository()
        this.tokenService = new TokenService()
        this.redis = redisService
        this.notification = notificationService
    }

    public async login(inputs: LoginDto, issuer: string): Promise<ILoginResponse> {
        const { email, password, FCM } = inputs;

        const user = await this.userRepository.findOne({
            filter: { email, provider: ProviderEnum.SYSTEM },
        });

        if (!user)
            throw new NotFoundException("Invalid Login credentials..");

        //   if (!user.isVerified)
        //     throw new ConflictException( "Please verify your email first",);

        if (!user || !user.password || !(await compareHash({ plainText: password, cipherText: user.password }))) {
            throw new NotFoundException("Invalid Login credentials.");
        }

        if (FCM) {
            await this.redis.addFCM(user._id, FCM)
            const tokens = await this.redis.getFCMs(user._id);
            if (tokens?.length) {
                await this.notification.sendNotifications({ tokens, data: { title: "Login", body: `New Login at ${new Date()}` } })

            }

        }



        return await this.tokenService.createLoginCredentials(user, issuer)
    };





    private async sendEmailOtp({ email, subject, title }: { email: string, subject: EmailEnum, title: string }) {

        const isBlockedTTL = await this.redis.ttl(this.redis.blockOtpKey({ email, subject }))
        if (isBlockedTTL > 0) {
            throw new BadRequestException(`Sorry we cannot request new otp while are blocked please try again after ${isBlockedTTL}`)
        }

        const remainingOtpTTL = await this.redis.ttl(this.redis.otpKey({ email, subject }))
        if (remainingOtpTTL > 0) {
            throw new BadRequestException(`Sorry we cannot request new otp while current otp still active please try again after ${remainingOtpTTL}`)
        }

        const maxTrial = await this.redis.get(this.redis.maxAttemptOtpKey({ email, subject }))
        if (maxTrial >= 3) {
            await this.redis.set({
                key: this.redis.blockOtpKey({ email, subject }),
                value: 1,
                ttl: 7 * 60
            })
            throw new BadRequestException("you have reached the max trial")
        }

        const code = createRandomOtp()
        await this.redis.set({
            key: this.redis.otpKey({ email, subject }),
            value: await generateHash({ plainText: `${code}` }),
            ttl: 120
        })

        emailEvent.emit("sendEmail", async () => {
            await sendEmail({
                to: email,
                subject,
                html: emailTemplate({ code, title })
            })

            await this.redis.incr(this.redis.maxAttemptOtpKey({ email, subject }))
        })

    }


    public async signup({ email, username, password, phone }: SignupDto): Promise<IUser> {

        const checkUserExist = await this.userRepository.findOne({
            filter: { email },
            projection: "email",
            options: { lean: true }
        })

        if (checkUserExist) {
            checkUserExist.email
            throw new ConflictException("Email Exist")
        }

        const user = await this.userRepository.createOne({
            data: {
                email,
                username,
                password,
                phone
            }
        })

        if (!user)
            throw new BadRequestException("Fail")


        this.sendEmailOtp({ email, subject: EmailEnum.CONFIRM_EMAIL, title: "Verify Email" })
        return user.toJSON()





    }

    public async confirmEmail({ email, otp }: ConfirmEmailDto) {

        const hashOtp = await this.redis.get(this.redis.otpKey({ email, subject: EmailEnum.CONFIRM_EMAIL }))
        if (!hashOtp) {
            throw new NotFoundException("Expired otp")
        }

        const account = await this.userRepository.findOne({
            filter: { email, confirmEmail: { $exists: false }, provider: ProviderEnum.SYSTEM }
        })
        if (!account) {
            throw new NotFoundException("Fail to find matching account")
        }

        if (!await compareHash({ plainText: otp, cipherText: hashOtp })) {
            throw new ConflictException("Invalid otp")
        }

        account.confirmEmail = new Date();
        await account.save()

        await this.redis.deleteKey(await this.redis.keys(this.redis.otpKey({ email })))

        return;
    }


    public async resendConfirmEmail({ email }: ResendConfirmEmailDto) {

        const account = await this.userRepository.findOne({
            filter: { email, confirmEmail: { $exists: false }, provider: ProviderEnum.SYSTEM }
        })



        if (!account) {
            throw new NotFoundException("Fail to find matching account")
        }

        await this.sendEmailOtp({
            email,
            subject: EmailEnum.CONFIRM_EMAIL,
            title: "Verify Email"
        })

        return;
    }

    private async verifyGoogleAccount(idToken: string): Promise<TokenPayload> {
        const client = new OAuth2Client();

        const ticket = await client.verifyIdToken({
            idToken,
            audience: CLIENT_IDS,
        });
        const payload = ticket.getPayload();

        if (!payload?.email_verified) {
            throw new BadRequestException("Fail to verify by google")

        }


        return payload;


    }



    async signupWithGmail(idToken: string, issuer: string) {

        const payload = await this.verifyGoogleAccount(idToken);


        const checkExist = await this.userRepository.findOne({
            filter: { email: payload.email as string }
        })

        if (checkExist) {
            if (checkExist.provider != ProviderEnum.GOOGLE) {
                throw new ConflictException("Invalid Login Provider")

            }
            return { status: 200, credentials: await this.loginWithGmail(idToken, issuer) };

        }

        const user = await this.userRepository.createOne({
            data: {
                firstName: payload.given_name as string,
                lastName: payload.family_name as string,
                email: payload.email as string,
                profilePicture: payload.picture as string,
                confirmEmail: new Date(),
                provider: ProviderEnum.GOOGLE

            }
        })

        return { status: 201, credentials: await this.tokenService.createLoginCredentials(user, issuer) }

    }


    async loginWithGmail(idToken: string, issuer: string) {

        const payload = await this.verifyGoogleAccount(idToken);


        const user = await this.userRepository.findOne({
            filter: { email: payload.email as string, provider: ProviderEnum.GOOGLE }
        })

        if (!user) {
            throw new NotFoundException("NOt Registered Account")

        }

        return await this.tokenService.createLoginCredentials(user, issuer)



    }

}

export default new AuthenticationService()