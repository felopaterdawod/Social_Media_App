import { HydratedDocument, Types } from "mongoose";
import { IComment, IPost, IUser } from "../../common/interfaces";
import { NotificationService, notificationService, redisService, RedisService, s3Service, S3Service, TokenService } from "../../common/services";
import { CommentRepository, PostRepository, UserRepository } from "../../DB/repository";
import { BadRequestException, NotFoundException } from "../../common/exceptions";
import { randomUUID } from "node:crypto";
import { CreateCommentBodyDto, CreateCommentParamsDto, CreateReplyOnCommentParamsDto } from "./comment.dto";
import { getAvalibality } from "../../common/utils/post";

export class CommentService {

    private readonly redis: RedisService;
    private readonly tokenService: TokenService;
    private readonly userRepository: UserRepository;
    private readonly postRepository: PostRepository;
    private readonly commentRepository: CommentRepository;
    private readonly s3: S3Service;
    private readonly notification: NotificationService


    constructor() {
        this.redis = redisService
        this.tokenService = new TokenService()
        this.userRepository = new UserRepository()
        this.postRepository = new PostRepository()
        this.commentRepository = new CommentRepository()
        this.s3 = s3Service
        this.notification = notificationService

    }

    async createComment({ postId }: CreateCommentParamsDto, { content, files = [], tags }: CreateCommentBodyDto, user: HydratedDocument<IUser>): Promise<IComment> {



        const post = await this.postRepository.findOne({
            filter: {
                _id: postId,
                $or: getAvalibality(user)
            }
        }) as unknown as (HydratedDocument<IPost> & { folderId?: string }) | null;

        if (!post)
            throw new NotFoundException('Fail to find matching post')










        const mentions: Types.ObjectId[] = []
        const FCM_Tokens: string[] = []

        if (tags?.length) {
            const mentionedAccounts = await this.userRepository.find({
                filter: {
                    _id: { $in: tags }
                }
            })

            if (mentionedAccounts.length != tags.length) {
                throw new NotFoundException('Fail to find some or all mentioned accounts')
            }

            for (const tag of tags) {
                mentions.push(Types.ObjectId.createFromHexString(tag));

                (await this.redis.getFCMs(tag) || []).map(token => FCM_Tokens.push(token))
            }

        }

        const folderId = post.folderId;
        let attachments: string[] = []

        if (files?.length) {
            attachments = await this.s3.uploadAssets({
                files: files as Express.Multer.File[],
                path: `Post/${folderId}`

            })
        }

        const comment = await this.commentRepository.createOne({
            data: {
                createdBy: user._id,
                content: content as string,
                attachments,
                postId: post._id,
                tags: mentions


            }
        })

        if (!comment) {
            if (attachments.length) {
                await this.s3.deleteAssets({
                    Keys: attachments.map(ele => { return { Key: ele } })
                })
            }
            throw new BadRequestException('Faail')
        }

        if (FCM_Tokens) {
            await this.notification.sendNotifications({
                tokens: FCM_Tokens, data: {
                    title: "Post Mention",
                    body: JSON.stringify({
                        message: `${user.username} mentioned you in this comment`,
                        postId: post._id,
                        commentId: comment._id

                    })
                }
            })
        }

        return comment.toJSON()



    }

    async replyOnComment({ postId, commentId }: CreateReplyOnCommentParamsDto, { content, files = [], tags }: CreateCommentBodyDto, user: HydratedDocument<IUser>): Promise<IComment> {



        const comment = await this.commentRepository.findOne({
            filter: {
                _id: commentId,
                postId: postId,
            },
            options: { populate: { path: "postId", match: { $or: getAvalibality(user) } } }
        }) as unknown as (HydratedDocument<IComment> & { postId: HydratedDocument<IPost> & { folderId?: string } }) | null;

        if (!comment?.postId) {
            throw new NotFoundException('Fail to find matching comment')

        }




        const mentions: Types.ObjectId[] = []
        const FCM_Tokens: string[] = []

        if (tags?.length) {
            const mentionedAccounts = await this.userRepository.find({
                filter: {
                    _id: { $in: tags }
                }
            })

            if (mentionedAccounts.length != tags.length) {
                throw new NotFoundException('Fail to find some or all mentioned accounts')
            }

            for (const tag of tags) {
                mentions.push(Types.ObjectId.createFromHexString(tag));

                (await this.redis.getFCMs(tag) || []).map(token => FCM_Tokens.push(token))
            }

        }


        const post = comment.postId as HydratedDocument<IPost>;
        const folderId = post.folderId;
        let attachments: string[] = []

        if (files?.length) {
            attachments = await this.s3.uploadAssets({
                files: files as Express.Multer.File[],
                path: `Post/${folderId}`

            })
        }

        const reply = await this.commentRepository.createOne({
            data: {
                createdBy: user._id,
                content: content as string,
                attachments,
                postId: post._id,
                commentId: comment._id,
                tags: mentions


            }
        })

        if (!reply) {
            if (attachments.length) {
                await this.s3.deleteAssets({
                    Keys: attachments.map(ele => { return { Key: ele } })
                })
            }
            throw new BadRequestException('Faail')
        }

        if (FCM_Tokens) {
            await this.notification.sendNotifications({
                tokens: FCM_Tokens, data: {
                    title: "Post Mention",
                    body: JSON.stringify({
                        message: `${user.username} mentioned you in this comment`,
                        postId: post._id,
                        commentId: comment._id,
                        replyId: reply._id,

                    })
                }
            })
        }

        return reply.toJSON()


    }



}


export const commentService = new CommentService();