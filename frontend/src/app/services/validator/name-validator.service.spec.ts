import { TestBed } from '@angular/core/testing';

import { UniqueNameValidator } from './name-validator.service';

describe('UniqueNameValidator', () => {
  let service: UniqueNameValidator;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UniqueNameValidator);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
