import { AfterViewInit, Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { ActionButtonsComponent } from '../buttons/action-buttons/action-buttons.component';
import { IUserType } from '../../../../data/user/user.type';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-stream-video',
  standalone: true,
  imports: [ActionButtonsComponent, NgIf],
  templateUrl: './stream.component.html',
  styleUrl: './stream.component.scss'
})
export class StreamVideoComponent implements AfterViewInit {

  //TODO
  //Сделать множественный стрим
  //@Output() dataStreams: HTMLVideoElement[];
  @Input() members: IUserType[]; 
 
  @ViewChild('localVideo') localVideo!: ElementRef<HTMLVideoElement>;
  @ViewChild('remoteVideo') remoteVideo!: ElementRef<HTMLVideoElement>;
  
  @ViewChild('actionButtons') actionButtons!: ElementRef<ActionButtonsComponent>;

  @Output() notifySwitchAudio: EventEmitter<boolean> = new EventEmitter();
  @Output() notifySwitchVideo: EventEmitter<boolean> = new EventEmitter();
  @Output() notifyEndCall: EventEmitter<void> = new EventEmitter();

  useVideo: boolean = true;
  useAudio: boolean = true;

  ngAfterViewInit(): void {
  }

// Метод для получения доступа к элементу video
  getLocalVideoElement(): HTMLVideoElement {
    return this.localVideo.nativeElement;
  }

  getRemoteVideoElement(): HTMLVideoElement {
    return this.remoteVideo.nativeElement;
  }

  switchAudio() {
    this.useAudio = !this.useAudio;
    this.notifySwitchAudio.emit(this.useAudio);
  }

  switchVideo() {
    this.useVideo = !this.useVideo;
    this.notifySwitchVideo.emit(this.useVideo);
  }
  
  endCall() {
    this.notifyEndCall.emit();
  }
}
