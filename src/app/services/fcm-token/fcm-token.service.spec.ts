import { TestBed } from '@angular/core/testing';

import { FcmTokenService } from './fcm-token.service';

describe('FcmTokenService', () => {
  let service: FcmTokenService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FcmTokenService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
