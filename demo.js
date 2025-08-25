const { parseCronExpression } = require('./dist/index.js');

// Get cron expression from command line arguments or use default
const cronExpression = process.argv[2] || '*/15 0 1,2,3,15 */2 1-5 /usr/bin/find';

console.log('🕐 Cron Parser Demo');
console.log('==================');
console.log(`Input: "${cronExpression}"`);
console.log('');

try {
  const result = parseCronExpression(cronExpression);

  console.log('Parsed Result:');
  console.log('└─ Minutes:', result.minutes.join(', '));
  console.log('└─ Hours:', result.hours.join(', '));
  console.log('└─ Days of Month:', result.days_of_month.join(', '));
  console.log('└─ Months:', result.months.join(', '));
  console.log('└─ Days of Week:', result.days_of_week.join(', '));
  console.log('└─ Command:', result.command);

  console.log('\nJSON Output:');
  console.log(JSON.stringify(result, null, 2));

} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}