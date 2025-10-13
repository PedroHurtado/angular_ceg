import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  name="Pedro Hurtado"
  data:number[]=[]
  getUser(){
    /*
      tenga cierta complejidad
      use and 'role' in admin
    */
    //return "user"
  }
  handlerClick(ev:Event){
    ev.stopPropagation()
    this.data.push(this.data.length+1)
  }
}
