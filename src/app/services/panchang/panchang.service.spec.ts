import { TestBed } from '@angular/core/testing';

import { PanchangService } from './panchang.service';

describe('PanchangService', () => {
  let service: PanchangService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PanchangService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
