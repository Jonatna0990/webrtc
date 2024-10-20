import { NgIf } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormControl } from '@angular/forms';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-user-create-form',
  standalone: true,
  imports: [ReactiveFormsModule, NgIf],
  templateUrl: './user-create.component.html',
  styleUrl: './user-create.component.scss'
})
export class UserCreateFormComponent {
  @Output() nameSubmitEvent: Subject<string> = new Subject();

  name: string = '';
  
  form = new FormGroup({
      name: new FormControl(null),
  })

  onSubmit() {    
    if(this.form.value.name) {
      this.name = this.form.value.name;
      this.nameSubmitEvent.next(this.name);
      this.name = '';
    }
  }
}
