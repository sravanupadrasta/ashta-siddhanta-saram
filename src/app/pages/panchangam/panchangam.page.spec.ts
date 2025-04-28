import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PanchangamPage } from './panchangam.page';

describe('PanchangamPage', () => {
  let component: PanchangamPage;
  let fixture: ComponentFixture<PanchangamPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(PanchangamPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
