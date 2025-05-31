import { Injectable } from '@angular/core';
import { environment } from '../environments/environment.development';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BannerService {

  
  private baseUrl = environment.serverUrl; // The base URL is stored in the environment file.

  constructor(private http: HttpClient) {}

  addBanner(payload: { title: string; banner_image: string }): Observable<any> {
    const url = `${this.baseUrl}/api/admin/banner/add`;
    return this.http.put(url, payload);
  }
 getAllBanners(): Observable<{ code: number; message: string; data: any[] }> {
  return this.http.get<{ code: number; message: string; data: any[] }>(`${this.baseUrl}/api/admin/banner/list/all`);
}


  deleteBanner(bannerId: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/api/admin/banner/remove/${bannerId}`);

    
  }

 
  updateBanner(payload: any): Observable<any> {
    return this.http.patch(`${this.baseUrl}/api/admin/banner/update`, payload);
  }
}
