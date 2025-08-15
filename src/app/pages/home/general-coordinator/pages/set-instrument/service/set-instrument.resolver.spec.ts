import { TestBed } from '@angular/core/testing';
import { ResolveFn } from '@angular/router';

import { setInstrumentResolver } from './set-instrument.resolver';

describe('setInstrumentResolver', () => {
  const executeResolver: ResolveFn<boolean> = (...resolverParameters) => 
      TestBed.runInInjectionContext(() => setInstrumentResolver(...resolverParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeResolver).toBeTruthy();
  });
});
