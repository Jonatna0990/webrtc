import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { CacheSettings } from '../../data/settings/cache.settings';

@Injectable({
  providedIn: 'root'
})
export class CahceService {

 private cache = new Map<string, CacheSettings>();

  constructor() {}

  // Get data from cache
  get(key: string): Observable<any> | undefined {
    const data = this.cache.get(key);
    if (!data) {
      return undefined;
    }

    const now = new Date().getTime();
    if (now > data.expiry) {
      this.cache.delete(key);
      return undefined;
    }

    return of(data.value);
  }

  has(key: string): boolean {
    return this.cache.has(key);
  }

  // Set data to cache
  set(key: string, value: any, ttl: number = 300000): Observable<any> { // default TTL 5 minutes
    const expiry = new Date().getTime() + ttl;
    this.cache.set(key, { expiry, value });
    return of(value);
  }

  // Cache and return the Observable
  cacheObservable(key: string, fallback: Observable<any>, ttl?: number): Observable<any> {
    const cached = this.get(key);
    if (cached) {
      return cached;
    } else {
      return fallback.pipe(
        tap(value => {
          this.set(key, value, ttl);
        })
      );
    }
  }
}
