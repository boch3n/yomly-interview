# Cron Parser TypeScript

A TypeScript package for parsing standard 5-field cron expressions into their expanded time components.

## Features

- ✅ Parses standard 5-field cron expressions (minute, hour, day of month, month, day of week)
- ✅ Supports all standard cron syntax: `*`, ranges (`1-5`), lists (`1,3,5`), steps (`*/2`, `1-10/3`)
- ✅ Handles Sunday as both `0` and `7`
- ✅ Comprehensive error handling with descriptive messages
- ✅ Written in TypeScript with full type definitions
- ✅ Zero dependencies (except dev dependencies)
- ✅ Thoroughly tested with Jest

## Installation & Setup

Since this is a local development package for the interview, follow these steps:

```bash
# Clone or extract the project
cd cron-parser-ts

# Install dependencies
npm install

# Build the TypeScript code
npm run build

# Run tests to verify everything works
npm test

# Try the demo
npm run demo
```

### Using as a Library

After building, you can use it in your Node.js projects:

```javascript
// In your project file
const { parseCronExpression } = require('./dist/index.js');

const result = parseCronExpression('*/15 0 1,2,3,15 */2 1-5 /usr/bin/find');
console.log(result);
```

## Usage

```typescript
// After building the project
const { parseCronExpression } = require('./dist/index.js');
// Or in TypeScript projects:
// import { parseCronExpression } from './dist/index.js';

// Parse a cron expression
const result = parseCronExpression('*/15 0 1,2,3,15 */2 1-5 /usr/bin/find');

console.log(result);
// Output:
// {
//   "minutes": [0, 15, 30, 45],
//   "hours": [0],
//   "days_of_month": [1, 2, 3, 15],
//   "months": [1, 3, 5, 7, 9, 11],
//   "days_of_week": [1, 2, 3, 4, 5],
//   "command": "/usr/bin/find"
// }
```

## API

### `parseCronExpression(cronExpression: string): ParsedCronExpression`

Parses a cron expression string and returns an object with expanded time fields.

**Parameters:**
- `cronExpression` (string): A standard 5-field cron expression followed by a command

**Returns:** `ParsedCronExpression` object with the following properties:
- `minutes` (number[]): Array of minutes (0-59)
- `hours` (number[]): Array of hours (0-23)
- `days_of_month` (number[]): Array of days of month (1-31)
- `months` (number[]): Array of months (1-12)
- `days_of_week` (number[]): Array of days of week (0-6, where 0 is Sunday)
- `command` (string): The command portion of the cron expression

**Throws:** `CronParseError` for invalid input

## Supported Cron Syntax

| Syntax | Description | Example |
|--------|-------------|---------|
| `*` | All values | `*` (every minute/hour/day/etc.) |
| `number` | Specific value | `5` (5th minute/hour/day/etc.) |
| `start-end` | Range | `1-5` (1st through 5th) |
| `*/step` | Step values | `*/10` (every 10th value) |
| `start-end/step` | Step within range | `10-50/5` (every 5th value from 10 to 50) |
| `value,value,...` | List of values | `1,3,5` (1st, 3rd, and 5th) |

### Field Ranges

- **Minutes**: 0-59
- **Hours**: 0-23
- **Day of Month**: 1-31
- **Month**: 1-12
- **Day of Week**: 0-7 (0 and 7 both represent Sunday)

## Examples

```typescript
// Every 15 minutes
parseCronExpression('*/15 * * * * /path/to/script');

// Weekdays at 9 AM
parseCronExpression('0 9 * * 1-5 /daily/backup');

// First day of every other month
parseCronExpression('0 0 1 */2 * /monthly/report');

// Multiple specific times
parseCronExpression('0,30 8,12,16 * * * /check/status');

// Complex combination
parseCronExpression('15-45/10 9-17 1-15,25-31 1,6,12 1-5 /complex/job');
```

## Error Handling

The package throws `CronParseError` for various invalid inputs:

```typescript
// After building the project, in your local files
const { parseCronExpression, CronParseError } = require('./dist/index.js');

try {
  const result = parseCronExpression('invalid cron');
} catch (error) {
  if (error instanceof CronParseError) {
    console.error('Cron parsing failed:', error.message);
  }
}
```

Common error scenarios:
- Missing fields (less than 6 parts)
- Invalid numeric values
- Values out of range
- Invalid step values (≤ 0)
- Malformed ranges or syntax

## Running the Demo

```bash
# Quick demo with default example
npm run demo

# Test custom cron expressions
npm run build
node demo.js "0 9 * * 1-5 /daily/backup"

# Try various examples
node demo.js "*/15 * * * * /check/status"
node demo.js "0 * * * 0,6 /weekend/job"
node demo.js "15-45/10 9-17 1-15,25-31 1,6,12 1-5 /complex/job"
```

## Development

```bash
# Install dependencies
npm install

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Build
npm run build

# Lint
npm run lint

# Format code
npm run format
```

## LLM/AI Usage Statement

This codebase was initially generated with assistance from Claude AI (Anthropic) but has been thoroughly reviewed, understood, and tested. The AI was used to:

1. **Initial code structure**: Generate the basic TypeScript package setup, configuration files, and project structure
2. **Core parsing logic**: Create the initial implementation of the cron expression parsing algorithm
3. **Test cases**: Generate comprehensive test cases covering various cron expression patterns and edge cases
4. **Documentation**: Create the initial README and code documentation

**Human involvement and understanding:**
- All generated code has been carefully reviewed and understood
- The parsing algorithm logic and design decisions are fully comprehended
- Test coverage has been verified to ensure correctness
- The code follows TypeScript best practices and handles edge cases appropriately
- Error handling and validation logic has been thoughtfully implemented

The maintainer is confident in explaining any aspect of the codebase, including:
- Why specific parsing approaches were chosen
- How edge cases are handled
- The reasoning behind the data structures and algorithms used
- TypeScript type safety considerations