import { ReactionEnum, ReactionTargetEnum } from "../../../common/enums"
import { IAuthUser } from "../../../common/types/express.type"
import { paginateDto, paginationValidationSchema } from "../../../common/validation"
import { GQLValidation } from "../../../middleware"
import { ReactOnPostArgsDto } from "../post.dto"
import { postService, PostService } from "../post.service"
import { reactOnPostGQL } from "../post.validation"

export class PostResolver {
    private postService: PostService
    constructor() {
        this.postService = postService
    }

    postList = async (parent: unknown, args: paginateDto, { user }: IAuthUser) => {
        await GQLValidation<paginateDto>(paginationValidationSchema.query, args)
        const data = await this.postService.postList(args, user)
        return { message: "Done", data }
    }

    reactOnPost = async (parent: unknown, { postId, react }: ReactOnPostArgsDto, { user }: IAuthUser) => {
        await GQLValidation<ReactOnPostArgsDto>(reactOnPostGQL, { postId, react })
        const data = await this.postService.reactPost({ postId }, {
            type: react as unknown as ReactionEnum,
            targetType: ReactionTargetEnum.POST
        }, user)
        return { message: "Done", data }
    }
}

export const postResolver = new PostResolver()