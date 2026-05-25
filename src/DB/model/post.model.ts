import { models, Schema, model, Query, HydratedDocument, Types, CallbackWithoutResult, CallbackWithoutResultAndOptionalError } from "mongoose";
import { AvailabilityEnum } from "../../common/enums";
import { IPost } from "../../common/interfaces";
import { NextFunction } from "express";



const postSchema = new Schema<IPost>({

    folderId: { type: String, required: true },
    content: {
        type: String, required: function (this) {
            return !this.attachments?.length
        }
    },

    attachments: {
        type: [String],
        default: []
    },

    availability: { type: Number, enum: AvailabilityEnum, default: AvailabilityEnum.PUBLIC },
    likes: [{ type: Types.ObjectId, ref: "User" }],
    tags: [{ type: Types.ObjectId, ref: "User" }],
    updatedBy: { type: Types.ObjectId, ref: "User" },
    createdBy: { type: Types.ObjectId, ref: "User", required: true },
    deletedAt: { type: Date },
    restoredAt: { type: Date },

    isDeleted: {
        type: Boolean,
        default: false
    },



},
    {
        timestamps: true,
        toObject: { virtuals: true },
        toJSON: { virtuals: true },
        strict: true,
        strictQuery: true,
        collection: "SOCIAL_APP_POSTS"


    })

postSchema.virtual("comments", {
    localField: "_id",
    foreignField: "postId",
    ref: "Comment",
    justOne: true
})





postSchema.pre(["findOne", "find", "countDocuments"], function () {
    const query = this.getQuery()
    if (query.paranoid === false) {
        this.setQuery({ ...query })
    } else {
        this.setQuery({ ...query, deletedAt: { $exists: false } })
    }
})

postSchema.pre(["updateOne", "findOneAndUpdate"], function () {


    const update = this.getUpdate() as HydratedDocument<IPost>

    if (update.deletedAt)
        this.setUpdate({ ...update, $unset: { restoredAt: 1 } })

    if (update.restoredAt) {
        this.setUpdate({ ...update, $unset: { deletedAt: 1 } })
        this.setQuery({ ...this.getQuery(), deletedAt: { $exists: true } })

    }
    const query = this.getQuery()

    if (query.paranoid === false) {
        this.setQuery({ ...query })
    } else {
        this.setQuery({ deletedAt: { $exists: false }, ...query })
    }
})


postSchema.pre(["deleteOne", "findOneAndDelete"], function () {


    const update = this.getUpdate() as HydratedDocument<IPost>


    const query = this.getQuery()

    if (query.force === true) {
        this.setQuery({ ...query })
    } else {
        this.setQuery({ deletedAt: { $exists: true }, ...query })
    }
})




export const PostModel = models.Post || model<IPost>("Post", postSchema)
PostModel.syncIndexes()