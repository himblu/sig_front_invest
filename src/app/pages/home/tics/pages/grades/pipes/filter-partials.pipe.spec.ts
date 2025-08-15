import { filterPartialsPipe } from './filter-partials.pipe';

describe('filterPartialsPipe', () => {
  it('create an instance', () => {
    const pipe = new filterPartialsPipe();
    expect(pipe).toBeTruthy();
  });
});
