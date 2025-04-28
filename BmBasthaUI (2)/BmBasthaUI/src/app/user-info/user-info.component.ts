import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-user-info',
  templateUrl: './user-info.component.html',
  styleUrls: ['./user-info.component.css']
})
export class UserInfoComponent implements OnInit {

  users: any[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.fetchUserInfo();
  }

  fetchUserInfo() {
    this.http.get<any>('/api/users').subscribe({
      next: (res) => {
        if (res.code === 1) {
          this.users = res.data;
        }
      },
      error: (err) => {
        console.error('Error fetching user info', err);
      }
    });
  }
}
