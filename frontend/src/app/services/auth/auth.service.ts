import { Injectable } from '@angular/core';
import { CookieService } from '../session/cookie.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private loggedIn = false;

  constructor(private cookieService: CookieService){}

  getAuthData(): any {
    return this.cookieService.getToken();
  };

  login(token: any) {
    if(token) {
      this.cookieService.saveToken(token);
      this.loggedIn = true; // Здесь должна быть логика авторизации
    }

  }

  logout() {
    this.cookieService.removeToken();
    this.loggedIn = false; // Логика выхода
  }

  isAuthenticated(): boolean {
    return this.cookieService.exists();
  }
}