import { Component, HostListener } from '@angular/core';

@Component({
  selector: 'app-calendar',
  imports: [],
  templateUrl: './calendar.html',
  styleUrl: './calendar.css'
})
export class Calendar {
  days: number[] = [...Array(31).keys()].map(i => i + 1);

  @HostListener('click', ['$event'])
  handlerClick(ev:Event){
    const {dataset} = (ev.target as HTMLElement)
    const {index} = dataset || {}
    if(index){
      console.log(this.days[Number(index)])
    }
  }
}
