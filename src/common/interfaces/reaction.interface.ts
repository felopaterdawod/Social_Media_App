import { Types } from "mongoose";
import { ReactionEnum, ReactionTargetEnum } from "../enums";

export interface IReaction {

   userId: Types.ObjectId;

   targetId: Types.ObjectId;

   targetType: ReactionTargetEnum;

   type: ReactionEnum;
}