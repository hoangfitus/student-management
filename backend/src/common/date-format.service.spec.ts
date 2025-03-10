import { DateFormatService } from './date-format.service';

describe('DateFormatService', () => {
  let service: DateFormatService;

  beforeEach(() => {
    service = new DateFormatService();
  });

  describe('formatDate', () => {
    it('should return an empty string when input is empty', () => {
      expect(service.formatDate('')).toBe('');
    });

    it('should trim whitespace and format the date correctly', () => {
      const input = '   15/01/2020   ';
      expect(service.formatDate(input)).toBe('15-01-2020');
    });

    it('should correctly format a date with "/" separator in dd-mm-yyyy format', () => {
      expect(service.formatDate('15/01/2020')).toBe('15-01-2020');
    });

    it('should correctly format a date with "-" separator in dd-mm-yyyy format', () => {
      expect(service.formatDate('15-01-2020')).toBe('15-01-2020');
    });

    it('should correctly format a date in YYYY-MM-DD format', () => {
      // For inputs like "2020-01-15", the first part is 4 digits so it's interpreted as YYYY-MM-DD.
      expect(service.formatDate('2020-01-15')).toBe('15-01-2020');
    });

    it('should correctly format a date with "." separator in dd-mm-yyyy format', () => {
      expect(service.formatDate('15.01.2020')).toBe('15-01-2020');
    });

    it('should format dates when input contains month names', () => {
      // This branch uses the Date constructor.
      expect(service.formatDate('January 15, 2020')).toBe('15-01-2020');
    });

    it('should return "Invalid Date" for an invalid date string', () => {
      expect(service.formatDate('invalid-date')).toBe('Invalid Date');
    });
  });
});
