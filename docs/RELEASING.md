# Releasing SlideRenewal

This repository is already marked as MIT-licensed, but a public release still needs a few operational checks.

## MIT release checklist

1. Keep [`LICENSE`](../LICENSE) in the repository and in any redistributed source copies.
2. Make sure no real credentials are committed. Use `env.example` as the starting point for local setup.
3. Run the release verification command:

```bash
npm run release:check
```

4. Publish release notes that mention this project depends on a user-provided Google Gemini API key.

## Protect `main` with 1 approval and allow only one bypass user

This repository cannot version-control GitHub branch protection by itself, so the protection must be applied through GitHub settings or the API.

The helper script below configures:

- `main` requires a pull request with at least 1 approval
- administrators are also subject to the rule
- only the specified GitHub user can bypass the pull-request requirement and push directly to `main`

### Prerequisites

- `gh` CLI authenticated against GitHub
- a login that can administer the repository

If `GH_TOKEN` is exported in your shell and it does not have enough permission, the script automatically prefers the stored `gh auth login` credential when one is available.

### Apply the rule

```bash
./scripts/configure-main-branch-protection.sh co-r-e sliderenewal main mokuwaki
```

If you need to target a different repository or bypass user, replace the arguments in order:

```bash
./scripts/configure-main-branch-protection.sh <owner> <repo> <branch> <bypass-user>
```
