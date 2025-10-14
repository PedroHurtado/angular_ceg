import { Component, signal, inject, DestroyRef, effect } from '@angular/core';

@Component({
  selector: 'app-timer',
  imports: [],
  templateUrl: './timer.html',
  styleUrl: './timer.css'
})
export class Timer {
  currentDate = signal(new Date());
  private destroyRef = inject(DestroyRef);

  constructor() {
    effect(() => {
      console.log('Timer actualizado:', this.currentDate());
    });

    const intervalId = setInterval(() => {
      this.currentDate.set(new Date());
    }, 1000);

    // Cleanup automático sin ngOnDestroy
    this.destroyRef.onDestroy(() => {
      clearInterval(intervalId);
    });
  }
}
