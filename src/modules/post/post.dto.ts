import { z } from 'zod';
import { createPost, deletePost, getSinglePost, reactPost, updatePost } from './post.validation';


export type CreatePostBodyDto = z.infer<typeof createPost.body>
export type ReactPostBodyDto = z.infer<typeof reactPost.body>
export type ReactPostParamsDto = z.infer<typeof reactPost.params>

export type UpdatePostBodyDto = z.infer<typeof updatePost.body>
export type UpdatePostParamsDto = z.infer<typeof updatePost.params>
export type GetSinglePostParamsDto = z.infer<typeof getSinglePost.params>

export type DeletePostParamsDto = z.infer<typeof deletePost.params>