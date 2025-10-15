import { Directive, ElementRef, inject } from '@angular/core';

@Directive({
  selector: '[appFocusDirective]'
})
export class FocusDirective {

  constructor() {
    const element = inject(ElementRef)
    element.nativeElement.focus()
  }

}
