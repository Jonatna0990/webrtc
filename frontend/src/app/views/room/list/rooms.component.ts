import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { MainMenuComponent } from '../../../components/header/main-menu/main-menu.component';
import { ListComponent } from '../../../components/room/list/list.component';
import { RoomCreateDto } from '../../../data/room/dto/shared/roomCreate.dto';
import { RoomTypeDto } from '../../../data/room/dto/shared/room.type.dto';
import { RoomJoinRequestDto } from '../../../data/room/dto/request/roomJoinRequest.dto';
import { RoomsTypeDto } from '../../../data/room/dto/shared/rooms.type.dto';
import { SocketService } from '../../../services/socket/socket.service';
import { UserCreateFormComponent } from '../../../components/forms/user-create/user-create.component';
import { RoomCreateComponent } from '../../../components/forms/room-create/room-create.component';

@Component({
  selector: 'app-rooms',
  standalone: true,
  imports: [MainMenuComponent, ListComponent],
  templateUrl: './rooms.component.html',
  styleUrl: './rooms.component.scss'
})
export class RoomsComponent implements AfterViewInit, OnDestroy {
 
  @ViewChild(ListComponent) listComponent!: ListComponent;

  data: RoomsTypeDto;
  sendData: RoomJoinRequestDto;


  private selectRoomSubscription: Subscription;
  private createRoomSubscription: Subscription;
  private joinRoomSubscription: Subscription;
  private shareRoomsSubscription: Subscription;

  

  constructor(
    private socketService: SocketService, 
    public dialog: MatDialog,
    private router: Router
  ) { }

  ngOnDestroy(): void {
    if(this.selectRoomSubscription){ 
      this.selectRoomSubscription.unsubscribe();
    }
    if(this.shareRoomsSubscription){ 
      this.shareRoomsSubscription.unsubscribe();
    }
    if(this.joinRoomSubscription){ 
      this.joinRoomSubscription.unsubscribe();
    }
    if(this.createRoomSubscription){ 
      this.createRoomSubscription.unsubscribe();
    } 
  }

  ngAfterViewInit(): void {
    this.socketService.shareRooms();   
    
     this.shareRoomsSubscription = this.socketService.shareRoomsEvent.subscribe((data: RoomsTypeDto) => {
       if(data) {
        this.data = data;
      }   
    });  

    this.joinRoomSubscription = this.socketService.joinRoomEvent.subscribe((data: RoomTypeDto) => {
       if(data) {
        this.router.navigate(['/room/join', data.room.id ], { state: { ...data }});
      }   
    }); 

    this.selectRoomSubscription = this.listComponent.selectRoomEvent.subscribe((data: RoomCreateDto) => {  
      this.socketService.joinRoom({roomId: data.id})
      //this.sendData = { roomId: data.id, userName: ""};
      //this.openDialog(data.name);
    });

    this.createRoomSubscription = this.listComponent.createRoomEvent.subscribe(() => {  
      const dialogRef = this.dialog.open(RoomCreateComponent);
      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.socketService.createRoom({name: result})
        }
      });
    });

  }

  getRoomsData(): RoomsTypeDto {
    return this.data;
  }
  
  openDialog(roomName: string) {
    const dialogRef = this.dialog.open(UserCreateFormComponent, { data: { roomName } });
    dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.socketService.joinRoom({ ...this.sendData }); 
        }
    });
  }  

}
