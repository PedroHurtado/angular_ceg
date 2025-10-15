import { Component, viewChild,
  ViewContainerRef,
  AfterViewInit, signal, effect, ComponentRef, OnDestroy } from '@angular/core';

@Component({
  selector: 'app-parent-container',
  imports: [],
  templateUrl: './parent-container.html',
  styleUrl: './parent-container.css'
})
export class ParentContainer implements AfterViewInit, OnDestroy {
  contenedor = viewChild.required('container', { read: ViewContainerRef });
  counter = signal(0)

  //private componentRef?: ComponentRef<any>;

  private currentSuscription:any

  constructor() {
    /*effect(() => {
      const value = this.counter()
      // el efecto si está esta linea antes
      // de la evaluación de compomentRef
      this.componentRef?.setInput('value', this.counter)
    })*/
  }
  ngOnDestroy(): void {
    this.removeSuscrition()
  }
  add() {
    this.counter.set(this.counter() + 1)
  }
  ngAfterViewInit(): void {
    this.loadComponent()
  }
  async loadComponent() {
    this.contenedor().clear()
    this.removeSuscrition()

    const { ChildDynamic } = await import('../child-dynamic/child-dynamic')

    const ref = this.contenedor().createComponent(ChildDynamic)
    ref.setInput('value', this.counter)
    this.currentSuscription = ref.instance.changeData.subscribe((data: number) => {
      console.log('Dato recibido del hijo:', data);
    });

  }
  private removeSuscrition(){
    if (this.currentSuscription){
      this.currentSuscription.unsubscribe()
      this.currentSuscription = null
    }
  }

}
