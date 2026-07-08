import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {

  private api = `${environment.apiUrl}/auth`;

  constructor(private http: HttpClient) {}

  login(email: string, password: string) {
  return this.http.post(
    `${this.api}/login`,
    { email, password },
    { responseType: 'text' } 
  );
}

  saveToken(token: string) {
    if (!this.hasLocalStorage()) {
      return;
    }

    localStorage.setItem('token', token);
  }

  getToken(): string | null {
    if (!this.hasLocalStorage()) {
      return null;
    }

    return localStorage.getItem('token');
  }

  logout() {
    if (!this.hasLocalStorage()) {
      return;
    }

    localStorage.removeItem('token');
  }

  private hasLocalStorage(): boolean {
    return typeof globalThis.localStorage !== 'undefined';
  }
}
