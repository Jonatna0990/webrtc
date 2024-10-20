import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { GetUserIdResponseDto } from '../../data/room/dto/response/getUserIdResponse.dto';
import { SocketService } from '../../services/socket/socket.service';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-check-auth',
  standalone: true,
  imports: [NgIf],
  templateUrl: './check.component.html',
  styleUrl: './check.component.scss'
})
export class CheckAuthComponent implements OnInit, OnDestroy, AfterViewInit {

  name: string;
  data: GetUserIdResponseDto;
  notificationVisible: boolean = false;
  private userLoginSubscription: Subscription;
  loginTimeout = 3000;
  
  constructor( 
      private router: Router,
      private route: ActivatedRoute,
      private socketService: SocketService
    ) { }
  ngAfterViewInit(): void {
    this.userLoginSubscription = this.socketService.userLoginEvent.subscribe((data) => {
        this.checkAuth();  
    });
    this.startTimer();
  }
  ngOnDestroy(): void {
    if(this.userLoginSubscription){ 
      this.userLoginSubscription.unsubscribe();
    } 
  }

  checkAuth() {
    let isAuth = this.socketService.isAuthenticated();
    if(isAuth) {
      this.router.navigate(['room/list']);
    }
  }

  ngOnInit(): void {      
    this.checkAuth();
    this.route.queryParams.subscribe(params => {
      this.name = params['name'];
      this.socketService.login({name: this.name});
    });
    


   /*this.createRoomSubscription = this.socketService.createRoomEvent.subscribe((data: RoomTypeDto) => {
       if(data) {
        this.data = data; // Обновите данные при получении нового события
        this.router.navigate(['/room', this.data.room.id ], { state: { ...this.data }});
      }   
    });
    this.socketService.shareRoom();*/
  }

  startTimer(): void {
    setTimeout(() => {
      this.notificationVisible = true;
      this.router.navigate(['/']);
    }, this.loginTimeout); // 3 секунды
  }
}
