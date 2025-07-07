# Contributing to PDS Maker

We welcome contributions to the PDS Maker project! This document provides guidelines for contributing to the project.

## Code of Conduct

This project adheres to a [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

## How to Contribute

### Reporting Bugs

1. Check if the bug has already been reported in [Issues](https://github.com/your-org/pds-maker/issues)
2. If not, create a new issue with:
   - Clear description of the bug
   - Steps to reproduce
   - Expected vs actual behavior
   - Environment details (OS, Node version, etc.)

### Suggesting Features

1. Check existing [Feature Requests](https://github.com/your-org/pds-maker/issues?q=is%3Aissue+label%3A%22feature+request%22)
2. Create a new issue with:
   - Clear description of the feature
   - Use case and benefits
   - Possible implementation approach

### Pull Requests

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass: `npm test`
6. Run linting: `npm run lint:fix`
7. Commit with conventional commits format
8. Push to your fork
9. Submit a pull request

### Development Setup

```bash
# Clone your fork
git clone https://github.com/your-username/pds-maker.git
cd pds-maker

# Install dependencies
npm install

# Set up environment
cp .env.example .env
# Edit .env with your configuration

# Start development servers
npm run dev
```

### Code Style

- Use TypeScript for all new code
- Follow existing code style and patterns
- Use meaningful variable and function names
- Write clear comments for complex logic
- Ensure code passes ESLint and Prettier checks

### Testing

- Write unit tests for new functions
- Write integration tests for API endpoints
- Ensure all tests pass before submitting PR
- Aim for high test coverage

### Documentation

- Update README.md if needed
- Document new API endpoints
- Add inline code documentation
- Update changelog for significant changes

## Project Structure

```
pds-maker/
├── api/                 # Backend API
│   ├── src/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── models/
│   │   └── routes/
├── web/                 # Frontend application
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── services/
├── mobile-sdk/          # Mobile SDK
├── docs/               # Documentation
├── examples/           # Usage examples
└── tests/              # Test files
```

## Commit Message Format

Use [Conventional Commits](https://www.conventionalcommits.org/):

```
type(scope): description

[optional body]

[optional footer]
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Adding tests
- `chore`: Maintenance tasks

Example:
```
feat(api): add PDS auto-fix validation

- Implement date format validation
- Add name format correction
- Include comprehensive error messages

Closes #123
```

## Release Process

1. Update version in package.json
2. Update CHANGELOG.md
3. Create pull request
4. After merge, create release tag
5. GitHub Actions will handle deployment

## Getting Help

- Join our [Discord community](https://discord.gg/pds-maker)
- Check [Documentation](docs/)
- Create an issue for questions

## Recognition

Contributors will be recognized in:
- README.md contributors section
- Release notes
- Annual contributor acknowledgments

Thank you for contributing to PDS Maker!