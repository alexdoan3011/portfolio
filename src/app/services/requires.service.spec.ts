import { TestBed } from '@angular/core/testing';

import { RequiresService } from './requires.service';

describe('RequiresService', () => {
  let service: RequiresService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RequiresService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
