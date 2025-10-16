import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CommunicationService<T> {
  private subject$ = new BehaviorSubject<T | null>(null);

  // Emitir un nuevo valor
  emit(value: T): void {
    this.subject$.next(value);
  }

  // Obtener el observable para suscribirse
  get observable$(): Observable<T | null> {
    return this.subject$.asObservable();
  }

  // Obtener el valor actual sin suscripción
  get currentValue(): T | null {
    return this.subject$.getValue();
  }

  // Limpiar el valor
  clear(): void {
    this.subject$.next(null);
  }
}
