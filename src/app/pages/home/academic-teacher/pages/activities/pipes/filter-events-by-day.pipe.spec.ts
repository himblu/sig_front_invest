import { FilterEventsByDayPipe } from './filter-events-by-day.pipe';

describe('FilterEventsByDayPipe', () => {
  it('create an instance', () => {
    const pipe = new FilterEventsByDayPipe();
    expect(pipe).toBeTruthy();
  });
});
