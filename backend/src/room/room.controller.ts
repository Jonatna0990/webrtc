import { Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { RoomService } from './room.service';

@Controller('room')
export class RoomController {
	/*constructor(private readonly roomService: RoomService) {}

	@Get('all')
	getAll() {
		return this.roomService.getAllRooms();
	}

	@Get(':room')
	getRoom(
		@Param('room')
		room: string
	) {		
		return `Your room is ${room}`;
	}

	@Post('')
	createRoom() {		
		return `Create room`;
	}

	@Delete('')
	deleteRoom(
		@Param('room')
		room: string
	) {		
		return `Delete room is ${room}`;
	}


	@Get(':room/join')
	joinRoom(
		@Param('room')
		room: string
	) {		
		return `You are join to room ${room}`;
	}

	@Get(':room/left')
	leftRoom(
		@Param('room')
		room: string
	) {		
		return `You are left to room ${room}`;
	}*/
}
 