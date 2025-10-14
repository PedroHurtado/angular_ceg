import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-child',
  imports: [],
  templateUrl: './child.html',
  styleUrl: './child.css'
})
export class Child {
  @Input() value:number=0
  @Output() page= new EventEmitter<number>()
  notifyChanges(){
    this.page.emit(this.value)
  }
}
