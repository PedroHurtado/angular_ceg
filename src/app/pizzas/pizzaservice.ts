import { HttpClient } from '@angular/common/http';
import { inject, Inject, Injectable } from '@angular/core';
import { Pizza } from './pizza';
import { lastValueFrom } from 'rxjs';
import { BASE_URL } from '../base_url';
@Injectable({
  providedIn: 'root'
})
export class PizzaService {

  protected base_url=inject(BASE_URL)
  protected http=inject(HttpClient)
  protected path = '/pizzas'

  async getAll(): Promise<Pizza[]> {
    const pizzas = await lastValueFrom(this.http.get<Pizza[]>(`${this.base_url}${this.path}`))
    return pizzas
  }
}
