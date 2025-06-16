import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
@Injectable({
  providedIn: 'root'
})
export class ApiService {

  constructor(private http: HttpClient) { }

  public baseUrl ='http://localhost:5298/api'

  get() {
    return this.http.get(`${this.baseUrl}/Workflows/all`)
  }

  post(data:any){
    return this.http.post(`${this.baseUrl}/Workflows/evaluate`,data)
  }
}
