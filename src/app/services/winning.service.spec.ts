import { TestBed } from '@angular/core/testing';

import { WinningService } from './winning.service';

describe('WinningService', () => {
  let service: WinningService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WinningService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
