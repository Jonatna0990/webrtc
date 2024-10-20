import { NgClass } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-call-action-btns',
  standalone: true,
  imports: [NgClass],
  templateUrl: './action-buttons.component.html',
  styleUrl: './action-buttons.component.scss'
})
export class ActionButtonsComponent {
  useAudio: boolean = true;
  useVideo: boolean = true;

  @Output() notifySwitchAudio: EventEmitter<boolean> = new EventEmitter();
  @Output() notifySwitchVideo: EventEmitter<boolean> = new EventEmitter();
  @Output() notifyEndCall: EventEmitter<void> = new EventEmitter();


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
