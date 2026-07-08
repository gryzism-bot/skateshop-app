import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface UserProfile {
  email: string;
  address?: string;
  role: 'ADMIN' | 'CLIENT';
}

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private apiUrl = `${environment.apiUrl}/users/me`;

  constructor(private http: HttpClient) {}

  getProfile(): Observable<UserProfile> {
    return this.http.get<UserProfile>(this.apiUrl);
  }

  updateAddress(address: string): Observable<UserProfile> {
    return this.http.put<UserProfile>(`${this.apiUrl}/address`, { address });
  }
}
