import { TestBed } from '@angular/core/testing';

import { SunriseService } from './sunrise.service';

describe('SunriseService', () => {
  let service: SunriseService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SunriseService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
