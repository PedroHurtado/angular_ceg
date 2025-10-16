import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Pizzalist } from './pizzalist';

describe('Pizzalist', () => {
  let component: Pizzalist;
  let fixture: ComponentFixture<Pizzalist>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Pizzalist]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Pizzalist);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
