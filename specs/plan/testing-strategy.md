# Testing Strategy

This document outlines the comprehensive testing approach for the Flag Trainer application to ensure high quality, reliability, and maintainability.

## Testing Goals

The primary goals of our testing strategy are to:

1. **Ensure Functionality**: Verify that all features work as specified in requirements
2. **Prevent Regressions**: Catch issues before they reach production
3. **Improve Code Quality**: Use testing as a tool to drive better design
4. **Enable Refactoring**: Create safety nets for future code changes
5. **Document Behavior**: Tests serve as executable documentation

## Testing Pyramid

We follow a balanced testing pyramid approach with multiple layers of testing:

```
    /\
   /  \
  /E2E \
 /------\
/  INT   \
/----------\
/ UNIT TESTS \
--------------
```

### Unit Tests

- **Scope**: Individual functions, hooks, and small components
- **Percentage**: ~70% of total tests
- **Tools**: Vitest, React Testing Library
- **Coverage Target**: 80%+ for core business logic

### Integration Tests

- **Scope**: Component interactions, pages, API routes
- **Percentage**: ~20% of total tests
- **Tools**: Vitest, MSW (Mock Service Worker), React Testing Library
- **Coverage Target**: Key user flows and critical paths

### End-to-End Tests

- **Scope**: Complete user journeys across the application
- **Percentage**: ~10% of total tests
- **Tools**: Playwright
- **Coverage Target**: Critical business workflows

## Test Types and Responsibilities

### Frontend Tests

#### Component Tests

- Render testing with React Testing Library
- Prop validation
- Event handling
- State changes
- Accessibility testing

#### Hook Tests

- Custom hook behavior verification
- State management
- Side effect handling

#### Page Tests

- Page composition
- Data fetching
- Routing behavior

### Backend Tests

#### API Route Tests

- Request validation
- Response structure
- Error handling
- Authentication/authorization

#### Database Tests

- Query correctness
- Schema validation
- Migration testing

#### Integration Tests

- API and database interactions
- External service mocking

### Full Stack Tests

#### User Flow Tests

- End-to-end user journeys
- Cross-component interactions
- Real API interactions (or realistic mocks)

## Test Data Strategy

### Test Data Sources

1. **Fixture Data**: Static JSON files for predictable test data
2. **Factories**: Functions to generate test data with sensible defaults
3. **Seeded Test Database**: For integration/E2E tests

### Test Database Approach

- Use an isolated test database
- Reset database between test runs
- Seed with known test data
- Use transactions for test isolation

## Testing Tools and Libraries

### Core Testing Tools

- **Vitest**: Fast unit and integration testing framework
- **React Testing Library**: Component testing with user-centric approach
- **Playwright**: End-to-end testing across browsers
- **MSW (Mock Service Worker)**: API mocking
- **Testing Library User Event**: Simulate user interactions

### Testing Utilities

- **Mock Functions**: Vitest mock functions for dependencies
- **Snapshot Testing**: For UI component verification
- **Coverage Reports**: Track test coverage
- **Visual Regression**: Compare UI changes (optional)

## Test Environment

### Local Development

- Run unit and selected integration tests on file changes
- Dedicated npm scripts for different test types
- Pre-commit hooks for quick tests

### CI Environment

- Run all tests on pull requests
- Parallel test execution for speed
- Test against multiple Node.js versions if needed
- Browser matrix testing for E2E

## Testing Best Practices

### Code Organization

- Co-locate tests with implementation files
- Use consistent naming: `[filename].test.ts` or `[filename].spec.ts`
- Group tests logically with describe blocks
- Clear test descriptions with it/test blocks

### Test Structure

- Follow the Arrange-Act-Assert pattern
- Focus on behavior, not implementation details
- One assertion per test when possible
- Use setup and teardown hooks appropriately

### Mocking Strategy

- Prefer real implementations over mocks when practical
- Mock external dependencies and services
- Document mock behavior clearly
- Reset mocks between tests

## Test-Driven Development

For critical or complex features, we follow a TDD approach:

1. **Red**: Write a failing test that defines the expected behavior
2. **Green**: Implement the minimal code to make the test pass
3. **Refactor**: Improve the code while keeping tests passing

## Continuous Testing

### PR Validation

- All tests must pass before merging
- Coverage should not decrease significantly
- New features require appropriate test coverage

### Test Monitoring

- Track test performance and execution time
- Monitor flaky tests and fix promptly
- Regular reviews of test quality

## Testing Schedule

- **Daily**: Unit tests and critical path tests (developers)
- **PR Validation**: All tests
- **Nightly**: Full test suite including long-running tests
- **Weekly**: Manual exploratory testing

## Specialized Testing

### Accessibility Testing

- Automated accessibility checks with axe
- Keyboard navigation testing
- Screen reader compatibility testing

### Performance Testing

- Component render performance
- API response time tests
- Load time benchmarks

### Security Testing

- Authentication/authorization tests
- Input validation and sanitization
- CSRF protection verification

## Test Example

```typescript
// Example unit test for spaced repetition algorithm
import { calculateNextReview } from '../lib/spaced-repetition'

describe('calculateNextReview', () => {
  it('should increase interval for correct answers', () => {
    const result = calculateNextReview(
      4, // performance rating (good)
      2.5, // previous ease factor
      1 // previous interval in days
    )

    expect(result.interval).toBeGreaterThan(1)
    expect(result.easeFactor).toBeGreaterThanOrEqual(2.5)
    expect(result.nextReviewDate).toBeInstanceOf(Date)
  })

  it('should reset interval for difficult answers', () => {
    const result = calculateNextReview(
      2, // performance rating (difficult)
      2.5, // previous ease factor
      10 // previous interval in days
    )

    expect(result.interval).toBe(1)
    expect(result.easeFactor).toBeLessThan(2.5)
    expect(result.nextReviewDate).toBeInstanceOf(Date)
  })
})
```
