import { Component, effect, ElementRef, viewChild } from '@angular/core';

@Component({
  selector: 'app-focus',
  imports: [],
  templateUrl: './focus.html',
  styleUrl: './focus.css'
})
export class Focus {
  focus = viewChild.required<ElementRef<HTMLInputElement>>('focus')
  constructor(){
    effect(()=>{
      this.focus().nativeElement.focus()
    })
  }
}
