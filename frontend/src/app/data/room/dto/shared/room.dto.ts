import { IUserType } from '../../../user/user.type';

export interface RoomDto {
	id: string,
	name: string,
	host: IUserType,
	users: IUserType[]
}