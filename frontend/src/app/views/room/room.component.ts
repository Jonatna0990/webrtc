import { Component, OnInit, ViewChild, AfterViewInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MainMenuComponent } from '../../components/header/main-menu/main-menu.component';
import { StreamVideoComponent } from '../../components/room/call/stream/stream.component';
import { ConversationComponent } from '../../components/room/chat/conversation/conversation.component';
import { MembersComponent } from '../../components/room/members/members/members.component';
import { SocketService } from '../../services/socket/socket.service';
import ACTIONS from '../../services/socket/actions';
import { WebRTCService } from '../../services/webrtc/webrtc.service';
import { RoomTypeDto } from '../../data/room/dto/shared/room.type.dto';
import { IUserType } from '../../data/user/user.type';
import { NgIf, NgFor } from "@angular/common";
import { RoomCreateDto } from '../../data/room/dto/shared/roomCreate.dto';
import { RoomJoinRequestDto } from '../../data/room/dto/request/roomJoinRequest.dto';
import { Subscription } from 'rxjs';
import { RoomsTypeDto } from '../../data/room/dto/shared/rooms.type.dto';
import { GetOfferResponseDto } from '../../data/room/dto/response/getOfferResponse.dto';
import { WebRTCResponse } from '../../data/room/dto/response/answerResponse.dto';
import { IceCandidateResponseDto } from '../../data/room/dto/response/iceCandidateResponse.dto';

@Component({
  selector: 'app-room',
  standalone: true,
  imports: [MainMenuComponent, StreamVideoComponent, ConversationComponent, MembersComponent, NgFor],
  templateUrl: './room.component.html',
  styleUrl: './room.component.scss',
})
export class RoomComponent implements OnInit, AfterViewInit, OnDestroy  {

  private roomCreateData: RoomTypeDto;
  private joinRoomData: RoomJoinRequestDto;
  private useVideo: boolean = true;
  private useAudio: boolean = true;
  private stream!: MediaStream;

  private joinRoomSubscription: Subscription;
  private leaveRoomSubscription: Subscription;
  private needOfferSubscription: Subscription;
  private getOfferSubscription: Subscription;
  private getAnswerSubscription: Subscription;
  private getIceCandidateSubscription: Subscription;
  private logoutSubscription: Subscription;
  private webrtcOnIceCandidateSubscription: Subscription;
  private webrtcOnTrackSubscription: Subscription;  
  private webrtcOnOfferCreateSubscription: Subscription;
  private webrtcOnAnswerCreateSubscription: Subscription;
  private currentRoomId: string;

 @ViewChild(StreamVideoComponent) 
 streamVideoComponent!: StreamVideoComponent;  

  ngAfterViewInit() {
    this.socketService.shareRooms();      
      if(this.roomCreateData) {   
        //console.log(this.roomJoinData);
        this.setVideoStreams();
        //then(() => this.socketService.sendMessage(ACTIONS.JOIN, { roomName: this.roomJoinData.name, userName: this.roomJoinData.host.name, roomId:this.roomJoinData.room.id })).
        //catch(e => console.error('Error detting userMedia', e));  
     }
  }

