import { IRoom } from '@app/data/room/room.interface';

export type RoomType = Omit<IRoom,'users' | 'host'> & { usersCount: number };