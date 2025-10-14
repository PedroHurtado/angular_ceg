import { Component, HostListener } from '@angular/core';
import { CalendarDay, generateCalendar } from './calendat-service';
@Component({
  selector: 'app-calendar',
  imports: [],
  templateUrl: './calendar.html',
  styleUrl: './calendar.css'
})
export class Calendar {
  //days:number [] = [...Array(31).keys()].map(i => i + 1);
  days:CalendarDay [] = [...generateCalendar()]

  @HostListener('click', ['$event'])
  handlerClick(ev:Event){
    ev.stopPropagation()
    const {dataset} = (ev.target as HTMLElement) || {}
    const {index} = dataset || {}
    if(index){
      console.log(this.days[Number(index)])
    }
  }
}
