import { Component, signal, HostListener, inject } from '@angular/core';
import { Pizza } from '../pizza';
import { Pizzaitem } from '../pizzaitem/pizzaitem';
import { PizzaService } from '../pizzaservice';
import { CommunicationService } from '../../core/comunication-service';
import { SpinnerComponent, WithSpinner } from '../../spinner';
//import { catchError, of } from 'rxjs';
//import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
@Component({
  selector: 'app-pizzalist',
  imports: [Pizzaitem],
  templateUrl: './pizzalist.html',
  styleUrl: './pizzalist.css'
})
export class Pizzalist extends SpinnerComponent {
  override handleError(error: unknown): void {
    throw new Error('Method not implemented.');
  }
  pizzas = signal<Pizza[]>([])
  constructor(
    private service: PizzaService,
    private comunicationService :CommunicationService<Pizza>
  ) {
    super();
    this.loadData()
    /*this.service.getAll()
      .pipe(
        catchError(err => of<Pizza[]>([])),
        takeUntilDestroyed()
      )
      .subscribe(pizzas => this.pizzas.set(pizzas))*/
  }
  @WithSpinner()
  private async loadData(){
    /*try{
      //spinner.on
      const pizzas = await this.service.getAll()
      this.pizzas.set(pizzas)
    }
    catch(err){
      console.log(err)
    }
    finally{
      //spinner off
    }*/

    const pizzas = await this.service.getAll()
    this.pizzas.set(pizzas)
  }
  @HostListener('click', ['$event'])
  selectPizza(ev: Event) {

    ev.stopPropagation();
    const { pizzaId } = (ev.target as HTMLElement).dataset || {}
    if (pizzaId) {
      const pizza = this.pizzas().find(p=>p.id===pizzaId)
      if (pizza){
        this.comunicationService.emit(pizza)   //publicador
      }
    }
  }
}
