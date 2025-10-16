import { Component,input } from '@angular/core';
import { Pizza } from '../pizza';
@Component({
  selector: 'app-pizzaitem',
  imports: [],
  templateUrl: './pizzaitem.html',
  styleUrl: './pizzaitem.css'
})
export class Pizzaitem {

  pizza=input.required<Pizza>()


}
