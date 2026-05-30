import { HydratedDocument } from "mongoose"
import userService, { UserService } from "../user.service"
import { IUser } from "../../../common/interfaces"
import { JwtPayload } from "jsonwebtoken"
import { IAuthUser } from "../../../common/types/express.type"
import { GQLAuthorization, GQLValidation } from "../../../middleware"
import { endpoint } from "../user.authorization"
import { profileGQL } from "../user.validation"

export class UserResolver {
    private userService: UserService
    constructor() {
        this.userService = userService
    }

    profile = async (parent: unknown, args: { search?: string }, { user }: IAuthUser) => {

        await GQLAuthorization(endpoint.profile , user)
        await GQLValidation<{ search?: string }>(profileGQL , args)
        const data = await this.userService.profile(user)

        return { message: `Hello`, data }
    }
}
export const userResolver = new UserResolver()