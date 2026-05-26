import { z } from "zod";
import { createStory, deleteStory } from "./story.validation";

export type CreateStoryBodyDto = z.infer<typeof createStory.body>;
export type DeleteStoryParamsDto = z.infer<typeof deleteStory.params>;