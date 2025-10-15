import { Component, effect, ElementRef, viewChild } from '@angular/core';
import { FocusDirective } from './focus-directive';

@Component({
  selector: 'app-focus',
  imports: [FocusDirective],
  templateUrl: './focus.html',
  styleUrl: './focus.css'
})
export class Focus {
  //focus = viewChild.required<ElementRef<HTMLInputElement>>('focus')
  constructor(){
    effect(()=>{
      //this.focus().nativeElement.focus()
    })
  }
}
