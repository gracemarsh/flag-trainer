# Testing Guide for Flag Trainer

This document provides information on how to run tests and add new tests to the Flag Trainer application.

## Running Tests

### Running All Tests

To run all tests in the project:

```bash
pnpm test
```

### Running Specific Tests

To run tests for a specific file:

```bash
pnpm test path/to/test/file.test.tsx
```

For example:

```bash
pnpm test src/components/ui/button.test.tsx
```

### Running Tests with Coverage

The test command already includes coverage reporting. You can see the coverage report in the terminal after running the tests.

## Test Structure

Tests are organized alongside the files they test, with a `.test.tsx` or `.test.ts` extension.

- `src/lib/utils.test.ts` - Tests for utility functions
- `src/components/ui/button.test.tsx` - Tests for the Button component
- `src/components/ui/card.test.tsx` - Tests for the Card component

## Adding New Tests

### Testing Utility Functions

For utility functions, focus on testing the input/output behavior:

```typescript
import { myFunction } from "./my-file";

describe("myFunction", () => {
  it("should return expected output for valid input", () => {
    expect(myFunction("valid-input")).toBe("expected-output");
  });

  it("should handle edge cases", () => {
    expect(myFunction("")).toBe("fallback-value");
  });
});
```

### Testing React Components

For React components, focus on testing rendering, props, and user interactions:

```typescript
import { render, screen } from '@testing-library/react';
import { MyComponent } from './my-component';

describe('MyComponent', () => {
  it('renders correctly with default props', () => {
    render(<MyComponent />);
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });

  it('applies custom classes when provided', () => {
    render(<MyComponent className="custom-class" />);
    const element = screen.getByText('Expected Text');
    expect(element).toHaveClass('custom-class');
  });
});
```

## Testing Libraries

The project uses the following testing libraries:

- **Jest**: The test runner and assertion library
- **React Testing Library**: For testing React components
- **Jest DOM**: For DOM-specific assertions

## Best Practices

1. **Test Behavior, Not Implementation**: Focus on testing what the component does, not how it does it.
2. **Use Meaningful Assertions**: Make assertions that verify the expected behavior.
3. **Test Edge Cases**: Include tests for edge cases and error handling.
4. **Keep Tests Independent**: Each test should be independent of others.
5. **Use Data Attributes for Testing**: Use `data-testid` attributes to target elements in tests.

## Mocking

For components that depend on external services or context providers, you may need to mock these dependencies. See the Jest setup file (`jest.setup.js`) for examples of mocking Next.js components and APIs.

## Troubleshooting

If you encounter issues with the tests:

1. Make sure all dependencies are installed: `pnpm install`
2. Check that the test file is correctly importing the component or function being tested
3. Verify that the component selectors (like `getByText` or `getByTestId`) are correctly targeting elements
4. Check the Jest and Babel configuration if you're having issues with syntax or transformations
