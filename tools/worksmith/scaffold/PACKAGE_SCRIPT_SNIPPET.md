<!--
Non-authoritative template. Copy the relevant lines into your project's own
package.json "scripts" object, adjust paths only if you placed the copied files
somewhere other than scripts/, and delete this comment block.
-->

# package.json Script Snippet

Minimum required lines:

```json
{
  "scripts": {
    "project": "tsx scripts/project-administration/cli.ts",
    "project:test": "tsx --test --test-concurrency=1 scripts/project-administration/tests/project-administration.test.ts"
  }
}
```

Required dev dependency:

```json
{
  "devDependencies": {
    "tsx": "^4.0.0",
    "typescript": "^5.0.0"
  }
}
```

Worksmith itself has no other third-party runtime dependency — it uses only Node.js
built-in modules (`node:fs/promises`, `node:path`, `node:child_process`, `node:test`,
etc.) plus `tsx` to run TypeScript directly.

## Optional Compatibility Aliases

ArmBase additionally exposes each top-level command as its own npm script for direct
invocation without the unified dispatcher. These are optional conveniences, not
required for Worksmith to function:

```json
{
  "scripts": {
    "project:allocate-id": "tsx scripts/allocate-work-item-id.ts",
    "project:complete": "tsx scripts/complete-work-item.ts",
    "project:create-work-item": "tsx scripts/create-work-item.ts",
    "project:transition": "tsx scripts/transition-work-item.ts",
    "project:validate": "tsx scripts/validate-project-administration.ts"
  }
}
```

Only add these if you specifically want the direct-invocation aliases; the unified
`npm run project -- <command>` entrypoint already reaches every command.
