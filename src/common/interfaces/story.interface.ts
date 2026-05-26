import { Types } from "mongoose";

export interface IStory {
   userId: Types.ObjectId;
   media: string;
   caption?: string;
   expiresAt: Date;
}