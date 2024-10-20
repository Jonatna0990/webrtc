import { ChangeDetectionStrategy, Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { IUserType } from '../../../../data/user/user.type';
import { NgFor, NgIf } from '@angular/common';

@Component({
  selector: 'app-members',
  standalone: true,
  imports: [NgFor, NgIf],
  templateUrl: './members.component.html',
  styleUrl: './members.component.scss',  
  changeDetection: ChangeDetectionStrategy.Default // или OnPush
})
export class MembersComponent  {
  @Input() members: IUserType[]; 
}
