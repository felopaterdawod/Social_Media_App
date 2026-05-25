import { HydratedDocument, Types } from "mongoose";
import { CreatePostBodyDto, ReactPostParamsDto, ReactPostQueryDto, UpdatePostBodyDto, UpdatePostParamsDto } from "./post.dto";
import { IPaginate, IPost, IUser } from "../../common/interfaces";
import { NotificationService, notificationService, redisService, RedisService, s3Service, S3Service, TokenService } from "../../common/services";
import { PostRepository, UserRepository } from "../../DB/repository";
import { BadRequestException, NotFoundException } from "../../common/exceptions";
import { randomUUID } from "node:crypto";
import { getAvalibality } from "../../common/utils/post";
import { paginateDto } from "../../common/validation";
import { toObjectId } from "../../common/utils/objectId";
import { populate } from "dotenv";

export class PostService {

    private readonly redis: RedisService;
    private readonly tokenService: TokenService;
    private readonly userRepository: UserRepository;
    private readonly postRepository: PostRepository;
    private readonly s3: S3Service;
    private readonly notification: NotificationService


    constructor() {
        this.redis = redisService
        this.tokenService = new TokenService()
        this.userRepository = new UserRepository()
        this.postRepository = new PostRepository()
        this.s3 = s3Service
        this.notification = notificationService

    }

    async createPost({ availability, content, files, tags }: CreatePostBodyDto, user: HydratedDocument<IUser>): Promise<IPost> {

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

        const folderId = randomUUID()
        let attachments: string[] = []

        if (files?.length) {
            attachments = await this.s3.uploadAssets({
                files: files as Express.Multer.File[],
                path: `Post/${folderId}`

            })
        }

        const post = await this.postRepository.createOne({
            data: {
                createdBy: user._id,
                content: content as string,
                attachments,
                folderId,
                availability,
                tags: mentions


            }
        })

        if (!post) {
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
                        message: `${user.username} mentioned you in this post`,
                        postId: post._id

                    })
                }
            })
        }

        return post.toJSON()



    }




    async postList({ search, page, size }: paginateDto, user: HydratedDocument<IUser>): Promise<IPaginate<IPost>> {

        const posts = await this.postRepository.paginate({
            filter: {
                $or: getAvalibality(user),
                ...(search?.length ? { content: { $regex: search, $options: "i" } } : {})

            }, page, size,
            options: {
                populate: [{ path: "comments" , populate: [{path:"reply" , populate: [{path:"reply"}]}] }]
            }
        })


        return posts

    }


    async reactPost({ postId }: ReactPostParamsDto, { react }: ReactPostQueryDto, user: HydratedDocument<IUser>): Promise<IPost> {

        const post = await this.postRepository.findOneAndUpdate({
            filter: {
                _id: postId,
                $or: getAvalibality(user),
            },
            update: {
                ...(Number(react) > 0 ? { $addToSet: { likes: user._id } } : { $pull: { likes: user._id } })
            }
        })

        if (!post) {
            throw new NotFoundException("Fail to find matching post")
        }
        return post.toJSON()

    }


    async updatePost({ postId }: UpdatePostParamsDto, { availability, content, files = [], tags = [], removeFiles = [], removeTags = [] }: UpdatePostBodyDto, user: HydratedDocument<IUser>): Promise<IPost> {

        const post = await this.postRepository.findOne({
            filter: { _id: postId, createdBy: user._id }
        }) as unknown as (HydratedDocument<IPost> & { content?: string; attachments?: string[] }) | null


        if (!post) {
            throw new NotFoundException("Fail to find matching post")
        }

        if (!post.content && !content && !files?.length && post.attachments?.length == removeFiles.length) {
            throw new BadRequestException("We cannot leave empty post")
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
                mentions.push(toObjectId(tag));

                (await this.redis.getFCMs(tag) || []).map(token => FCM_Tokens.push(token))
            }

        }

        const folderId = post.folderId
        let attachments: string[] = []

        if (files?.length) {
            attachments = await this.s3.uploadAssets({
                files: files as Express.Multer.File[],
                path: `Post/${folderId}`

            })
        }

        const updatePost = await this.postRepository.findOneAndUpdate({
            filter: { _id: postId, createdBy: user._id },
            update: [
                {
                    $set: {
                        content: content || post.content,
                        availability: Number(availability || post.availability),
                        updatedBy: user._id,
                        attachments: {
                            $setUnion: [
                                {
                                    $setDifference: [
                                        "$attachments",
                                        removeFiles
                                    ]
                                },
                                attachments
                            ]
                        },
                        tags: {
                            $setUnion: [
                                {
                                    $setDifference: [
                                        "$tags",
                                        removeTags.map(ele => { return toObjectId(ele) })
                                    ]
                                },
                                mentions
                            ]
                        }



                    }
                }
            ]
        })

        if (!updatePost) {
            if (attachments.length) {
                await this.s3.deleteAssets({
                    Keys: attachments.map(ele => { return { Key: ele } })
                })
            }
            throw new BadRequestException('Fail')
        }

        if (removeFiles.length) {

            await this.s3.deleteAssets({
                Keys: removeFiles.map(ele => { return { Key: ele } })
            })

        }

        if (FCM_Tokens) {
            await this.notification.sendNotifications({
                tokens: FCM_Tokens, data: {
                    title: "Post Mention",
                    body: JSON.stringify({
                        message: `${user.username} mentioned you in this post`,
                        postId: post._id

                    })
                }
            })
        }

        return updatePost.toJSON()


    }





}

export const postService = new PostService();