import { Component, signal } from '@angular/core';
import { ChildSignal } from '../child-signal/child-signal';

@Component({
  selector: 'app-parent-signal',
  imports: [ChildSignal],
  templateUrl: './parent-signal.html',
  styleUrl: './parent-signal.css'
})
export class ParentSignal {
  data = signal([1, 2, 3, 4, 5, 6])
  constructor() {

    Promise.resolve().then(()=>{
      this.data.update(value=>{
        value[3]=44
        return [...value]
        //return value
      })
    })
    /*Promise.resolve(this.data()).then(data=>{
      data[3]=44
    })*/
  }
  changePage(page:number){
    console.log(page)
  }
  changeData() {
    this.data.update(data => {
      data[3] = 55
      //return [...data]
      return data
    })
    //this.data()[3] =44
  }
}
