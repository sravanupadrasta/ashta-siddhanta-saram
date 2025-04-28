import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AnandadiyogamPage } from './anandadiyogam.page';

describe('AnandadiyogamPage', () => {
  let component: AnandadiyogamPage;
  let fixture: ComponentFixture<AnandadiyogamPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AnandadiyogamPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
