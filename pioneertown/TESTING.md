# Testing Configuration

This project uses Vitest as the test runner with React Testing Library for component testing.

## Test Scripts

- `npm test` - Run tests in watch mode
- `npm run test:run` - Run tests once
- `npm run test:coverage` - Run tests with coverage report
- `npm run test:ui` - Run tests with Vitest UI (requires @vitest/ui)

## Test Structure

Tests are located in `src/__tests__/` directory with the following naming convention:
- Component tests: `ComponentName.test.jsx`
- Hook tests: `hookName.test.jsx`
- Utility tests: `utilityName.test.js`

## Test Configuration

### Vitest Config (vite.config.js)
- **Environment**: jsdom (for DOM testing)
- **Setup Files**: `src/setupTests.js`
- **Coverage Provider**: v8
- **Coverage Formats**: text, json, html

### Setup File (src/setupTests.js)
- Imports `@testing-library/jest-dom` matchers
- Mocks Web MIDI API for testing
- Mocks performance APIs and console methods
- Provides global test utilities

## Example Test Structure

```javascript
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Component from '../components/Component';

describe('Component', () => {
  it('should render correctly', () => {
    render(<Component />);
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });
});
```

## Testing Best Practices

1. **Component Tests**: Test user interactions and visual output
2. **Hook Tests**: Test state changes and side effects
3. **Utility Tests**: Test pure functions and edge cases
4. **Mocking**: Mock external dependencies (MIDI API, etc.)
5. **Coverage**: Aim for high test coverage of critical paths

## Current Test Coverage

Run `npm run test:coverage` to see current coverage statistics. Coverage reports are generated in:
- Terminal: Text format
- `coverage/` directory: HTML format for detailed analysis

## MIDI-Specific Testing

Since this is a MIDI application, the following are mocked in tests:
- `navigator.requestMIDIAccess()` - Returns mock MIDI access
- Performance APIs - For smooth test execution
- Console methods - To reduce test noise

## Adding New Tests

1. Create test file in `src/__tests__/`
2. Use appropriate file extension (`.jsx` for components, `.js` for utilities)
3. Import necessary testing utilities
4. Follow existing test patterns
5. Run tests to ensure they pass
6. Check coverage impact
