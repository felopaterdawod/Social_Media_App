import { IReaction } from "../../common/interfaces/reaction.interface";
import { ReactionModel } from "../model/reaction.model";
import { DatabaseRepository } from "./base.repository";

export class ReactionRepository extends DatabaseRepository<IReaction>{
    constructor(){
        super(ReactionModel)
    }
}