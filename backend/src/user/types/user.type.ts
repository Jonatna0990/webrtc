import { User } from '@app/data/user/user.interface';

export type UserType = Omit<User,'socketId'>;