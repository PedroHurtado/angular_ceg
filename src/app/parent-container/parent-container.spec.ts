import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ParentContainer } from './parent-container';

describe('ParentContainer', () => {
  let component: ParentContainer;
  let fixture: ComponentFixture<ParentContainer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ParentContainer]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ParentContainer);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
