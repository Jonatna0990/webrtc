import ACTIONS from '@app/data/events/socket/actions';
import { ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer, WsResponse } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, UseGuards } from '@nestjs/common';
import { JoinRoomDto } from '@app/room/dto/roomSchema.dto';
import { v4 as uuidv4 } from 'uuid';
import { RoomService } from '@app/room/room.service';
import { RoomType } from '@app/room/types/room.type';
import { IRoom } from '@app/data/room/room.interface';
import { IRoomResponse } from '@app/data/room/roomResponse.interface';
import { OfferDto } from '@app/room/dto/offer.dto';
import { WsCreateRoomDto } from './dto/wsCreateRoom.dto';
import { AnswerDto } from '@app/room/dto/answer.dto';
import { UserService } from '@app/user/user.service';
import { IUserAuth } from '@app/data/user/userAuth.dto';
import { UserCreateDto } from '@app/user/dto/userCreate.dto';
import { IceCandidateResponseDto } from './dto/iceCandidateResponse.dto';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class EventsGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayConnection {

	constructor(
		private roomService: RoomService,
		private userService: UserService
	) {}
	afterInit(server: any) {
		
	}

  	@WebSocketServer() server: Server = new Server();
	private logger = new Logger('ChatGateway');

	handleConnection(client: Socket){
		this.logData('CONNECT',`${client.id} is connected`);
		//this.shareRoomsInfo();
	}

	async handleDisconnect(client: Socket){
		//this.server.emit(ACTIONS.SHARE_ROOMS, []);
		this.logData('DISCONNECT',`${client.id} is disconnected`);
		await this.roomService.removeUserFromAllRooms(client.id);
		//await this.shareRoomsInfo();
	}

	//Share rooms
	@SubscribeMessage(ACTIONS.SHARE_ROOMS)
  	async shareRooms(		
		@ConnectedSocket() 
		user: Socket,

		@MessageBody() 
		data: any
	): Promise<void> {
		const { query } = user.handshake;
		const token = query?.token;

		const verifiedUser = this.validateAndVerifyToken(token);
		if (!verifiedUser) {						
			this.showError(user, 'invalid token');
			return;
		} 	

	 this.logData(ACTIONS.SHARE_ROOMS, `user ${user.id}`);	

		await this.shareRoomsInfo();
  	} 

	//Получение токена и ид
	@SubscribeMessage(ACTIONS.GET_USER_ID)
  	async getUserId(		
		@ConnectedSocket() 
		user: Socket,

		@MessageBody() 
		data: IUserAuth
	): Promise<void> {
		if(data.name) {
			this.logData(ACTIONS.GET_USER_ID, `${user.id} get id`);	
			let response = this.userService.buildUserResponse({id: user.id, name: data.name });
			user.emit(ACTIONS.GET_USER_ID, {...response} );
		}
		else {
			this.showError(user, 'invalid userName');
		}
  	} 

	
	//Создание комнаты
	@SubscribeMessage(ACTIONS.CREATE_ROOM)
  	async createRoom(
		@ConnectedSocket() 
		user: Socket,

		@MessageBody() 
		data: WsCreateRoomDto
	): Promise<void> {
	 	const { query } = user.handshake;
		const token = query?.token;

		const verifiedUser = this.validateAndVerifyToken(token);
		if (!verifiedUser) {						
			this.showError(user, 'invalid token');
			return;
		} 	 

		this.logData(ACTIONS.CREATE_ROOM, `${user.id} create room ${data.name}`);
		if(data.name) {

			this.logData(ACTIONS.CREATE_ROOM, `${user.id} create room ${data.name}`);	
			let userCheck = await this.roomService.getUserBySocketId(user.id);

			if(userCheck) {
				this.logData(ACTIONS.CREATE_ROOM, `${user.id} user already exist`);	
			}
			else {
				this.logData(ACTIONS.CREATE_ROOM, `${user.id} create user`);	
				userCheck = { id:uuidv4(), userName:verifiedUser.name, socketId:user.id }; 				
			}

			let newRoom = { id:uuidv4(), name: data.name, host:userCheck, users: [userCheck] };
			this.logData(ACTIONS.JOIN_ROOM, `${user.id} join to room ${newRoom.id}`);	
			let room = await this.roomService.createRoom(newRoom, userCheck);	
			if(!room) {
				this.showError(user, 'max room created');
			}

			let responseRoom = this.transformRoom(room);
			user.emit(ACTIONS.CREATE_ROOM, { room:{...responseRoom} });
			user.join(room.id);
			this.server.sockets.in(room.id).emit(ACTIONS.JOIN_ROOM, { room:{...responseRoom} });
			await this.shareRoomsInfo();
		}
		else {
			this.showError(user, 'invalid roomName');
		}
	}

	private validateAndVerifyToken(token: any): UserCreateDto | null {
		if (!this.validateToken(token)) {
			return null;
		}
    	const tokenString = Array.isArray(token) ? token[0] : token;
    	return this.userService.verifyJwt(tokenString);
	}

	private validateToken(token: any): boolean {
		return !!token; // Проверяем, что токен существует
	}

	async needOffer(roomId: string, user: Socket, name: string) {
		let room = await this.roomService.getRoomById(roomId);
		if(room) {
			if(room.users.length <= 1) {
				return;
			}
			else {
				this.logData(ACTIONS.S_NEED_OFFER, `from user ${user.id}---${name} for room ${room.id}`);	
				let responseRoom = this.transformRoom(room);
				user.emit(ACTIONS.S_NEED_OFFER, { room:{...responseRoom}});
			}			
		}
	}


	//Join
	@SubscribeMessage(ACTIONS.JOIN_ROOM)
	//@UsePipes(new WsZodValidationPipe(JoinRoomSchema))
  	async join(
		@ConnectedSocket() 
		user: Socket,

		@MessageBody() 
		data: JoinRoomDto
	): Promise<void> {

		const { query } = user.handshake;
		const token = query?.token;

		const verifiedUser = this.validateAndVerifyToken(token);
		if (!verifiedUser) {						
			this.showError(user, 'invalid token');
			return;
		} 	 

		if(data.roomId) {
			this.logData(ACTIONS.JOIN_ROOM, `${user.id} join to room ${data.roomId}`);	
			let userCheck = await this.roomService.getUserBySocketId(user.id);

			//нужно проверять, создан ли пользователь
			if(!userCheck) {
				this.logData(ACTIONS.JOIN_ROOM, `${user.id} create user`);	
				userCheck = { id:uuidv4(), userName:verifiedUser.name, socketId:user.id }; 				
			}

			//подключение к существующей комнате		
			let room = await this.roomService.getRoomById(data.roomId);
			if(room) {
				//надо проверить пользователь уже зашел в комнату
				let finded = await this.roomService.checkUserInRoomById(room.id, user.id);

				if(!finded) {
					this.logData(ACTIONS.JOIN_ROOM,`${user.id} join to room ${data.roomId}`);	
					await this.roomService.addUserToRoom(data.roomId, userCheck);	
					user.join(room.id);					
				}
				else {
					this.logData(ACTIONS.JOIN_ROOM,`${user.id} already join to room ${data.roomId}`);	
				}

				let responseRoom = this.transformRoom(room);

				this.server.to(room.id).emit(ACTIONS.JOIN_ROOM, { room:{...responseRoom}});
				this.needOffer(room.id, user, verifiedUser.name)

			}
			else {
				this.showError(user, 'invalidate roomId');
				return;
			}

			/*let roomIndex = await this.roomService.getRoomIndexByName(data.roomName);
			let room = await this.getRoomInfo(roomIndex);

			if(!room) {
				this.logData(ACTIONS.JOIN,`room ${data.roomName} is not exist, creating...`);	
				room = await this.roomService.addRoom(data.roomName, newUser);		

			} else {
				this.logData(ACTIONS.JOIN,`room ${data.roomName} already exist`);					
			}


			console.log(data.roomName);
			//надо проверить пользователь уже зашел в комнату
			let finded = await this.roomService.checkUserInRoomById(user.id, room.id);

			if(!finded) {
				this.logData(ACTIONS.JOIN,`${user.id} join to room ${data.roomName}`);	
				await this.roomService.addUserToRoom(data.roomName, newUser);	
				user.join(room.id);
			}
			else {
				this.logData(ACTIONS.JOIN,`${user.id} already join to room ${data.roomName}`);	
			}*/


			/*if(roomIndex >= 0) {
				this.logData(ACTIONS.JOIN,`room ${data.roomName} already exist`);	

				//надо проверить пользователь уже зашел в комнату
				let finded = await this.roomService.checkUserInRoomBySocketId(user.id, data.roomName);

				if(!finded) {
					await this.roomService.addUserToRoom(data.roomName, newUser);	
					user.join(room.id);
				}
				else {
					this.logData(ACTIONS.JOIN,`${user.id} already join to room ${data.roomName}`);	
				}
			} else {
				this.logData(ACTIONS.JOIN,`room ${data.roomName} is not exist, creating...`);	
				await this.roomService.addRoom(data.roomName, newUser);		
				roomIndex = await this.roomService.getRoomIndexByName(data.roomName);		
			} 				

			user.emit(ACTIONS.JOIN, {
				room
			});


			//TODO
			//Надо разослать данные оффера для тех, кто только подключился

			this.server.to(room.id).emit('test', 'need-offer');

			//Уведомления для другх о подключении нового участника
			//UPDATE_MEMBERS

			delete newUser.socketId;
			this.server.to(room.id).emit(ACTIONS.UPDATE_MEMBERS, room);*/

		} else {
			this.showError(user, 'invalidate data');
			return;
		}
		

		/*const { rooms: joinedRooms } = client;

		if (Array.from(joinedRooms).includes(data.room)) {
      		console.warn(`Already joined to ${data.room}`);
    	}
	
		const clients = Array.from(this.server.sockets.adapter.rooms.get(data.room) || []);

		clients.forEach(clientID => {
			this.server.to(clientID).emit(ACTIONS.ADD_PEER, {
				peerID: client.id,
				createOffer: false
		});

		//оффер должна создавать только та сторона, которая подключается 
		client.emit(ACTIONS.ADD_PEER, {
				peerID: clientID,
				createOffer: true,
			});
		});

		client.join(data.room);
		this.shareRoomsInfo();*/
  	}

	//Получение оффера
	@SubscribeMessage(ACTIONS.SEND_OFFER)
  	async receiceOffer(
		@ConnectedSocket() 
		user: Socket,

		@MessageBody() 
		data: OfferDto
	): Promise<void> {

		const { query } = user.handshake;
		const token = query?.token;

		const verifiedUser = this.validateAndVerifyToken(token);
		if (!verifiedUser) {						
			this.showError(user, 'invalid token');
			return;
		} 	

		if(data.roomId && data.offer) {
			this.logData(ACTIONS.SEND_OFFER, `user ${user.id} send offer to room ${data.roomId}`);	
			let room = await this.roomService.getRoomById(data.roomId);
			if(room) {
				//Надо проверить пользователь в комнате
				let userInRoom = await this.roomService.checkUserInRoomById(room.id, user.id);
				if(userInRoom) {
					//Отправка оффера всем, кроме отправителя
					user.to(room.id).emit(ACTIONS.S_GET_OFFER, { roomId: room.id, offer: data.offer, userId: verifiedUser.id, sid: user.id });

				 	//this.server.to(room.id).emit(ACTIONS.GET_OFFER, { roomId: room.id, offer: data.offer });
				 	return;
				}
			}
		}
		this.showError(user, 'invalidate data');
	}

	//Получение ответа
	@SubscribeMessage(ACTIONS.SEND_ANSWER)
  	async receiceAnswer(
		@ConnectedSocket() 
		user: Socket,

		@MessageBody() 
		data: AnswerDto
	): Promise<void> {

		const { query } = user.handshake;
		const token = query?.token;

		const verifiedUser = this.validateAndVerifyToken(token);
		if (!verifiedUser) {						
			this.showError(user, 'invalid token');
			return;
		} 	

		if(data.roomId && data.answer) {
			this.logData(ACTIONS.SEND_ANSWER, `user ${user.id} send answer to room ${data.roomId}`);	
			let room = await this.roomService.getRoomById(data.roomId);
			if(room) {
				//Надо проверить пользователь в комнате
				let userInRoom = await this.roomService.checkUserInRoomById(room.id, user.id);
				if(userInRoom) {
					//Отправка ответа всем, кроме отправителя
					user.to(room.id).emit(ACTIONS.S_GET_ANSWER, { roomId: room.id, answer: data.answer, userId: verifiedUser.id, sid: user.id });
					
				 	//this.server.to(room.id).emit(ACTIONS.GET_OFFER, { roomId: room.id, offer: data.offer });
				 	return;
				}
			}
		}
		this.showError(user, 'invalidate data');
	}

	@SubscribeMessage(ACTIONS.LEAVE_ROOM)
  	async leave(		
		@ConnectedSocket() 
		user: Socket,

		@MessageBody() 
		data: JoinRoomDto
	) {		

		const { query } = user.handshake;
		const token = query?.token;

		const verifiedUser = this.validateAndVerifyToken(token);
		if (!verifiedUser) {						
			this.showError(user, 'invalid token');
			return;
		} 	

		if(data.roomId) {
			
			let room = await this.roomService.getRoomById(data.roomId);
			if(room) { 
				await this.leaveRoom(user, room.id);
				let responseRoom = this.transformRoom(room);
				this.server.sockets.in(data.roomId).emit(ACTIONS.LEAVE_ROOM, { room: {...responseRoom} });	
				await this.shareRoomsInfo();
			}
		}
  	} 

	@SubscribeMessage(ACTIONS.USER_LOGOUT)
  	async logout(		
		@ConnectedSocket() 
		user: Socket
	) {

		const { query } = user.handshake;
		const token = query?.token;

		const verifiedUser = this.validateAndVerifyToken(token);
		if (!verifiedUser) {						
			this.showError(user, 'invalid token');
			return;
		} 	

		this.logData(ACTIONS.USER_LOGOUT, `user ${user.id}---${verifiedUser.name} makes logout`);	

		let userRooms = await this.roomService.findRoomsByUserSocketId(user.id);
		userRooms.forEach(async room => {
			await this.leaveRoom(user, room.id);
			let responseRoom = this.transformRoom(room);
			this.server.sockets.in(room.id).emit(ACTIONS.LEAVE_ROOM, { room: {...responseRoom} });		
			await this.shareRoomsInfo();
		});
	}

	@SubscribeMessage(ACTIONS.RELAY_ICE)
  	relayIce(		
		@ConnectedSocket() 
		user: Socket,

		@MessageBody() 
		data: any
	) {
		const { query } = user.handshake;
		const token = query?.token;

		const verifiedUser = this.validateAndVerifyToken(token);
		if (!verifiedUser) {						
			this.showError(user, 'invalid token');
			return;
		} 	

		console.log('relayIce', data);		
		
		this.server.to(data.peerID).emit(ACTIONS.ICE_CANDIDATE, {
			peerID: user.id,
			iceCandidate: data.iceCandidate,
    	});
  	} 

	@SubscribeMessage(ACTIONS.SEND_ICE_CANDIDATE)
  	async iceCandidate(		
		@ConnectedSocket() 
		user: Socket,

		@MessageBody() 
		data: IceCandidateResponseDto
	) {

		const { query } = user.handshake;
		const token = query?.token;

		const verifiedUser = this.validateAndVerifyToken(token);
		if (!verifiedUser) {						
			this.showError(user, 'invalid token');
			return;
		} 	

		this.logData(ACTIONS.SEND_ICE_CANDIDATE, `user ${user.id}---${verifiedUser.name} send ice candidate`);	

		if(data.roomId) {
			
			let room = await this.roomService.getRoomById(data.roomId);
			if(room) { 
				this.server.sockets.in(room.id).emit(ACTIONS.S_GET_ICE_CANDIDATE, {
					userId: user.id,
					userName: verifiedUser.name,
					candidate: data.iceCandidate
				});
			}
		}
  	}

	removeUserFromRoomById(room: IRoom, userId: string): void {
		room.users = room.users.filter(user => user.socketId !== userId);
	}	

	async getRooms(): Promise<RoomType[]> {
		const rooms = await this.roomService.getRooms();
		return rooms.map(room=> this.transformRoomToRoomType(room));		 

		//TODO
		//Доработать логику удаления пользователя из канала, а именно
		//Подсчет количества пользователей в комнате при выходе пользователя из канала - V
		//Удаление комнаты если вышел последний пользователь
	}


	async getRoomInfo(index: number): Promise<IRoomResponse> {
		const room = await this.roomService.getRoomByIndex(index);
		return this.transformRoom(room);
	}

	transformRoom(room: IRoom): IRoomResponse {
	  return {
			id: room.id,
			name: room.name,
			host: {
				id: room.host.id,
				name: room.host.userName // Используем userName для поля name в UserReponseInterface
			},
			users: room.users.map(user => ({
				id: user.id,
				name: user.userName // Используем userName для поля name в UserReponseInterface
			}))
    	};
	}

	transformRoomToRoomType(room: IRoom): RoomType {
		return {
			id: room.id,
			name: room.name,
			usersCount: room.users.length // подсчет количества пользователей
		};
	}
	
	async shareRoomsInfo() {
		let rooms = await this.getRooms();
		this.logData(ACTIONS.SHARE_ROOMS,`share ${rooms.length} room(s)`);	
		this.server.emit(ACTIONS.SHARE_ROOMS, {	rooms })		
	}	

	async leaveRoom(client: Socket, roomId: string) {
		this.logData(ACTIONS.LEAVE_ROOM, `user ${client.id} leaves room ${roomId}`);
		await this.roomService.removeUserFromRoomById(client.id, roomId);
		client.leave(roomId);
  	}

  private logData(action: string, data: string) {
		this.logger.debug(`${action.toUpperCase()}: ${data}`);	
  }
  
  private showError(user: Socket, msg: string): void {
	this.logData(ACTIONS.ERROR, msg);
	user.emit(ACTIONS.ERROR, msg);
  }
}
