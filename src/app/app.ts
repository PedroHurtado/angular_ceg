import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Calendar } from './calendar/calendar';
import { Parent } from './input/parent/parent';
import { Parent as ParentContent  } from './content/parent/parent'

@Component({
  selector: 'app-root',
  imports: [Calendar, Parent, ParentContent],
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
