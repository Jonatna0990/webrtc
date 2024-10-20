import { AfterViewInit, Component, OnDestroy, Output, ViewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Router } from '@angular/router';
import {NgIf} from "@angular/common";
import { Subject, Subscription } from 'rxjs';
import {MatButtonModule} from '@angular/material/button';
import { UserMenuModalComponent } from '../user/menu-modal.component';
import { MatDialog } from '@angular/material/dialog';
import { SocketService } from '../../../services/socket/socket.service';

@Component({
  selector: 'app-main-menu',
  standalone: true,
  imports: [RouterLink, NgIf, MatButtonModule ],
  templateUrl: './main-menu.component.html',
  styleUrl: './main-menu.component.scss'
})
export class MainMenuComponent implements AfterViewInit, OnDestroy {

  private nameSubmitSubscription: Subscription;
  private exitSubscription: Subscription;


  constructor(
    private router: Router, 
    private socketService: SocketService,
    public dialog: MatDialog,
  ) {}

  @Output() logoutEvent: Subject<void> = new Subject();


   ngAfterViewInit(): void {
    
  }

  ngOnDestroy(): void {
    this.nameSubmitSubscription.unsubscribe();
    this.exitSubscription.unsubscribe();
  }
  
  isHomePage(): boolean {
    return this.router.url === '/'; // Проверяем, является ли текущий маршрут главной страницей
  }

  isAuth(): boolean {
    return this.socketService.isAuthenticated();
  }

  logout() {
    this.logoutEvent.next();
  }
  
  openMenu() {
    const dialogRef = this.dialog.open(UserMenuModalComponent, {  });
    dialogRef.afterClosed().subscribe(result => {
        console.log("EXIT");
    });
    dialogRef.componentInstance.exitEvent.subscribe(()=>{
      this.logout();
    });

  }
}
