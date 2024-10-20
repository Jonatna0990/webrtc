import { UserNameSchema } from '@app/user/schema/user.schema';
import { z } from 'zod';

export const RoomNameSchemaRegex = new RegExp('^\\S+\\w$')

export const RoomNameSchema = z
  .string()
  .min(2, { message: 'Must be at least 2 characters.' })
  .max(32, { message: 'Must be at most 32 characters.' })
  .regex(RoomNameSchemaRegex, {
    message: 'Must not contain spaces or special characters.',
  })

export const JoinRoomSchema = z.object({
  roomName: RoomNameSchema,
  userName: UserNameSchema
})
