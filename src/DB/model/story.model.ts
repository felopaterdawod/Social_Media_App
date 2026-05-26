import { Schema, model, models, Types } from "mongoose";
import { IStory } from "../../common/interfaces/story.interface";

const storySchema = new Schema<IStory>(
    {
        media: {
            type: String,
            required: true
        },

        caption: String,

        userId: {
            type: Types.ObjectId,
            ref: "User",
            required: true
        },

        expiresAt: {
            type: Date,
            required: true,
            index: { expires: 0 }
        }
    },
    {
        timestamps: true
    }
);

export const StoryModel =
    models.Story || model<IStory>("Story", storySchema);