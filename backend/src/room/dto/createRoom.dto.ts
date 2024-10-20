import { IsNotEmpty } from 'class-validator';

export class CreateRoomDto {
	@IsNotEmpty()
	readonly room: string;

	@IsNotEmpty()
	readonly name: string;
}