import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Pizzaitem } from './pizzaitem';

describe('Pizzaitem', () => {
  let component: Pizzaitem;
  let fixture: ComponentFixture<Pizzaitem>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Pizzaitem]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Pizzaitem);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
