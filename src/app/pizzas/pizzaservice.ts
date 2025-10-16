import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Pizza } from './pizza';
import { lastValueFrom } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class PizzaService {
  constructor(private http: HttpClient) {

  }
  getAll(): Promise<Pizza[]> {
    return lastValueFrom(this.http.get<Pizza[]>('http://localhost:3000/pizzas'))
  }
}
