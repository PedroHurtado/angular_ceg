import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CommunicationService<T> {
  private subject$ = new BehaviorSubject<T | null>(null);


  emit(value: T): void {
    this.subject$.next(value);
  }


  get observable$(): Observable<T|null> {
    return this.subject$.asObservable();
  }


}
