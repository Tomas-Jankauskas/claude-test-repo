# Claude Code Action Test Repository

<!-- Simple test change for documentation generation - 2025-08-14 -->
This repository is designed to test and demonstrate the automated documentation updates feature of [Claude Code Action](https://github.com/anthropics/claude-code-action).

## What This Repo Tests

- **Automated PR Documentation**: When PRs are merged, Claude automatically generates comprehensive documentation
- **Issue-to-PR Workflow**: Tag `@claude` in issues to have Claude implement features and create PRs
- **Code Review Assistance**: Get AI-powered code review suggestions and improvements
- **Bug Fix Automation**: Let Claude analyze and fix bugs automatically

## Quick Setup for Testing

1. **Create a GitHub repository** from this code
2. **Install the Claude GitHub app**: https://github.com/apps/claude
3. **Add repository secrets**:
   - `ANTHROPIC_API_KEY`: Your Anthropic API key
   - `APP_ID`: GitHub App ID (if using custom app)
   - `APP_PRIVATE_KEY`: GitHub App private key (if using custom app)

## Testing Claude Code Action

### Example Commands to Try

Create issues with these requests and tag `@claude`:

- `@claude implement user authentication for the Express API`
- `@claude add input validation to the user endpoints`  
- `@claude write tests for the utility functions`
- `@claude fix any bugs you find in the codebase`
- `@claude add a database integration layer`
- `@claude implement rate limiting middleware`

## Project Structure

```
claude-test-repo/
├── .github/
│   ├── workflows/        # GitHub Actions for Claude
│   └── ISSUE_TEMPLATE/   # Issue templates
├── src/                  # Source code
│   ├── middleware/       # Express middleware
│   └── utils/           # Utility functions (config, logger)
├── tests/               # Test files
├── docs/
│   └── prs/            # Auto-generated PR docs
└── CLAUDE.md           # Claude configuration
```

## Configuration Management

This project includes a robust configuration utility at `src/utils/config.js` with the following features:

### Features

- **Environment-based configuration** with validation and defaults
- **Type conversion** for numeric values from environment variables
- **Configuration validation** with specific rules for each setting
- **Environment detection** methods (isDevelopment, isProduction, isTest)
- **Specialized configuration getters** for database, server, JWT, and logging
- **Security features** for safe export of configuration (excludes sensitive data)
- **Configuration watching** for hot-reloading capabilities

### Usage Examples

```javascript
import { config } from './src/utils/config.js';

// Basic usage
const port = config.get('PORT'); // 3000
const isDev = config.isDevelopment(); // true/false

// Get specialized configurations
const dbConfig = config.getDatabaseConfig();
const serverConfig = config.getServerConfig();
const jwtConfig = config.getJWTConfig();
const loggingConfig = config.getLoggingConfig();

// Validate required configuration
config.validateRequired(['DATABASE_URL', 'JWT_SECRET']);

// Safe export (excludes sensitive data)
const safeConfig = config.toJSON();

// Watch for configuration changes
config.watch((newConfig, oldConfig) => {
  console.log('Configuration changed:', newConfig);
});
```

## How It Works

1. **Create an issue** describing what you want
2. **Tag @claude** in the issue or comments
3. **Claude analyzes** your request and codebase
4. **Claude creates a PR** with the implementation
5. **After PR merge**, documentation is auto-generated

## Learning Goals

- Understand Claude Code Action capabilities
- Learn AI-assisted development workflows
- Test automated documentation generation
- Explore different types of development requests

Ready to test? Create your first issue and tag @claude!
