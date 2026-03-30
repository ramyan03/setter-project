import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FundsTableComponent } from './funds-table.component';

describe('FundsTableComponent', () => {
  let component: FundsTableComponent;
  let fixture: ComponentFixture<FundsTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FundsTableComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FundsTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
