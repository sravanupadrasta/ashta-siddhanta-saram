import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PanchangPage } from './panchang.page';

describe('PanchangPage', () => {
  let component: PanchangPage;
  let fixture: ComponentFixture<PanchangPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(PanchangPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
