import { IRoom } from '@app/data/room/room.interface';
import { User } from '@app/data/user/user.interface';
import { Injectable } from '@nestjs/common';
import { userInfo } from 'os';

@Injectable()
export class RoomService {
	private rooms: IRoom[] = []

	public async addRoom(roomId: string, roomName: string, host: User): Promise<IRoom> {
		const room = await this.getRoomIndexByName(roomName);
		if (room === -1) {
			let room = { id:roomId, name: roomName, host, users: [host] };
			await this.rooms.push(room);
			return room;
		}
	}

	public async createRoom(room: IRoom, host: User): Promise<IRoom> | undefined{
		let rooms = await this.findRoomsByUserSocketId(host.socketId);
		if(rooms.length < parseInt(process.env.WS_USER_MAX_ROOMS)) {
			await this.rooms.push(room);
			return room;
		} 
		else return null;		
	}

	public async removeRoom(roomName: string): Promise<void> {
		const findRoom = await this.getRoomIndexByName(roomName)
		if (findRoom !== -1) {
			this.rooms.splice(findRoom, 1);
		}
	}

	public async removeRoomById(roomId: string): Promise<void> {
		const findRoom = await this.getRoomIndexById(roomId)
		if (findRoom !== -1) {
			this.rooms.splice(findRoom, 1);
		}
	}

	public async getRoomHost(roomId: string): Promise<User> {
		const roomIndex = await this.getRoomIndexById(roomId);
		if (roomIndex >=0)
			return this.rooms[roomIndex].host;
	}

	public async getRoomByIndex(index: number): Promise<IRoom> {
		 if (index >= 0 && index < this.rooms.length) {
        	return await this.rooms[index];
    	}
	}

	public async getRoomIndexByName(roomName: string): Promise<number> {
		const roomIndex = this.rooms.findIndex((room) => room?.name === roomName);
		return roomIndex;
	}

	public async getRoomIndexById(roomId: string): Promise<number> {
		const roomIndex = this.rooms.findIndex((room) => room?.id === roomId);
		return roomIndex;
	}

	public async getRoomById(roomId: string): Promise<IRoom> {
		const roomIndex = this.rooms.findIndex((room) => room?.id === roomId);
		if(roomIndex >= 0)
		{
			return await this.getRoomByIndex(roomIndex);
		}
		return null;
	}

	public async addUserToRoom(roomId: string, user: User): Promise<void> {
		const roomIndex = await this.getRoomIndexById(roomId);
		if (roomIndex !== -1) {
			this.rooms[roomIndex].users.push(user);
			const host = await this.getRoomHost(roomId);
			if (host.id === user.id) {
				this.rooms[roomIndex].host.socketId = user.socketId;
			}
		}
	}

	public async checkUserInRoomBySocketId(roomName: string, socketId: string): Promise<boolean> {
		const roomIndex = await this.getRoomIndexByName(roomName);
		if (roomIndex !== -1) {
			const room = await this.getRoomByIndex(roomIndex);
			const found = room.users.find((user) => user.socketId === socketId);
			if (found) {
				return true;
			}
		}

		return false;
	}

	public async checkUserInRoomById(roomid: string, socketId: string): Promise<boolean> {
		const roomIndex = await this.getRoomIndexById(roomid);
		if (roomIndex !== -1) {
			const room = await this.getRoomByIndex(roomIndex);
			const found = room.users.find((user) => user.socketId === socketId);
			if (found) {
				return true;
			}
		}

		return false;
	}

	public async findRoomsByUserSocketId(socketId: string): Promise<IRoom[]> {
		const filteredRooms = this.rooms.filter((room) => {
			const found = room.users.find((user) => user.socketId === socketId);
			if (found) {
				return found;
			}
		})
		return filteredRooms;
	}

	public async getUserBySocketId(socketId: string): Promise<User> {
		const foundRoom = this.rooms.find((room) => room.host.socketId === socketId);    
		if (foundRoom) {
			return foundRoom.host; // Возвращаем пользователя, если найден
		}
		return null;
	}

	public async removeUserFromAllRooms(socketId: string): Promise<void> {
		const rooms = await this.findRoomsByUserSocketId(socketId);
		for (const room of rooms) {
			await this.removeUserFromRoom(socketId, room.name);
		}
	}

	public async removeUserFromRoom(socketId: string, roomName: string): Promise<void> {
		const room = await this.getRoomIndexByName(roomName);
		if(room !== -1 ) {
			this.rooms[room].users = this.rooms[room].users.filter((user) => user.socketId !== socketId);
			if (this.rooms[room].users.length === 0) {;
				await this.removeRoom(roomName)
			}
		}		
	}

	public async removeUserFromRoomById(socketId: string, roomId: string): Promise<void> {
		const room = await this.getRoomIndexById(roomId);
		if(room >= 0) {
			this.rooms[room].users = this.rooms[room].users.filter((user) => user.socketId !== socketId);
			if (this.rooms[room].users.length === 0) {;
				await this.removeRoomById(roomId)
			}
		}		
	}

	public async getRooms(): Promise<IRoom[]> {
		return this.rooms;
	}
}
