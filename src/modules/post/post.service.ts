import { HydratedDocument } from "mongoose";
import { createPostBodyDto } from "./post.dto";
import { IUser } from "../../common/interfaces";

export class PostService {

    constructor(){

    }

    async createPost({availability, content , files , tags}: createPostBodyDto, user: HydratedDocument<IUser>){



    }

}

export const postService = new PostService();