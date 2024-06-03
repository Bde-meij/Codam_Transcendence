import { TestBed } from '@angular/core/testing';

import { SockService } from './sock.service';

describe('SockService', () => {
  let service: SockService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SockService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
