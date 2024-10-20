import { UserReponseInterface } from '@app/user/types/userResponse.inteface';

export interface IRoomResponse {
	id: string;
	name: string;
	host: UserReponseInterface;
	users: UserReponseInterface[];
};