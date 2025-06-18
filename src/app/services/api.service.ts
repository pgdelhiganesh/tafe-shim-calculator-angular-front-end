import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  constructor(private http: HttpClient) { }

  public readonly baseUrl =environment.baseUrl;

  get() {
    return this.http.get(`${this.baseUrl}/Workflows/all`)
  }

  post(data:any){
    return this.http.post(`${this.baseUrl}/Workflows/evaluate`,data)
  }
}
