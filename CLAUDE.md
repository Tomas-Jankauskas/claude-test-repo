# Claude Configuration

This file provides context and guidelines for Claude when working with this test repository.

## Project Overview

This is a test repository designed to explore and demonstrate Claude Code Action's automated documentation updates feature. The project is a simple Node.js Express API with utility functions and tests.

## Coding Standards

### JavaScript/Node.js
- Use ES6+ features (const/let, arrow functions, destructuring, async/await)
- Follow modern JavaScript patterns and best practices
- Use meaningful variable and function names
- Add JSDoc comments for all functions
- Handle errors gracefully with try/catch blocks
- Use proper HTTP status codes in API responses

### Code Style
- Use 2 spaces for indentation
- Use semicolons
- Use single quotes for strings
- Add trailing commas in objects and arrays
- Maximum line length: 100 characters

### API Design
- Use RESTful conventions
- Structure endpoints as: `/api/v1/resource`
- Use appropriate HTTP methods (GET, POST, PUT, DELETE)
- Return consistent JSON response formats
- Include proper error handling and validation

### Testing
- Write tests for all public functions and API endpoints
- Use descriptive test names that explain what is being tested
- Follow the pattern: describe > test/it blocks
- Mock external dependencies
- Aim for good test coverage but focus on meaningful tests

## Technology Stack

- **Runtime**: Node.js (ES Modules)
- **Framework**: Express.js
- **Testing**: Jest
- **Linting**: ESLint
- **Formatting**: Prettier
- **Utilities**: Lodash

## API Response Format

```javascript
// Success
{ success: true, data: {...}, message: "Operation completed" }

// Error
{ success: false, error: "Error message", code: "ERROR_CODE" }
```

## Goals for This Test Repository

1. **Demonstrate Claude Code Action capabilities**
2. **Test automated documentation generation**
3. **Explore AI-assisted development workflows**
4. **Validate code quality and testing patterns**
5. **Experiment with different types of development requests**

## Notes for Claude

- This is a learning environment - feel free to suggest improvements
- Always explain your reasoning when making significant changes
- Ask questions if requirements are unclear
- Generate comprehensive documentation for merged PRs
- Follow the coding standards consistently
- Add tests for any new functionality
- Consider edge cases and error scenarios
