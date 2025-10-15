import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Postcoments } from './postcoments';

describe('Postcoments', () => {
  let component: Postcoments;
  let fixture: ComponentFixture<Postcoments>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Postcoments]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Postcoments);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
