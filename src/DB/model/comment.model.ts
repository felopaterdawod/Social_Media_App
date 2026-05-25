import { models, Schema, model, Query, HydratedDocument, Types } from "mongoose";
import { AvailabilityEnum } from "../../common/enums";
import { IPost } from "../../common/interfaces";
import { IComment } from "../../common/interfaces/comment.interface";
import { required } from "zod/mini";



const commentSchema = new Schema<IComment>({

    content: {
        type: String, required: function (this) {
            return !this.attachments?.length
        }
    },

    attachments: {
        type: [String],
        default: []
    },

    likes: [{ type: Types.ObjectId, ref: "User" }],
    tags: [{ type: Types.ObjectId, ref: "User" }],
    postId: [{ type: Types.ObjectId, ref: "Post", required: true }],
    commentId: [{ type: Types.ObjectId, ref: "Comment" }],
    updatedBy: { type: Types.ObjectId, ref: "User" },
    createdBy: { type: Types.ObjectId, ref: "User", required: true },
    deletedAt: { type: Date },
    restoredAt: { type: Date },



},
    {
        timestamps: true,
        toObject: { virtuals: true },
        toJSON: { virtuals: true },
        strict: true,
        strictQuery: true,
        collection: "SOCIAL_APP_POSTS"


    })


commentSchema.virtual("reply", {
    localField: "_id",
    foreignField: "commentId",
    ref: "Comment"
})




commentSchema.pre(["findOne", "find", "countDocuments"], function () {
    const query = this.getQuery()
    if (query.paranoid === false) {
        this.setQuery({ ...query })
    } else {
        this.setQuery({ ...query, deletedAt: { $exists: false } })
    }
})

commentSchema.pre(["updateOne", "findOneAndUpdate"], function () {


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


commentSchema.pre(["deleteOne", "findOneAndDelete"], function () {


    const update = this.getUpdate() as HydratedDocument<IPost>


    const query = this.getQuery()

    if (query.force === true) {
        this.setQuery({ ...query })
    } else {
        this.setQuery({ deletedAt: { $exists: true }, ...query })
    }
})



export const CommentModel = models.Comment || model<IComment>("Comment", commentSchema)
CommentModel.syncIndexes()