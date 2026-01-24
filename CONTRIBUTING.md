# Contributing to Mull

Thank you for your interest in contributing to Mull! We welcome contributions from everyone.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Code Style](#code-style)
- [Commit Convention](#commit-convention)
- [Pull Request Process](#pull-request-process)
- [Adding Transaction Types](#adding-transaction-types)

## Code of Conduct

Please be respectful and considerate of others. We are committed to providing a welcoming and inclusive environment for everyone.

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/mull.git`
3. Create a new branch: `git checkout -b feature/your-feature-name`
4. Make your changes
5. Push to your fork and submit a pull request

## Development Setup

### Prerequisites

- Node.js 20+
- npm 10+

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run linting
npm run lint

# Run type checking
npm run typecheck

# Format code
npm run format
```

### Environment Variables

Create a `.env.local` file in the root directory:

```env
# No required environment variables for basic development
```

## Code Style

We use ESLint and Prettier to maintain code quality. The configuration is already set up in the project.

### TypeScript

- Use TypeScript for all new files
- Define proper types and interfaces
- Avoid `any` type unless absolutely necessary
- Use meaningful variable and function names

### React/Next.js

- Use functional components with hooks
- Keep components small and focused
- Use `"use client"` directive only when necessary
- Follow the App Router conventions

### CSS/Tailwind

- Use Tailwind CSS utility classes
- Follow mobile-first responsive design
- Maintain dark mode support for all UI elements
- Use semantic color classes (e.g., `text-slate-600` not `text-gray-600`)

### File Naming

- Components: `PascalCase.tsx` (e.g., `TransactionFlow.tsx`)
- Utilities: `kebab-case.ts` (e.g., `format-utils.ts`)
- Types: Define in `lib/types.ts` or co-locate with component

## Commit Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/). Your commit messages should be structured as:

```
type(scope): description

[optional body]

[optional footer]
```

### Types

| Type       | Description                                      |
| ---------- | ------------------------------------------------ |
| `feat`     | New feature                                      |
| `fix`      | Bug fix                                          |
| `docs`     | Documentation changes                            |
| `style`    | Code style changes (formatting, semicolons)      |
| `refactor` | Code refactoring without feature/fix             |
| `perf`     | Performance improvements                         |
| `test`     | Adding or updating tests                         |
| `build`    | Build system or external dependencies            |
| `ci`       | CI configuration changes                         |
| `chore`    | Maintenance tasks                                |
| `revert`   | Revert previous commit                           |

### Examples

```
feat(flow): add bridge transaction visualization
fix(api): handle null timestamp in recent transactions
docs: update README with new features
refactor(components): extract Header into separate component
```

## Pull Request Process

1. **Create an issue first** for significant changes
2. **Keep PRs focused** - one feature or fix per PR
3. **Update documentation** if needed
4. **Add tests** for new functionality (when applicable)
5. **Ensure CI passes** - all checks must be green
6. **Request review** from maintainers

### PR Checklist

- [ ] Code follows the project style guide
- [ ] Self-review completed
- [ ] Comments added for complex logic
- [ ] No new warnings generated
- [ ] Tested locally on both mainnet and testnet
- [ ] Responsive design verified (mobile + desktop)
- [ ] Dark mode verified

## Adding Transaction Types

Mull supports various Sui transaction types. To add a new type:

### 1. Update Type Detection

In `lib/explanation-engine.ts`, add detection logic:

```typescript
if (/* your condition */) {
  type = "your_type";
  summary = "Description of transaction";
}
```

### 2. Add Flow Visualization

In `app/components/TransactionFlow.tsx`:

1. Add your type to `flowActions` filter
2. Add node role if needed with appropriate colors
3. Implement visualization logic

### 3. Update Type Config

In `app/components/RecentTransactions.tsx`, add to `typeConfig`:

```typescript
your_type: {
  icon: "🔷",
  color: "text-blue-600 dark:text-blue-400",
  bgColor: "bg-blue-100 dark:bg-blue-900/50",
},
```

### 4. Test with Real Transactions

Always test with real transaction digests from both mainnet and testnet.

## Questions?

Feel free to open an issue or reach out to the maintainers:

- Twitter: [@JihunWeb3](https://x.com/getMullWeb3)
- GitHub Issues: [mull/issues](https://github.com/leopard627/mull/issues)

Thank you for contributing! 🎨
