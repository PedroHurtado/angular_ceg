import { Component, signal, HostListener } from '@angular/core';
import { Pizza } from '../pizza';
import { Pizzaitem } from '../pizzaitem/pizzaitem';
@Component({
  selector: 'app-pizzalist',
  imports: [Pizzaitem],
  templateUrl: './pizzalist.html',
  styleUrl: './pizzalist.css'
})
export class Pizzalist {
  pizzas = signal<Pizza[]>([])


  @HostListener('click',['$event'])
  selectPizza(ev:Event){
    ev.stopPropagation()
    const {dataset}=(ev.target as HTMLElement)
    if(dataset){
      const {pizzaId} = dataset
      console.log(pizzaId)
    }
  }
}
