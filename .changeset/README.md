# Changesets

Add a changeset in a feature PR:

```sh
pnpm changeset
```

Merging to `main` opens a Version Packages PR. Merging that PR bumps `package.json`, updates `CHANGELOG.md`, and creates a git tag. The About dialog reads the version from `package.json`.
