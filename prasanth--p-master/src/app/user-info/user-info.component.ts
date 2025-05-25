import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  standalone: false,
  selector: 'app-user-info',
  templateUrl: './user-info.component.html',
  styleUrls: ['./user-info.component.css']
})
export class UserInfoComponent {
  uid: string = '';  // User ID input
  userProfile: any = null;  // Holds user details
  orders: any[] = [];  // Holds order details
  errorMessage: string = '';  // Error message for displaying errors

  constructor(private http: HttpClient) {}

  // Search for the user details based on the given UID
  searchUser(): void {
    if (!this.uid) {
      this.errorMessage = 'Please enter a User ID.';
      return;
    }

    this.errorMessage = ''; // Clear previous errors
    this.userProfile = null; // Reset user profile and orders
    this.orders = [];

    const profileUrl = `http://150.242.203.100:5000/api/admin/user/acount/details?uid=${this.uid}`;
    const ordersUrl = `http://150.242.203.100:5000/api/admin/user/orders/list?uid=${this.uid}`;

    // Fetch user profile
    this.http.get<any>(profileUrl).subscribe({
      next: res => {
        if (res.code === 1) {
          this.userProfile = res.data;
        } else {
          this.errorMessage = 'User profile not found.';
        }
      },
      error: () => this.errorMessage = 'Error fetching user profile.'
    });

    // Reset order list (in case it’s already populated)
    this.orders = [];
  }

  // Fetch user's orders once the profile is found
  fetchOrders(): void {
    if (!this.userProfile) {
      this.errorMessage = 'Please search for a user first.';
      return;
    }

    const ordersUrl = `http://150.242.203.100:5000/api/admin/user/orders/list?uid=${this.uid}`;

    // Fetch user orders
    this.http.get<any>(ordersUrl).subscribe({
      next: res => {
        if (res.code === 1) {
          this.orders = res.data;
        } else {
          this.orders = [];
        }
      },
      error: () => this.errorMessage = 'Error fetching user orders.'
    });
  }
}
