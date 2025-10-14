import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-counter',
  imports: [],
  templateUrl: './counter.html',
  styleUrl: './counter.css'
})
//https://angular.dev/guide/signals
export class Counter {
  counter=signal<number>(0)

  increment(){

  }
  decrement(){

  }
}
