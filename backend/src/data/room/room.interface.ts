import { User } from '../user/user.interface';

export interface IRoom {
	id: string;
	name: string
	host: User
	users: User[]
};