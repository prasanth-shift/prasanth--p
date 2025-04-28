import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../environments/environment.development';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ItemsService {
  private baseUrl = environment.serverUrl;

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      Authorization: token ? `Bearer ${token}` : ''
    });
  }

  addItem(requestBody: any): Observable<any> {
    const url = `${this.baseUrl}/api/admin/item/add`;
    return this.http.put(url, requestBody);
  }

  getSuppliers(): Observable<any> {
    const url = `${this.baseUrl}/api/admin/item/supplier`;
    return this.http.get(url);
  }

  getItems(limit: number = 20, offset: number = 0, searchText: string = ''): Observable<any> {
    const url = `${this.baseUrl}/api/admin/item`;
    return this.http.get(url);
  }

  deleteItem(item_id: number): Observable<any> {
    const url = `${this.baseUrl}/api/admin/remove/${item_id}`;
    return this.http.delete(url, { headers: this.getAuthHeaders() });
  }

  getSubItemDetails(itemId: number): Observable<any> {
    const url = `${this.baseUrl}/api/admin/item/details/${itemId}`;
    return this.http.get(url);
  }

  updateSubItem(requestBody: any): Observable<any> {
    const url = `${this.baseUrl}/api/admin/item/update/sub_item`;
    return this.http.patch(url, requestBody);
  }

  addPincode(requestBody: any): Observable<any> {
    const url = `${this.baseUrl}/api/admin/item/pincode`;
    return this.http.put(url, requestBody);
  }

  removePincode(requestBody: any): Observable<any> {
    const url = `${this.baseUrl}/api/admin/item/pincode`;
    return this.http.request('DELETE', url, { body: requestBody });
  }

  getPincodes(): Observable<any> {
    const url = `${this.baseUrl}/api/admin/pincode/`;
    return this.http.get(url);
  }
}