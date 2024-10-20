import { Component, Output } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormControl } from '@angular/forms';
import { Subject } from 'rxjs';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-room-create',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './room-create.component.html',
  styleUrl: './room-create.component.scss'
})
export class RoomCreateComponent {
 @Output() nameSubmitEvent: Subject<string> = new Subject();

  name: string = '';
  
  form = new FormGroup({
      name: new FormControl(null),
  })
  constructor(
    public dialogRef: MatDialogRef<RoomCreateComponent>
  ){}

  onSubmit() {    
    if(this.form.value.name) {
      this.name = this.form.value.name;
      this.nameSubmitEvent.next(this.name);
      this.dialogRef.close(this.name);
      this.name = '';
    }
  }
}