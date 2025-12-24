# PR Guidelines

## Workflow
1. Working branch: `pr-<number>-<description>`.
2. Scope: One PR = One feature/module.
3. Review: Wait for approval before merging or starting next PR.

## Code Standards
- **Strict TypeScript**: No `any`.
- **Components**: Functional components + Hooks.
- **Naming**: PascalCase for components, camelCase for functions/vars.

## Commits
- `feat`: New feature.
- `chore`: Tooling/setup.
- `fix`: Bug fix.
- `docs`: Documentation.
- `style`: Formatting.
- `refactor`: structural improvement.

## Verifications
- `npm run dev` must work.
- `npm run build` must pass.
- No lint errors.
