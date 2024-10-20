import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WebRTCService {
 peerConnection: RTCPeerConnection;
 //private localVideoStream: MediaStream;
 //private localAudioStream: MediaStream;
 private localStream: MediaStream;
 private localStreamElement: HTMLVideoElement;
 private remoteStream: MediaStream;
 private remoteStreamElement: HTMLVideoElement;

 public webrtcOnIceCandidateEvent: Subject<RTCIceCandidateInit> = new Subject();
 //public webrtcOnTrackEvent: Subject<RTCTrackEvent> = new Subject();
 public webrtcOnOfferCreateEvent: Subject<RTCSessionDescriptionInit> = new Subject();
 public webrtcOnAnswerCreateEvent: Subject<RTCSessionDescriptionInit> = new Subject();

 private remoteDescriptionSet: boolean = false;
 private useAudio: boolean = true;
 private useVideo: boolean = true;
 
 //RTCSessionDescriptionInit
  private stunServers: RTCIceServer[] = [
  /*  {urls:'stun:stun.l.google.com:19302'},
    {urls:"stun:stun.l.google.com:19302"},
    {urls:"stun:stun1.l.google.com:19302"},
    {urls:"stun:stun2.l.google.com:19302"},
    {urls:"stun:stun3.l.google.com:19302"},
    {urls:"stun:stun4.l.google.com:19302"},*/
    {urls:"turn:global.relay.metered.ca:80",username:"a4781452ed7521c96cad2679",credential:"3xu48SeN9vJcte3W"},
    {urls:"turn:global.relay.metered.ca:80?transport=tcp",username:"a4781452ed7521c96cad2679",credential:"3xu48SeN9vJcte3W"},
    {urls:"turn:global.relay.metered.ca:443",username:"a4781452ed7521c96cad2679",credential:"3xu48SeN9vJcte3W"},
    {urls:"turns:global.relay.metered.ca:443?transport=tcp",username:"a4781452ed7521c96cad2679",credential:"3xu48SeN9vJcte3W"}
  ];

  constructor() {
    this.resetConnection();    
  }

  private async getLocalUserMedia() {
    try {
      this.localStream = await navigator.mediaDevices.getUserMedia({ video: this.useVideo, audio: this.useAudio });
      this.localStream.getTracks().forEach(track => this.peerConnection.addTrack(track, this.localStream));
      
      if ( this.localStreamElement) {
         this.localStreamElement.srcObject = this.localStream;
         this.localStreamElement.play();
      }
    } catch (error) {
      console.error('Error accessing media devices.', error);
    }
  }

  // Метод для инициализации локального медиа-потока
  async setLocalStream(localVideoElement: HTMLVideoElement): Promise<void> {
    this.localStreamElement = localVideoElement;
    this.getLocalUserMedia();
  }

  async setRemoteStream(remoteVideoElement: HTMLVideoElement): Promise<void> {
    this.remoteStreamElement = remoteVideoElement;  
  }

  // Метод для создания оффера
  async createOffer(): Promise<void> {
    try {
      console.log('CREATE OFFER-------');
      await this.peerConnection.createOffer().then(async(offer) => {
       await this.peerConnection.setLocalDescription(new RTCSessionDescription(offer)).then(() => {
          this.webrtcOnOfferCreateEvent.next(offer);
          console.log('Offer created:', offer);
       });
      });
    } catch (error) {
      console.error('Error creating offer:', error);
      throw error;
    }
  }

  // Метод для создания ответа
  async createAnswer(offer: RTCSessionDescriptionInit): Promise<void> {
    try {
      console.log('CREATE ANSWER-------');
      await this.peerConnection.setRemoteDescription(new RTCSessionDescription(offer)).
      then(async () => {
        this.remoteDescriptionSet = true; 
        await this.peerConnection.createAnswer().
        then(async (answer) => {
          await this.peerConnection.setLocalDescription(answer).
          then(() => {
              this.webrtcOnAnswerCreateEvent.next(answer);
              console.log('Answer created:', answer);
          });
        });
      });
    } catch (error) {
      console.error('Error creating answer:', error);
      throw error;
    }
  }

  // Установка удаленного описания
  async setRemoteDescription(offer: RTCSessionDescriptionInit): Promise<void> {
    await this.peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
  }

  // Метод для получения ICE кандидатов
  async handleICECandidate(candidate: RTCIceCandidateInit): Promise<void> {
     if (this.remoteDescriptionSet) {
      await this.peerConnection.addIceCandidate(candidate);
     }
  }

  resetConnection() {
    if (this.peerConnection) {
        this.peerConnection.close();
    }
    this.createPeerConnection();
  }

  stopMediaStream(): void {
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
    }
  }

  // Метод для закрытия соединения
  closeConnection(): void {
    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = new RTCPeerConnection({
        iceServers: this.stunServers
      });
    }
  }

  setVideoEnabled(enabled: boolean) {
      this.useVideo = enabled;
      const audioTracks = this.localStream.getVideoTracks();
      audioTracks.forEach(track => track.enabled = enabled);      
  }

  setAudioEnabled(enabled: boolean) {
     if (this.localStream) {
      const audioTracks = this.localStream.getAudioTracks();
      audioTracks.forEach(track => track.enabled = enabled); 
    } 
  }


  createPeerConnection() {
     this.peerConnection = new RTCPeerConnection({
      iceServers: this.stunServers
    });

    // Обработчик ICE кандидатов
    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        //this.handleICECandidate(event.candidate);
        // Здесь вы можете отправить кандидата другому участнику
        this.webrtcOnIceCandidateEvent.next(event.candidate);
      }
    };

    // Обработчик получения удаленного потока
    this.peerConnection.ontrack = (event) => {
      if(event.track) {
        
        console.log('ON TRACK');
      
      if (this.remoteStreamElement) {
         this.remoteStreamElement.srcObject = event.streams[0];
         //this.remoteStreamElement.play();
      }

        //this.webrtcOnTrackEvent.next(event);
      }
    };
  }
}
