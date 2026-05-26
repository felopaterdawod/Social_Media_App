import { randomUUID } from "node:crypto";
import { HydratedDocument } from "mongoose";
import {S3Service,s3Service} from "../../common/services";
import { StoryRepository } from "../../DB/repository";
import { NotFoundException } from "../../common/exceptions";
import {CreateStoryBodyDto,DeleteStoryParamsDto} from "./story.dto";
import { IStory, IUser } from "../../common/interfaces";

export class StoryService {
    private readonly storyRepository: StoryRepository;
    private readonly s3: S3Service;

    constructor() {
        this.storyRepository = new StoryRepository();
        this.s3 = s3Service;
    }

    async createStory({ caption, files }: CreateStoryBodyDto,user: HydratedDocument<IUser>): Promise<IStory> {
        const folderId = randomUUID();
        let attachments: string[] = [];

        if (files?.length) {
            attachments = await this.s3.uploadAssets({
                files: files as Express.Multer.File[],
                path: `Story/${folderId}`
            });
        }

        const story = await this.storyRepository.createOne({
            data: {
                userId: user._id,
                media: attachments[0],
                caption,
                expiresAt: new Date(
                    Date.now() + 24 * 60 * 60 * 1000
                )
            }
        });

        return story.toJSON();
    }

    async getStories() {
        return await this.storyRepository.find({
            filter: {
                expiresAt: { $gt: new Date() }
            },
            options: {
                populate: [
                    {
                        path: "userId",
                        select: "username profilePic"
                    }
                ]
            }
        });
    }

    async deleteStory(
        { storyId }: DeleteStoryParamsDto,
        user: HydratedDocument<IUser>
    ) {
        const story = await this.storyRepository.findOne({
            filter: {
                _id: storyId,
                userId: user._id
            }
        });

        if (!story) {
            throw new NotFoundException(
                "Fail to find matching story"
            );
        }

        await this.storyRepository.deleteOne({
            filter: { _id: storyId }
        });

        return {
            message: "Story deleted successfully"
        };
    }
}

export const storyService = new StoryService();