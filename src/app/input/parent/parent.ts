import { Component } from '@angular/core';
import { Child } from '../child/child';

@Component({
  selector: 'app-parent',
  imports: [Child],
  templateUrl: './parent.html',
  styleUrl: './parent.css'
})
export class Parent {
  data:number[]=[1,2,3,4,5,6]
  changeData(){
    this.data[3] =44
  }
  changePage(page:number){
    console.log(page)
  }
}
