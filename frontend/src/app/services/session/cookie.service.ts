import { Injectable } from '@angular/core';
import { CookieService as AngularCookieService } from 'ngx-cookie-service';

@Injectable({
  providedIn: 'root'
})
export class CookieService {
  private readonly COOKIE_NAME = 'token';

  constructor(private cookieService: AngularCookieService) {}

  // Сохранение токена в куку с увеличенным сроком хранения
  public saveToken(token: any, days: number = 7): void {
    const expires = new Date();
    expires.setDate(expires.getDate() + days); // Срок действия куки

    this.cookieService.set(this.COOKIE_NAME, JSON.stringify({ token, expires: expires.toISOString() }), expires, '/', undefined, true, 'Strict');
  }

  // Получение токена из куки
  public getToken(): any | null {
    const cookie = this.cookieService.get(this.COOKIE_NAME);
    if (!cookie) {
      return null; // Если кука не существует
    }

    try {
      const { token, expires } = JSON.parse(cookie);
      if (this.isExpired(expires)) {
        this.removeToken(); // Удаляем токен, если он истек
        return null; // Возвращаем null, если токен истек
      }
      return token;
    } catch (error) {
      console.error('Error parsing token from cookie:', error);
      return null; // Возвращаем null, если произошла ошибка парсинга
    }
  }

  // Метод для проверки истечения срока действия куки
  private isExpired(expires: string): boolean {
    const expiryDate = new Date(expires);
    return new Date() > expiryDate; // Проверяем, истек ли срок
  }

  // Удаление токена из куки
  public removeToken(): void {
    this.cookieService.delete(this.COOKIE_NAME, '/');
  }

  // Проверка, существует ли токен
  public exists(): boolean {
    return this.cookieService.check(this.COOKIE_NAME);
  }
}
