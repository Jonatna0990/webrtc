import { z } from 'zod'

export const UserIdSchema = z.string().min(1).max(24);

export const UserNameSchema = z
  .string()
  .min(1, { message: 'Must be at least 1 character.' })
  .max(16, { message: 'Must be at most 16 characters.' });