  constructor(
    private router: Router, 
    private socketService: SocketService,
    private webrtcService: WebRTCService,
    private route: ActivatedRoute
  ) { 
     const navigation = this.router.getCurrentNavigation();          

      this.currentRoomId = this.route.snapshot.paramMap.get('room') || ""; 
     
      if (navigation?.extras.state) {
          const state = navigation.extras.state;
          this.roomCreateData = navigation.extras.state as RoomTypeDto;
      } else { 
        this.router.navigate(['/']);
      }

    this.webrtcOnIceCandidateSubscription = this.webrtcService.webrtcOnIceCandidateEvent.subscribe((data: RTCIceCandidateInit) => {
        this.socketService.sendIceCandidate({roomId: this.currentRoomId, iceCandidate: data});
    });

    this.webrtcOnOfferCreateSubscription = this.webrtcService.webrtcOnOfferCreateEvent.subscribe((offer: RTCSessionDescriptionInit) => {
          this.socketService.sendOffer({roomId: this.roomCreateData.room.id, offer});
    });

    this.webrtcOnAnswerCreateSubscription = this.webrtcService.webrtcOnAnswerCreateEvent.subscribe((answer: RTCSessionDescriptionInit) => {
          this.socketService.sendAnswer({roomId: this.roomCreateData.room.id, answer});
    });

    /*this.webrtcOnTrackSubscription = this.webrtcService.webrtcOnTrackEvent.subscribe((data: RTCTrackEvent)=>{
        console.log(data.streams.length);
        this.streamVideoComponent.getRemoteVideoElement().srcObject = data.streams[0];
    });*/

    this.joinRoomSubscription = this.socketService.joinRoomEvent.subscribe((data: RoomTypeDto) => {
       if(data) {
        this.roomCreateData = data;
        this.streamVideoComponent.members = data.room.users;
      }   
    });

    this.logoutSubscription = this.socketService.userLogoutEvent.subscribe(() => {
      this.socketService.leaveRoom({roomId: this.roomCreateData.room.id});
    });

    this.leaveRoomSubscription = this.socketService.leaveRoomEvent.subscribe((data: RoomTypeDto) => {
        this.roomCreateData = data; 
        this.getRoomMembers(); 
    });

    this.needOfferSubscription = this.socketService.needOfferEvent.subscribe(async (data: RoomTypeDto) => {
       await this.webrtcService.createOffer();
    });

    this.getOfferSubscription = this.socketService.getOfferEvent.subscribe(async (data: GetOfferResponseDto) => {
        await this.webrtcService.createAnswer(data.offer);
    });

    this.getAnswerSubscription = this.socketService.getAnswerEvent.subscribe(async (data: WebRTCResponse) => {
        await this.webrtcService.setRemoteDescription(data.answer);
    });

    this.getIceCandidateSubscription = this.socketService.getIceCandidateEvent.subscribe(async (data: IceCandidateResponseDto) => {
        await this.webrtcService.handleICECandidate(data.candidate);
    });
  }
  
  ngOnDestroy(): void {
    if(this.leaveRoomSubscription){ 
      this.leaveRoomSubscription.unsubscribe();
    }
    if(this.joinRoomSubscription){ 
      this.joinRoomSubscription.unsubscribe();
    }
    if(this.needOfferSubscription){ 
      this.needOfferSubscription.unsubscribe();
    }
    if(this.getOfferSubscription){ 
      this.getOfferSubscription.unsubscribe();
    }
    if(this.logoutSubscription){ 
      this.logoutSubscription.unsubscribe();
    }
    if(this.webrtcOnIceCandidateSubscription){ 
      this.webrtcOnIceCandidateSubscription.unsubscribe();
    }
    if(this.getAnswerSubscription){ 
      this.getAnswerSubscription.unsubscribe();
    }
    if(this.getIceCandidateSubscription){ 
      this.getIceCandidateSubscription.unsubscribe();
    }
    if(this.webrtcOnTrackSubscription){ 
      this.webrtcOnTrackSubscription.unsubscribe();
    }
    if(this.webrtcOnOfferCreateSubscription){ 
      this.webrtcOnOfferCreateSubscription.unsubscribe();
    }
    if(this.webrtcOnAnswerCreateSubscription){ 
      this.webrtcOnAnswerCreateSubscription.unsubscribe();
    }
    this.webrtcService.stopMediaStream();
  }

  
  ngOnInit(): void {     
    if (performance.navigation.type === performance.navigation.TYPE_RELOAD) {
      console.log('Страница была перезагружена');
    } else {
      console.log('Это обычная загрузка страницы');
    }
  }
 
 joinRoom(data: RoomJoinRequestDto ) {
    this.socketService.joinRoom({ ...data }); 
  }
  
  getRoomName(): string  {
      const roomName = this.roomCreateData?.room.name;
      return typeof roomName === 'string' && roomName.trim() !== '' ? roomName : "";
  }

  getRoomMembers(): IUserType[]  {
     const users = this.roomCreateData?.room.users;
     return Array.isArray(users) && users.length > 0 ? users : []; 
  }
   async setVideoStreams() {
    this.webrtcService.setLocalStream(this.streamVideoComponent.getLocalVideoElement());
    this.webrtcService.setRemoteStream(this.streamVideoComponent.getRemoteVideoElement());  
  }

  switchVideo() {
    this.useVideo = this.streamVideoComponent.useVideo;
    this.webrtcService.setVideoEnabled(this.useVideo);    
  }

  switchAudio() {
    this.useAudio = this.streamVideoComponent.useAudio;
    this.webrtcService.setAudioEnabled(this.useAudio);
  }

  endCall() {
    this.socketService.leaveRoom({roomId: this.currentRoomId});
    this.router.navigate(['']);
  }

}
