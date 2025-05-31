import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private apiUrl = `${environment.serverUrl}/api/admin/notification`;

  constructor(private http: HttpClient) {}

  updateNotification(notification: { title: string; description: string; poster: string }): Observable<any> {
    return this.http.put(this.apiUrl, notification);
  }
  getAllNotifications(): Observable<any[]> {
  return this.http.get<any[]>(`http://150.242.203.100:5000/api/explore/list/notification`);
}

deleteNotification(id: string): Observable<any> {
  return this.http.delete(`${this.apiUrl}/notification/${id}`);
}

}
