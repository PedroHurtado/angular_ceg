import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Calendar } from './calendar/calendar';
import { Parent } from './input/parent/parent';
import { Parent as ParentContent  } from './content/parent/parent'
import { Counter } from './counter/counter';
import { Timer } from './timer/timer';
import { ParentSignal } from './input-signal/parent-signal/parent-signal';
import { Focus } from './focus/focus';
import { Post } from './post/post';
import { ParentContainer } from './parent-container/parent-container';

@Component({
  selector: 'app-root',
  imports: [ParentContainer, Post, Calendar, Parent, ParentContent,Counter, Timer, ParentSignal, Focus],
  templateUrl: './app.html',
  styleUrl: './app.css',
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
