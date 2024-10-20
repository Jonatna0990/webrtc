import { Injectable, OnDestroy } from '@angular/core';
import { Socket, io } from 'socket.io-client';
import ACTIONS from './actions';
import { RoomsTypeDto } from '../../data/room/dto/shared/rooms.type.dto';
import { RoomTypeDto } from '../../data/room/dto/shared/room.type.dto';
import { RoomJoinRequestDto } from '../../data/room/dto/request/roomJoinRequest.dto';
import { OfferResuestDto } from '../../data/room/dto/request/offerRequest.dto';
import { GetOfferResponseDto } from '../../data/room/dto/response/getOfferResponse.dto';
import { AnswerRequestDto } from '../../data/room/dto/request/answerRequset.dto';
import { IceCandidateRequestDto } from '../../data/room/dto/request/iceCandidateRequest.dto';
import { IUserAuth } from '../../data/user/dto/userAuth.dto';
import { GetUserIdResponseDto } from '../../data/room/dto/response/getUserIdResponse.dto';
import { CreateRoomRequestDto } from '../../data/room/dto/request/createRoomRequest.dto';
import { AuthService } from '../auth/auth.service';
import { Subject, Subscription } from 'rxjs';
import { WebRTCResponse } from '../../data/room/dto/response/answerResponse.dto';
import { IceCandidateResponseDto } from '../../data/room/dto/response/iceCandidateResponse.dto';


@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private user: GetUserIdResponseDto | null;
  private socket: Socket;
  private host: string = 'http://localhost:3000';
  private subscriptions: Subscription[] = [];

  public shareRoomsEvent: Subject<RoomsTypeDto> = new Subject();
  public createRoomEvent: Subject<RoomTypeDto> = new Subject();
  public joinRoomEvent: Subject<RoomTypeDto> = new Subject();
  public leaveRoomEvent: Subject<RoomTypeDto> = new Subject();
  public needOfferEvent: Subject<RoomTypeDto> = new Subject();
  public getOfferEvent: Subject<GetOfferResponseDto> = new Subject();
  public userLoginEvent: Subject<GetUserIdResponseDto> = new Subject();
  public userLogoutEvent: Subject<void> = new Subject();
  public getAnswerEvent: Subject<WebRTCResponse> = new Subject();
  public getIceCandidateEvent: Subject<IceCandidateResponseDto> = new Subject();
  
  shareRoomsEventubject$ = this.shareRoomsEvent.asObservable();

  constructor(private authService: AuthService){
    this.initSocket(); 
  }
 

  checkUser() {
    if(this.authService.isAuthenticated()) {
      this.user = this.authService.getAuthData();
    }
  }

  initSocket() {

    this.checkUser();

    if(this.user) {
      this.socket = io(this.host, {query: {
          token: this.user.token        
      }});
    } else { 
      this.socket = io(this.host);
    }

    this.socket.on('connect', () => {
      console.log('Connected to gateway');
      //this.shareRooms();
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnect');
      //this.userLogoutEvent.next();
    });

    this.socket.on(ACTIONS.JOIN_ROOM, data => {
      if(data) {
        console.log('JOIN', data);
        this.joinRoomEvent.next(data);
      }
    });

    this.socket.on(ACTIONS.GET_USER_ID, data => {
      if(data) {
          this.setUserData(data);
          this.userLoginEvent.next(data);
          this.reinitializeSocket();
        }   
    });

    this.socket.on(ACTIONS.S_GET_OFFER, data => {
      if(data) {
        console.log('S_GET_OFFER', data);
        this.getOfferEvent.next(data);
      }
    });

    this.socket.on(ACTIONS.LEAVE_ROOM, data => {
      console.log('LEAVE', data);      
      this.leaveRoomEvent.next(data);
    });

    this.socket.on(ACTIONS.S_NEED_OFFER, data => {      
      if(data) {
        console.log('NEED_OFFER', data);
        this.needOfferEvent.next(data);
      }      
    });

    this.socket.on(ACTIONS.S_GET_ANSWER, data => {      
      if(data) {
        console.log('S_GET_ANSWER', data);
        this.getAnswerEvent.next(data);
      }      
    });

    this.socket.on(ACTIONS.S_GET_ICE_CANDIDATE, data => {      
      if(data) {
        console.log('S_GET_ICE_CANDIDATE', data);
        this.getIceCandidateEvent.next(data);        
      }      
    });
    
    this.socket.on(ACTIONS.CREATE_ROOM, data => {
      if (data) {
        console.log('CREATE_ROOM', data);      
        this.createRoomEvent.next(data);
      }
    });

    this.socket.on(ACTIONS.SHARE_ROOMS, (data)=> {
        if(data) {
        console.log('SHARE_ROOMS', data);
        this.shareRoomsEvent.next(data);
      }
    });
  }

  setUserData(user: GetUserIdResponseDto) {
    this.authService.login(user);
    this.user = user;
  }


  shareRooms() {
    this.sendMessage(ACTIONS.SHARE_ROOMS, { }); 
  }

  joinRoom(data: RoomJoinRequestDto ) {
    this.sendMessage(ACTIONS.JOIN_ROOM, { ...data }); 
  }

  leaveRoom(data: RoomJoinRequestDto ) {
    this.sendMessage(ACTIONS.LEAVE_ROOM, { ...data }); 
  }

  createRoom(data: CreateRoomRequestDto ) {
    //console.log('data', data);
    this.sendMessage(ACTIONS.CREATE_ROOM, { ...data }); 
  }

  sendOffer(data: OfferResuestDto) {
    this.sendMessage(ACTIONS.SEND_OFFER, { ...data }); 
  }

  sendAnswer(data: AnswerRequestDto) {
    this.sendMessage(ACTIONS.SEND_ANSWER, { ...data }); 
  }

  sendIceCandidate(data: IceCandidateRequestDto) {
    this.sendMessage(ACTIONS.SEND_ICE_CANDIDATE, { ...data }); 
  }

  login(data: IUserAuth) {
    this.sendMessage(ACTIONS.GET_USER_ID, { ...data }, false); 
  }

  logout() {
    this.sendMessage(ACTIONS.USER_LOGOUT, {}); 
    this.makeLogout();
  }

  private makeLogout() {
    this.userLogoutEvent.next();
    this.user = null;
    this.authService.logout();
    this.socket.removeAllListeners();
    this.socket.disconnect();
    this.socket.close();
    this.reinitializeSocket();
  }

  private reinitializeSocket() {
        this.socket.off(ACTIONS.JOIN_ROOM);
        this.socket.off(ACTIONS.GET_USER_ID);
        this.socket.off(ACTIONS.S_GET_OFFER);
        this.socket.off(ACTIONS.LEAVE_ROOM);
        this.socket.off(ACTIONS.S_NEED_OFFER);
        this.socket.off(ACTIONS.S_NEED_ANSWER);
        this.socket.off(ACTIONS.CREATE_ROOM);        
        this.socket.off(ACTIONS.SHARE_ROOMS);
        
        this.socket.disconnect();
        this.initSocket();
  }

  isAuthenticated(): boolean {
    return this.authService.isAuthenticated();
  }

  // Метод для отправки сообщения
  private sendMessage(action: string, msg: any, checkAuth: boolean = true) {    
    if(this.socket.active) {
      if(checkAuth) {
        if(this.isAuthenticated()) {
          this.socket.emit(action, msg);
        }
      }
      else {
        this.socket.emit(action, msg);
      }
    }    
  }
}

