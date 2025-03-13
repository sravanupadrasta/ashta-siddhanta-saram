import { TestBed } from '@angular/core/testing';

import { AshtaSiddhantaService } from './ashta-siddhanta.service';

describe('AshtaSiddhantaService', () => {
  let service: AshtaSiddhantaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AshtaSiddhantaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
