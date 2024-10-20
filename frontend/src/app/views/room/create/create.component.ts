import { Component, OnDestroy, ViewChild } from '@angular/core';
import { RoomCreateComponent } from "../../../components/forms/room-create/room-create.component";
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-create-room',
  standalone: true,
  imports: [RoomCreateComponent],
  templateUrl: './create.component.html',
  styleUrl: './create.component.scss'
})
export class CreateRoomComponent implements OnDestroy { 

  @ViewChild('roomCreateForm') roomCreateForm!: RoomCreateComponent;

   private nameSubmitSubscription: Subscription;
   
    ngAfterViewInit(): void {
      this.nameSubmitSubscription = this.roomCreateForm.nameSubmitEvent.subscribe((data: string)=>{
        if(data) {
          console.log(data);
          //this.socketService.getUserId({name: data}); 
        }
      })
  }

  ngOnDestroy(): void {
    if(this.nameSubmitSubscription){ 
      this.nameSubmitSubscription.unsubscribe();
    } 
  }
}
