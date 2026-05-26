import { z } from 'zod';
import { createComment, deleteComment, reactComment, replyOnComment, updateComment } from './comment.validation';


export type CreateCommentBodyDto = z.infer<typeof createComment.body>
export type CreateCommentParamsDto = z.infer<typeof createComment.params>
export type CreateReplyOnCommentParamsDto = z.infer<typeof replyOnComment.params>


export type ReactCommentBodyDto = z.infer<typeof reactComment.body>

export type ReactCommentParamsDto = z.infer<typeof reactComment.params>

export type UpdateCommentParamsDto = z.infer<typeof updateComment.params>
export type UpdateCommentBodyDto = z.infer<typeof updateComment.body>

export type DeleteCommentParamsDto = z.infer<typeof deleteComment.params>