import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SpeechRecognitionService {

  private recognition: any; //SpeechRecognitionEvent
  private isRecording = false;
  private recognizedTextSubject = new Subject<string>();

  constructor() {
    this.initializeRecognition();
  }

  private initializeRecognition() {
    this.recognition = new (window as any).webkitSpeechRecognition() || new (window as any).SpeechRecognition();
    this.recognition.continuous = true;
    this.recognition.interimResults = true;

    this.recognition.onresult = (event: any /*SpeechRecognitionEvent*/) => {
      const transcript = Array.from(event.results)
        .map(result => result[0].transcript)
        .join('');
      this.recognizedTextSubject.next(transcript);
    };

    this.recognition.onerror = (event: any /*SpeechRecognitionEvent*/) => {
      console.error('Speech recognition error:', event.error);
    };
  }

  startRecognition() {
    if (!this.isRecording) {
      this.recognition.start();
      this.isRecording = true;
    }
  }

  stopRecognition() {
    if (this.isRecording) {
      this.recognition.stop();
      this.isRecording = false;
    }
  }

  get recognizedText$() {
    return this.recognizedTextSubject.asObservable();
  }

  
}
