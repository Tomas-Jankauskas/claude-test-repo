# Claude Code Action Test Repository
<!-- Simple test change for documentation generation - 2025-08-14 -->
<!-- Testing updated workflow with auto PR creation - 2025-08-14 -->

This repository is designed to test and demonstrate the automated documentation updates feature of [Claude Code Action](https://github.com/anthropics/claude-code-action).

## What This Repo Tests

- **Automated PR Documentation**: When PRs are merged, Claude automatically generates comprehensive documentation
- **Issue-to-PR Workflow**: Tag `@claude` in issues to have Claude implement features and create PRs
- **Code Review Assistance**: Get AI-powered code review suggestions and improvements
- **Bug Fix Automation**: Let Claude analyze and fix bugs automatically

## Example Features to Test

- **Add a database integration layer**
- **Implement rate limiting middleware**

## Project Structure

```
claude-test-repo/
├── .github/
│   ├── workflows/     # GitHub Actions for Claude
│   └── ISSUE_TEMPLATE/ # Issue templates
├── src/               # Source code
│   ├── middleware/    # Express middleware
│   └── utils/         # Utility functions (config, logger)
├── tests/             # Test files
├── docs/
│   └── prs/          # Auto-generated PR docs
└── CLAUDE.md         # Claude configuration
```

## Configuration Management

This project includes a robust configuration utility at `src/utils/config.js` with the following features:

### Features

- **Environment-based configuration** with validation and defaults
- **Type conversion** for numeric values from environment variables
- **Validation rules** to ensure configuration integrity
- **Helper methods** for common configuration tasks
- **Environment detection** (development, production, test)
- **Secure defaults** for sensitive configuration values

### Usage

```javascript
import { config } from './src/utils/config.js';

// Get configuration values
const port = config.get('PORT', 3000);
const dbUrl = config.get('DATABASE_URL');

// Environment detection
if (config.isDevelopment()) {
  console.log('Running in development mode');
}

// Get database configuration
const dbConfig = config.getDatabaseConfig();
```

## Testing the Documentation Workflow

1. Create a PR with changes
2. Merge the PR
3. The `pr-autodoc.yml` workflow automatically creates an issue
4. Claude analyzes the PR and generates documentation
5. Documentation is saved to `docs/prs/pr-{number}-{title}.md`

## Recent Updates

- ✅ Fixed workflow dispatch trigger issues
- ✅ Improved Claude instructions to avoid mkdir errors
- ✅ Added cost-effective testing with simple changes
- ✅ Enhanced PR auto-creation instructions

## Contributing

Feel free to create issues and PRs to test the automated documentation system!