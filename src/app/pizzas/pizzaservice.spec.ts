import { TestBed } from '@angular/core/testing';

import { Pizzaservice } from './pizzaservice';

describe('Pizzaservice', () => {
  let service: Pizzaservice;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Pizzaservice);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
