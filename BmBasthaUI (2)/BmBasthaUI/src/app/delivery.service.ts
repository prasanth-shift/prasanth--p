import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment.development';

interface ApiResponse<T> {
  code: number;
  data: T;
  message?: string;
}

interface Agent {
  id: number;
  name: string;
  mobile: string;
  area: number;
}

interface Order {
  id: number;
  uid: number;
  order_status: string;
  price: number;
  ordered_date: string;
  delivery_address: string;
  payment_method: string;
}

@Injectable({
  providedIn: 'root',
})
export class DeliveryService {
  private baseUrl = environment.serverUrl;

  constructor(private http: HttpClient) {}

  getOrders(url: string): Observable<ApiResponse<Order[]>> {
    return this.http.get<ApiResponse<Order[]>>(`${this.baseUrl}${url}`);
  }

  getAgents(url: string): Observable<ApiResponse<Agent[]>> {
    return this.http.get<ApiResponse<Agent[]>>(`${this.baseUrl}${url}`);
  }

  assignAgent(requestBody: { order_id: number; agent_id: number }): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(
      `${this.baseUrl}/api/delivery/admin/map/order/agent`,
      requestBody
    );
  }

  updateOrderStatus(requestBody: { id: number; status: string }): Observable<ApiResponse<any>> {
    return this.http.patch<ApiResponse<any>>(
      `${this.baseUrl}/api/delivery/admin/order`,
      requestBody
    );
  }

  getPincodeSuggestions(url: string): Observable<ApiResponse<{ code: string }[]>> {
    return this.http.get<ApiResponse<{ code: string }[]>>(`${this.baseUrl}${url}`);
  }
}