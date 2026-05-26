import { IStory } from "../../common/interfaces/story.interface";
import { StoryModel } from "../model";
import { DatabaseRepository } from "./base.repository";


export class StoryRepository extends DatabaseRepository<IStory> {
    constructor() {
        super(StoryModel);
    }
}