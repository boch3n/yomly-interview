export interface ParsedCronExpression {
  minutes: number[];
  hours: number[];
  days_of_month: number[];
  months: number[];
  days_of_week: number[];
  command: string;
}

export class CronParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CronParseError';
  }
}

/**
 * Parse a single cron field (minute, hour, etc.) into an array of valid values
 */
function parseField(
  field: string,
  min: number,
  max: number,
  fieldName: string
): number[] {
  const values = new Set<number>();

  // Split by comma to handle multiple values/ranges
  const parts = field.split(',');

  for (const part of parts) {
    const trimmed = part.trim();

    if (trimmed === '*') {
      // All values in range
      for (let i = min; i <= max; i++) {
        values.add(i);
      }
    } else if (trimmed.includes('/')) {
      // Step values (e.g., */5 or 1-10/2)
      const [range, stepStr] = trimmed.split('/');
      const step = parseInt(stepStr, 10);

      if (isNaN(step) || step <= 0) {
        throw new CronParseError(
          `Invalid step value "${stepStr}" in ${fieldName} field`
        );
      }

      let start = min;
      let end = max;

      if (range !== '*') {
        if (range.includes('-')) {
          const [startStr, endStr] = range.split('-');
          start = parseInt(startStr, 10);
          end = parseInt(endStr, 10);

          if (isNaN(start) || isNaN(end)) {
            throw new CronParseError(
              `Invalid range "${range}" in ${fieldName} field`
            );
          }
        } else {
          start = parseInt(range, 10);
          if (isNaN(start)) {
            throw new CronParseError(
              `Invalid value "${range}" in ${fieldName} field`
            );
          }
          end = max;
        }
      }

      if (start < min || start > max || end < min || end > max) {
        throw new CronParseError(
          `Value out of range in ${fieldName} field (${min}-${max})`
        );
      }

      for (let i = start; i <= end; i += step) {
        values.add(i);
      }
    } else if (trimmed.includes('-')) {
      // Range (e.g., 1-5)
      const [startStr, endStr] = trimmed.split('-');
      const start = parseInt(startStr, 10);
      const end = parseInt(endStr, 10);

      if (isNaN(start) || isNaN(end)) {
        throw new CronParseError(
          `Invalid range "${trimmed}" in ${fieldName} field`
        );
      }

      if (start < min || start > max || end < min || end > max) {
        throw new CronParseError(
          `Value out of range in ${fieldName} field (${min}-${max})`
        );
      }

      for (let i = start; i <= end; i++) {
        values.add(i);
      }
    } else {
      // Single value
      const value = parseInt(trimmed, 10);

      if (isNaN(value)) {
        throw new CronParseError(
          `Invalid value "${trimmed}" in ${fieldName} field`
        );
      }

      if (value < min || value > max) {
        throw new CronParseError(
          `Value ${value} out of range in ${fieldName} field (${min}-${max})`
        );
      }

      values.add(value);
    }
  }

  return Array.from(values).sort((a, b) => a - b);
}

/**
 * Parse a cron expression string into its components
 *
 * @param cronExpression - Standard 5-field cron expression followed by command
 * @returns Parsed cron expression object
 */
export function parseCronExpression(
  cronExpression: string
): ParsedCronExpression {
  if (typeof cronExpression !== 'string') {
    throw new CronParseError('Cron expression must be a string');
  }

  const trimmed = cronExpression.trim();
  if (!trimmed) {
    throw new CronParseError('Cron expression cannot be empty');
  }

  // Split into fields - first 5 are cron fields, rest is command
  const parts = trimmed.split(/\s+/);

  if (parts.length < 6) {
    throw new CronParseError(
      'Cron expression must have 5 time fields followed by a command'
    );
  }

  const [
    minuteField,
    hourField,
    dayField,
    monthField,
    weekdayField,
    ...commandParts
  ] = parts;
  const command = commandParts.join(' ');

  try {
    const minutes = parseField(minuteField, 0, 59, 'minute');
    const hours = parseField(hourField, 0, 23, 'hour');
    const days_of_month = parseField(dayField, 1, 31, 'day of month');
    const months = parseField(monthField, 1, 12, 'month');
    const days_of_week = parseField(weekdayField, 0, 7, 'day of week');

    // Convert Sunday from 7 to 0 and remove duplicates
    const normalizedDaysOfWeek = Array.from(
      new Set(days_of_week.map((day) => (day === 7 ? 0 : day)))
    ).sort((a, b) => a - b);

    return {
      minutes,
      hours,
      days_of_month,
      months,
      days_of_week: normalizedDaysOfWeek,
      command,
    };
  } catch (error) {
    if (error instanceof CronParseError) {
      throw error;
    }
    throw new CronParseError(`Failed to parse cron expression: ${error}`);
  }
}
