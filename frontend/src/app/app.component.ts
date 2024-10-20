import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { MainMenuComponent } from './components/header/main-menu/main-menu.component';
import { SocketService } from './services/socket/socket.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, MainMenuComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements AfterViewInit {
 
  title = 'chatyoo';

  @ViewChild('mainMenu') roomCreateForm!: MainMenuComponent;


  constructor(
    private socketService: SocketService,
    private router: Router
  ){}

  ngAfterViewInit(): void {
    this.roomCreateForm.logoutEvent.subscribe(() => {
      this.socketService.logout();
      this.router.navigate(['/']);
    });
  }

}
