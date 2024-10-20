import { Component, Output } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { MatDialogRef} from '@angular/material/dialog';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-user-menu-modal',
  standalone: true,
  imports: [],
  templateUrl: './menu-modal.component.html',
  styleUrl: './menu-modal.component.scss'
})
export class UserMenuModalComponent {

 @Output() exitEvent: Subject<void> = new Subject();

  name: string = '';
  
  form = new FormGroup({
      name: new FormControl(null),
  })
  constructor(
    public dialogRef: MatDialogRef<UserMenuModalComponent>
  ){}

  exit() {    
      this.close();
      this.exitEvent.next();
  }
  
  close() {
    this.dialogRef.close();
  }
}
