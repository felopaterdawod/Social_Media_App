import { Schema, model, Types, models } from "mongoose";
import { ReactionEnum, ReactionTargetEnum } from "../../common/enums";
import { IReaction } from "../../common/interfaces/reaction.interface";


const reactionSchema = new Schema({

    userId: {

        type: Types.ObjectId,

        ref: "User",

        required: true
    },

    targetId: {

        type: Types.ObjectId,

        required: true
    },

    targetType: {

        type: String,

        enum: Object.values(ReactionTargetEnum),

        required: true
    },

    type: {

        type: String,

        enum: Object.values(ReactionEnum),

        required: true
    }

}, {

    timestamps: true,

    collection: "SOCIAL_APP_REACTIONS"
});

reactionSchema.index({

    userId: 1,

    targetId: 1,

    targetType: 1

}, {

    unique: true
});


export const ReactionModel = models.Reaction || model<IReaction>("Reaction", reactionSchema)

