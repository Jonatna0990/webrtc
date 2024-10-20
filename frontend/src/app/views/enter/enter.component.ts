import { AfterViewInit, Component, OnDestroy, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { UserCreateFormComponent } from '../../components/forms/user-create/user-create.component';
import { GetUserIdResponseDto } from '../../data/room/dto/response/getUserIdResponse.dto';
import { CheckAuthComponent } from '../auth/check.component';
import { SocketService } from '../../services/socket/socket.service';

@Component({
  selector: 'app-enter',
  standalone: true,
  imports: [UserCreateFormComponent, CheckAuthComponent],
  templateUrl: './enter.component.html',
  styleUrl: './enter.component.scss'
})
export class EnterComponent implements OnDestroy, AfterViewInit {

  @ViewChild('userCreateForm') userCreateForm!: UserCreateFormComponent;
  data: GetUserIdResponseDto;
  private nameSubmitSubscription: Subscription;

  
  constructor(private router: Router, private socketService: SocketService) { }
  ngAfterViewInit(): void {
      this.checkAuth();
      this.nameSubmitSubscription = this.userCreateForm.nameSubmitEvent.subscribe((data:string)=>{
        if(data) {
          this.router.navigate(['/chechAuth'], { queryParams: { name: data } });
        }
      })
  }
  ngOnDestroy(): void {
    if(this.nameSubmitSubscription){ 
      this.nameSubmitSubscription.unsubscribe();
    } 
  }

   checkAuth() {
    let isAuth = this.socketService.isAuthenticated();
    if(isAuth) {
      this.router.navigate(['room/list']);
    }
  }
}

