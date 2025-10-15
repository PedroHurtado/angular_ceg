import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChildDynamic } from './child-dynamic';

describe('ChildDynamic', () => {
  let component: ChildDynamic;
  let fixture: ComponentFixture<ChildDynamic>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChildDynamic]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChildDynamic);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
