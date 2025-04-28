import { TestBed } from '@angular/core/testing';

import { NakshatraService } from './nakshatra.service';

describe('NakshatraService', () => {
  let service: NakshatraService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NakshatraService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
