import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DayTablePage } from './day-table.page';

describe('DayTablePage', () => {
  let component: DayTablePage;
  let fixture: ComponentFixture<DayTablePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(DayTablePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
