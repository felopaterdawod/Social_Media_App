import { z } from 'zod';
import { changePassword } from './user.validation';




export type ChangePasswordDto = z.infer<typeof changePassword.body>;