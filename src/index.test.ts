import { parseCronExpression, CronParseError } from './index';

describe('parseCronExpression', () => {
  test('parses the example cron expression correctly', () => {
    const result = parseCronExpression('*/15 0 1,2,3,15 */2 1-5 /usr/bin/find');

    expect(result).toEqual({
      minutes: [0, 15, 30, 45],
      hours: [0],
      days_of_month: [1, 2, 3, 15],
      months: [1, 3, 5, 7, 9, 11],
      days_of_week: [1, 2, 3, 4, 5],
      command: '/usr/bin/find',
    });
  });

  test('parses wildcard fields', () => {
    const result = parseCronExpression('* * * * * echo hello');

    expect(result.minutes).toEqual(Array.from({ length: 60 }, (_, i) => i));
    expect(result.hours).toEqual(Array.from({ length: 24 }, (_, i) => i));
    expect(result.days_of_month).toEqual(
      Array.from({ length: 31 }, (_, i) => i + 1)
    );
    expect(result.months).toEqual(Array.from({ length: 12 }, (_, i) => i + 1));
    expect(result.days_of_week).toEqual([0, 1, 2, 3, 4, 5, 6]);
    expect(result.command).toBe('echo hello');
  });

  test('parses single values', () => {
    const result = parseCronExpression('30 14 15 6 2 /bin/backup');

    expect(result).toEqual({
      minutes: [30],
      hours: [14],
      days_of_month: [15],
      months: [6],
      days_of_week: [2],
      command: '/bin/backup',
    });
  });

  test('parses ranges', () => {
    const result = parseCronExpression('0-30 9-17 1-15 1-6 1-5 work_hours');

    expect(result.minutes).toEqual(Array.from({ length: 31 }, (_, i) => i));
    expect(result.hours).toEqual([9, 10, 11, 12, 13, 14, 15, 16, 17]);
    expect(result.days_of_month).toEqual(
      Array.from({ length: 15 }, (_, i) => i + 1)
    );
    expect(result.months).toEqual([1, 2, 3, 4, 5, 6]);
    expect(result.days_of_week).toEqual([1, 2, 3, 4, 5]);
    expect(result.command).toBe('work_hours');
  });

  test('parses step values with asterisk', () => {
    const result = parseCronExpression('*/10 */2 */5 */3 */2 step_test');

    expect(result.minutes).toEqual([0, 10, 20, 30, 40, 50]);
    expect(result.hours).toEqual([0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22]);
    expect(result.days_of_month).toEqual([1, 6, 11, 16, 21, 26, 31]);
    expect(result.months).toEqual([1, 4, 7, 10]);
    expect(result.days_of_week).toEqual([0, 2, 4, 6]);
  });

  test('parses step values with ranges', () => {
    const result = parseCronExpression(
      '10-50/20 8-18/5 1-15/7 2-8/3 1-5/2 range_step'
    );

    expect(result.minutes).toEqual([10, 30, 50]);
    expect(result.hours).toEqual([8, 13, 18]);
    expect(result.days_of_month).toEqual([1, 8, 15]);
    expect(result.months).toEqual([2, 5, 8]);
    expect(result.days_of_week).toEqual([1, 3, 5]);
  });

  test('parses comma-separated values', () => {
    const result = parseCronExpression(
      '0,15,30,45 6,12,18 1,15,31 1,7 0,6 weekend_work'
    );

    expect(result.minutes).toEqual([0, 15, 30, 45]);
    expect(result.hours).toEqual([6, 12, 18]);
    expect(result.days_of_month).toEqual([1, 15, 31]);
    expect(result.months).toEqual([1, 7]);
    expect(result.days_of_week).toEqual([0, 6]);
  });

  test('parses mixed comma and range expressions', () => {
    const result = parseCronExpression(
      '0,30 9-11,14-16 1-5,25-31 1,6,12 1-3,5 mixed_expr'
    );

    expect(result.minutes).toEqual([0, 30]);
    expect(result.hours).toEqual([9, 10, 11, 14, 15, 16]);
    expect(result.days_of_month).toEqual([
      1, 2, 3, 4, 5, 25, 26, 27, 28, 29, 30, 31,
    ]);
    expect(result.months).toEqual([1, 6, 12]);
    expect(result.days_of_week).toEqual([1, 2, 3, 5]);
  });

  test('handles Sunday as both 0 and 7', () => {
    const result1 = parseCronExpression('0 0 1 1 0 sunday_0');
    const result2 = parseCronExpression('0 0 1 1 7 sunday_7');
    const result3 = parseCronExpression('0 0 1 1 0,7 sunday_both');

    expect(result1.days_of_week).toEqual([0]);
    expect(result2.days_of_week).toEqual([0]);
    expect(result3.days_of_week).toEqual([0]); // Should deduplicate
  });

  test('parses commands with spaces', () => {
    const result = parseCronExpression(
      '0 0 * * * /usr/bin/find /var/log -name "*.log" -delete'
    );

    expect(result.command).toBe('/usr/bin/find /var/log -name "*.log" -delete');
  });

  test('throws error for empty input', () => {
    expect(() => parseCronExpression('')).toThrow(CronParseError);
    expect(() => parseCronExpression('   ')).toThrow(CronParseError);
  });

  test('throws error for non-string input', () => {
    expect(() => parseCronExpression(null as any)).toThrow(CronParseError);
    expect(() => parseCronExpression(123 as any)).toThrow(CronParseError);
  });

  test('throws error for insufficient fields', () => {
    expect(() => parseCronExpression('0 0 * *')).toThrow(CronParseError);
    expect(() => parseCronExpression('0 0 * * * ')).toThrow(CronParseError);
  });

  test('throws error for invalid numeric values', () => {
    expect(() => parseCronExpression('abc 0 1 1 1 cmd')).toThrow(
      CronParseError
    );
    expect(() => parseCronExpression('0 xyz 1 1 1 cmd')).toThrow(
      CronParseError
    );
  });

  test('throws error for out of range values', () => {
    expect(() => parseCronExpression('60 0 1 1 1 cmd')).toThrow(CronParseError);
    expect(() => parseCronExpression('0 24 1 1 1 cmd')).toThrow(CronParseError);
    expect(() => parseCronExpression('0 0 0 1 1 cmd')).toThrow(CronParseError);
    expect(() => parseCronExpression('0 0 32 1 1 cmd')).toThrow(CronParseError);
    expect(() => parseCronExpression('0 0 1 0 1 cmd')).toThrow(CronParseError);
    expect(() => parseCronExpression('0 0 1 13 1 cmd')).toThrow(CronParseError);
    expect(() => parseCronExpression('0 0 1 1 8 cmd')).toThrow(CronParseError);
  });

  test('throws error for invalid step values', () => {
    expect(() => parseCronExpression('*/0 0 1 1 1 cmd')).toThrow(
      CronParseError
    );
    expect(() => parseCronExpression('*/-1 0 1 1 1 cmd')).toThrow(
      CronParseError
    );
    expect(() => parseCronExpression('*/abc 0 1 1 1 cmd')).toThrow(
      CronParseError
    );
  });

  test('throws error for invalid ranges', () => {
    expect(() => parseCronExpression('1-abc 0 1 1 1 cmd')).toThrow(
      CronParseError
    );
    expect(() => parseCronExpression('abc-5 0 1 1 1 cmd')).toThrow(
      CronParseError
    );
  });

  test('handles edge cases with whitespace', () => {
    const result = parseCronExpression('  0   0   1   1   1   echo   test  ');

    expect(result.command).toBe('echo test');
    expect(result.minutes).toEqual([0]);
  });

  test('parses complex real-world examples', () => {
    // Every weekday at 9 AM
    const result1 = parseCronExpression(
      '0 9 * * 1-5 /opt/scripts/daily_backup.sh'
    );
    expect(result1.minutes).toEqual([0]);
    expect(result1.hours).toEqual([9]);
    expect(result1.days_of_week).toEqual([1, 2, 3, 4, 5]);

    // Every 15 minutes during business hours on weekdays
    const result2 = parseCronExpression('*/15 9-17 * * 1-5 /usr/bin/monitor');
    expect(result2.minutes).toEqual([0, 15, 30, 45]);
    expect(result2.hours).toEqual([9, 10, 11, 12, 13, 14, 15, 16, 17]);
    expect(result2.days_of_week).toEqual([1, 2, 3, 4, 5]);

    // First day of every other month at midnight
    const result3 = parseCronExpression(
      '0 0 1 */2 * /scripts/monthly_report.py'
    );
    expect(result3.minutes).toEqual([0]);
    expect(result3.hours).toEqual([0]);
    expect(result3.days_of_month).toEqual([1]);
    expect(result3.months).toEqual([1, 3, 5, 7, 9, 11]);
  });

  test('handles step value of 1 as full range', () => {
    const result = parseCronExpression('*/1 * * * * cmd');
    expect(result.minutes).toEqual(Array.from({ length: 60 }, (_, i) => i));
  });

  test('handles single-value ranges correctly', () => {
    const result = parseCronExpression('5-5 0 1 1 1 cmd');
    expect(result.minutes).toEqual([5]);
  });

  test('handles stepped ranges correctly', () => {
    const result = parseCronExpression('1-10/3 0 1 1 1 cmd');
    expect(result.minutes).toEqual([1, 4, 7, 10]);
  });

  test('throws error when command is empty after time fields', () => {
    expect(() => parseCronExpression('0 0 * * *    ')).toThrow(CronParseError);
  });

  test('deduplicates overlapping values from ranges and lists', () => {
    const result = parseCronExpression('1-3,2-4 0 1 1 1 cmd');
    expect(result.minutes).toEqual([1, 2, 3, 4]); // no duplicates
  });

  test('deduplicates explicit duplicate values', () => {
    const result = parseCronExpression('0,0,0 0 1 1 1 cmd');
    expect(result.minutes).toEqual([0]);
  });
});
