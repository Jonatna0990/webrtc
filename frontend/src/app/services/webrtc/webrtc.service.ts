import { Injectable } from '@angular/core';
import { every, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WebRTCService {

 //private localVideoStream: MediaStream;
 //private localAudioStream: MediaStream;
 private localStream: MediaStream;
 private localStreamElement: HTMLVideoElement;
 private remoteStream: MediaStream;
 private remoteStreamElement: HTMLVideoElement;

 private peerConnection: RTCPeerConnection;
 private dataChannel: RTCDataChannel;

 public webrtcOnIceCandidateEvent: Subject<RTCIceCandidateInit> = new Subject();
 //public webrtcOnTrackEvent: Subject<RTCTrackEvent> = new Subject();
 public webrtcOnOfferCreateEvent: Subject<RTCSessionDescriptionInit> = new Subject();
 public webrtcOnAnswerCreateEvent: Subject<RTCSessionDescriptionInit> = new Subject();
 public webrtcOnMessageEvent: Subject<RTCSessionDescriptionInit> = new Subject();


 private remoteDescriptionSet: boolean = false;
 private useAudio: boolean = true;
 private useVideo: boolean = true;
 
 //RTCSessionDescriptionInit
  private stunServers: RTCIceServer[] = [
     { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun2.l.google.com:19302' },
        { urls: 'stun:stun3.l.google.com:19302' },
        { urls: 'stun:stun4.l.google.com:19302' }
	  /*{ urls: "turn:openrelay.metered.ca:443", username: "openrelayproject", credential: "openrelayproject" },
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    { urls: 'stun:stun3.l.google.com:19302' },
    { urls: 'stun:stun4.l.google.com:19302' },
    {urls:"turn:global.relay.metered.ca:80",username:"a4781452ed7521c96cad2679",credential:"3xu48SeN9vJcte3W"},
    {urls:"turn:global.relay.metered.ca:80?transport=tcp",username:"a4781452ed7521c96cad2679",credential:"3xu48SeN9vJcte3W"},
    {urls:"turn:global.relay.metered.ca:443",username:"a4781452ed7521c96cad2679",credential:"3xu48SeN9vJcte3W"},
    {urls:"turns:global.relay.metered.ca:443?transport=tcp",username:"a4781452ed7521c96cad2679",credential:"3xu48SeN9vJcte3W"}*/
  ];

  constructor() {
    this.resetConnection();    
  }

  private async getLocalUserMedia() {
    await navigator.mediaDevices.getUserMedia({ video: this.useVideo, audio: this.useAudio }).then((stream) => {
      this.localStream = stream;
      stream.getTracks().forEach(track => this.peerConnection.addTrack(track, stream));
      this.localStreamElement.srcObject = stream;

    }).catch(error => {
      console.error('Error accessing media devices:', error);
    });
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
      await this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate)).catch((error) => {
            console.error('Error adding ICE candidate', error);
        });;
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
    if (this.remoteStream) {
      this.remoteStream.getTracks().forEach(track => track.stop());
    }
  }

  // Метод для закрытия соединения
  closeConnection(): void {
    if (this.peerConnection) {
      this.peerConnection.close();
      //this.createPeerConnection();
    }
  }

  sendMessage(msg: string) {
      console.log('SEND MESSAGE', msg, this.dataChannel);

    if(this.dataChannel) {
      this.dataChannel.send(msg);
    }
  }

  setVideoEnabled(enabled: boolean) {
      this.useVideo = enabled;
      const videoTracks = this.localStream.getVideoTracks();
      videoTracks.forEach(track => track.enabled = enabled);      
  }

  setAudioEnabled(enabled: boolean) {
     if (this.localStream) {
      const audioTracks = this.localStream.getAudioTracks();
      audioTracks.forEach(track => track.enabled = enabled); 
    } 
  }


  createPeerConnection() {
    console.log("CREATE PEER CONNECTION");

     this.peerConnection = new RTCPeerConnection({
      iceServers: this.stunServers
    });
    

    this.dataChannel = this.peerConnection.createDataChannel('chat');
    this.peerConnection.ondatachannel = (event1) => {
       const receivedDataChannel = event1.channel;
        console.log(event1);
        receivedDataChannel.onmessage = (event) => {
        console.log('Message from received DataChannel:', event.data);
      };
    }


    this.peerConnection.oniceconnectionstatechange = () => {
        console.log('ICE connection state:',  this.peerConnection.iceConnectionState);
    };

    this.peerConnection.onicecandidateerror = (event) => {
    console.error('ICE candidate error:', event);
    };

    this.peerConnection.onconnectionstatechange = () => {
        console.log('Connection state change:', this.peerConnection.connectionState);
    };
   
    

    // Обработчик ICE кандидатов
    this.peerConnection.onicecandidate = (event) => {
      console.log('ON ICE CANDIDATE', event);
      if (event.candidate) {
        //this.handleICECandidate(event.candidate);
        // Здесь вы можете отправить кандидата другому участнику
        this.webrtcOnIceCandidateEvent.next(event.candidate);
      }
    };

    // Обработчик получения удаленного потока
    this.peerConnection.ontrack = (event) => {
        const [remoteStream] = event.streams;
        if (remoteStream) {
            // Устанавливаем поток как источник для видеоэлемента
            this.remoteStreamElement.srcObject = remoteStream;
              remoteStream.getTracks().forEach(track => {
                console.log('Track kind:', track.kind); // 'video' или 'audio'
                console.log('Track label:', track.label);
                console.log('Track enabled:', track.enabled);
                console.log('Track readyState:', track.readyState);
            });
            console.log('ON TRACK', event, this.remoteStreamElement.srcObject);

        } else {
            console.error('No remote stream received');
        }
    };
  }
}
