import { TestBed } from '@angular/core/testing';

import { ThidhiService } from './thidhi.service';

describe('ThidhiService', () => {
  let service: ThidhiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ThidhiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
