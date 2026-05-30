# Contributing to Kairos

Thank you for your interest in contributing to Kairos! This document provides guidelines for contributing to the project.

## How to Contribute

### Reporting Issues

If you find a bug or have a suggestion:

1. Check if the issue already exists in the [Issues](../../issues) section
2. If not, create a new issue with a clear title and description
3. Include:
   - Steps to reproduce (for bugs)
   - Expected vs. actual behavior
   - Node version and runtime (Workers / stdio host)
   - The exact JSON-RPC request, if relevant

### Suggesting Enhancements

We welcome suggestions for:

- New frameworks (thinking or persuasion lenses)
- Sharper selection signals for `apply_best_framework`
- Better `wrap()` templates for existing frameworks
- Improved documentation and examples

### Submitting Changes

1. Fork the repository
2. Create a new branch for your changes: `git checkout -b feature/your-feature-name`
3. Make your changes
4. Test your changes thoroughly
5. Commit with a clear message: `git commit -m "Add: description of change"`
6. Push to your fork: `git push origin feature/your-feature-name`
7. Open a Pull Request with a clear description

## Development Guidelines

### Adding a Framework

Append one entry to `FRAMEWORKS` in `src/frameworks.ts` with `id`, `name`,
`category`, `description`, `signals`, and a `wrap(query)` function. It will
automatically appear as a prompt, a resource, an `apply_framework` option, and
an `apply_best_framework` candidate — no other wiring needed. Add tests in
`test/` for the new lens and its selection signals.

### For `wrap()` Templates

- Keep templates concise (ideally under 100 words)
- Persuasion lenses follow the structure: Context → Request → Instruction
- Always include the trimmed query so the user's intent is preserved
- Avoid jargon or overly complex language

### For Code

- TypeScript, `strict` mode; run `npm run typecheck` before opening a PR
- Add or update Vitest tests; `npm test` must pass
- Keep the dispatcher transport-agnostic so both the Worker and stdio benefit
- Comment non-obvious logic

### For Documentation

- Use clear, simple language and include examples where helpful
- Keep formatting consistent and update the Table of Contents when adding sections

## Code of Conduct

### Our Standards

- Be respectful and inclusive
- Provide constructive feedback
- Focus on what's best for the community
- Show empathy toward others

### Unacceptable Behavior

- Harassment or discriminatory language
- Trolling or insulting comments
- Publishing others' private information
- Other unprofessional conduct

## Questions?

If you have questions about contributing, feel free to:

- Open an issue with the "question" label
- Reach out to the maintainers

## Attribution

This Contributing Guide is adapted from open-source contributing guidelines.

Thank you for helping make Kairos better!
