import { Component, EventEmitter, Input, Output } from '@angular/core';
import { NgIf, NgFor } from "@angular/common";
import { MatListModule } from '@angular/material/list';
import { Router } from '@angular/router';
import { RoomCreateDto } from '../../../data/room/dto/shared/roomCreate.dto';
import { RoomsTypeDto } from '../../../data/room/dto/shared/rooms.type.dto';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-room-list',
  standalone: true,
  imports: [NgIf, NgFor, MatListModule],
  templateUrl: './list.component.html',
  styleUrl: './list.component.scss'
})
export class ListComponent {

constructor(private router: Router) {}

  @Input() data: RoomsTypeDto;
  @Output() selectRoomEvent: Subject<RoomCreateDto> = new EventEmitter();
  @Output() createRoomEvent: Subject<void> = new EventEmitter();

  isAnyRoom(): boolean {
    if(!this.data) 
      return false;
    
    return (this.data.rooms.length) > 0; // Проверяем, является ли текущий маршрут главной страницей
  }

  openRoom(room: RoomCreateDto) {   
     this.selectRoomEvent.next(room);
  }

  createRoom() {
    this.createRoomEvent.next();
  }
}
