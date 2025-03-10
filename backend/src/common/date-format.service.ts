import { Injectable } from '@nestjs/common';

@Injectable()
export class DateFormatService {
  /**
   * Takes a date string in various formats and returns a string formatted as "dd-mm-yyyy".
   * Returns "Invalid Date" if the input cannot be parsed.
   */
  formatDate(inputString: string): string {
    if (!inputString) return '';

    inputString = inputString.trim();

    // If the string contains letters (e.g., month names), use the Date constructor.
    if (/[a-zA-Z]/.test(inputString)) {
      const date = new Date(inputString);
      if (!isNaN(date.getTime())) {
        return this.formatComponents(
          date.getDate(),
          date.getMonth() + 1,
          date.getFullYear(),
        );
      }
    }

    // Determine the separator if present: "/", "-", or "."
    let separator: string | null = null;
    if (inputString.indexOf('/') !== -1) {
      separator = '/';
    } else if (inputString.indexOf('-') !== -1) {
      separator = '-';
    } else if (inputString.indexOf('.') !== -1) {
      separator = '.';
    }

    if (separator) {
      const parts = inputString.split(separator).map((s) => s.trim());
      if (parts.length === 3) {
        let day: string, month: string, year: string;

        // If first part is 4 digits, assume format "YYYY{sep}MM{sep}DD"
        if (parts[0].length === 4) {
          year = parts[0];
          month = parts[1];
          day = parts[2];
        }
        // If third part is 4 digits, assume format "DD{sep}MM{sep}YYYY" (default expected)
        else if (parts[2].length === 4) {
          day = parts[0];
          month = parts[1];
          year = parts[2];
        } else {
          // Otherwise, default to dd/mm/yyyy interpretation
          day = parts[0];
          month = parts[1];
          year = parts[2];
        }

        const d = parseInt(day, 10);
        const m = parseInt(month, 10);
        const y = parseInt(year, 10);

        const date = new Date(y, m - 1, d);
        // Validate that the date object reflects the input
        if (
          date.getFullYear() === y &&
          date.getMonth() + 1 === m &&
          date.getDate() === d
        ) {
          return this.formatComponents(d, m, y);
        }
      }
    }

    // As a last resort, try the Date constructor directly
    const fallbackDate = new Date(inputString);
    if (!isNaN(fallbackDate.getTime())) {
      return this.formatComponents(
        fallbackDate.getDate(),
        fallbackDate.getMonth() + 1,
        fallbackDate.getFullYear(),
      );
    }

    return 'Invalid Date';
  }

  private formatComponents(day: number, month: number, year: number): string {
    const dd = String(day).padStart(2, '0');
    const mm = String(month).padStart(2, '0');
    return `${dd}-${mm}-${year}`;
  }
}
