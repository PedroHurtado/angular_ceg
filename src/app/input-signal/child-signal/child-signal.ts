import { Component, effect, input, OnChanges, output, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-child-signal',
  imports: [],
  templateUrl: './child-signal.html',
  styleUrl: './child-signal.css'
})
export class ChildSignal implements OnChanges {
  value = input.required<number>()
  page=output<number>()
  constructor(){
    effect(()=>{
      console.log(`value->${this.value()}`)
    })
  }
  ngOnChanges(changes: SimpleChanges): void {
    //console.log(changes)
  }
  changePage(ev:Event){
    ev.stopPropagation()
    this.page.emit(this.value())
  }

}
