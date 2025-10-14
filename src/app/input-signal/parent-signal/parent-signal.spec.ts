import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ParentSignal } from './parent-signal';

describe('ParentSignal', () => {
  let component: ParentSignal;
  let fixture: ComponentFixture<ParentSignal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ParentSignal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ParentSignal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
