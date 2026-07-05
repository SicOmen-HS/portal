import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { access, mkdtemp, mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import {
  allocateIdentifier,
  isWorkItemIdentifier,
  type IdentifierState
} from "../identifiers";
import { ARMBASE_PROJECT_ADMINISTRATION_CONFIG } from "../configuration";
import { initializeProject } from "../initialize-project";
import { getWorksmithMessage } from "../localization";
import {
  MUTATION_LOCK_FILENAME,
  RepositoryMutationLockError,
  withRepositoryMutationLock
} from "../mutation-lock";
import {
  ARMBASE_PRESENTATION_DEFAULTS,
  ARMBASE_V1_POLICY_PROFILE
} from "../presentation-configuration";
import { insertQueueEntry, moveQueueEntry } from "../queue";
import { parseStrictJson } from "../strict-json";
import { isKnownDispositionStatus, parseTopicConvention } from "../topic-convention";
import { parseTopicTaxonomy, TopicTaxonomyError } from "../topic-taxonomy";
import { executeCoordinatedTransaction } from "../transaction-service";
import { renderWorksmithShellCommand } from "../worksmith-output";
import {
  createWorksmithError,
  createWorksmithSuccess
} from "../worksmith-result";

const TEST_DIRECTORY = path.dirname(fileURLToPath(import.meta.url));
const REPOSITORY_ROOT = path.resolve(TEST_DIRECTORY, "../../..");
const TSX_CLI = path.join(REPOSITORY_ROOT, "node_modules", "tsx", "dist", "cli.mjs");
const SCRIPTS = {
  unified: path.join(REPOSITORY_ROOT, "scripts", "project-administration", "cli.ts"),
  legacyUnified: path.join(REPOSITORY_ROOT, "scripts", "project.ts"),
  allocate: path.join(REPOSITORY_ROOT, "scripts", "allocate-work-item-id.ts"),
  create: path.join(REPOSITORY_ROOT, "scripts", "create-work-item.ts"),
  transition: path.join(REPOSITORY_ROOT, "scripts", "transition-work-item.ts"),
  complete: path.join(REPOSITORY_ROOT, "scripts", "complete-work-item.ts"),
  validate: path.join(REPOSITORY_ROOT, "scripts", "validate-project-administration.ts"),
  draftCompile: path.join(REPOSITORY_ROOT, "scripts", "draft-compile.ts")
} as const;

const QUEUE_SECTIONS = [
  "Inbox",
  "Backlog",
  "Parking Lot",
  "Ready",
  "In Progress",
  "Needs Review",
  "Done"
] as const;

interface CommandResult {
  status: number | null;
  stdout: string;
  stderr: string;
}

interface WorkItemOptions {
  id: string;
  title?: string;
  status?: string;
  completedOn?: string | null;
  legacy?: boolean;
  metadataJson?: string;
  /** Raw Markdown body appended after the title/metadata; defaults to a minimal Background section. */
  body?: string;
}

function runScript(script: string, arguments_: string[], cwd: string, stdin?: string): CommandResult {
  const result = spawnSync(process.execPath, [TSX_CLI, script, ...arguments_], {
    cwd,
    encoding: "utf8",
    ...(stdin === undefined ? {} : { input: stdin }),
    env: { ...process.env, FORCE_COLOR: "0", NO_COLOR: "1" },
    windowsHide: true
  });

  if (result.error !== undefined) {
    throw result.error;
  }

  return {
    status: result.status,
    stdout: result.stdout,
    stderr: result.stderr
  };
}

function parseJsonOutput(result: CommandResult): Record<string, unknown> {
  assert.equal(result.status, 0, result.stderr);
  return JSON.parse(result.stdout) as Record<string, unknown>;
}

function renderQueue(entries: Readonly<Record<string, readonly string[]>> = {}): string {
  return `${QUEUE_SECTIONS.map((section) => {
    const sectionEntries = entries[section] ?? [];
    return `## ${section}\n\n${sectionEntries.join("\n\n")}`;
  }).join("\n\n")}\n`;
}

function queueEntry(id: string, title: string, completedOn?: string): string {
  return [
    `- ${id} - ${title}`,
    `  See: docs/work-items/${id}.md`,
    ...(completedOn === undefined ? [] : [`  Completed: ${completedOn}`])
  ].join("\n");
}

function renderWorkItem(options: WorkItemOptions): string {
  const title = options.title ?? "Test Work Item";
  const body = options.body ?? "## Background\n\nTest fixture.\n";
  if (options.legacy === true) {
    return `# ${options.id} - ${title}\n\n${options.body ?? "## Background\n\nLegacy fixture.\n"}`;
  }

  const metadata =
    options.metadataJson ??
    JSON.stringify(
      {
        schema_version: 1,
        id: options.id,
        prefix: options.id.slice(0, 2),
        title,
        status: options.status ?? "ready",
        created_on: "2026-06-30",
        completed_on: options.completedOn ?? null
      },
      null,
      2
    );

  return `# ${options.id} - ${title}\n\n<!-- ARMBASE_WORK_ITEM_METADATA_START\n${metadata}\nARMBASE_WORK_ITEM_METADATA_END -->\n\n${body}`;
}

async function createRepository(
  queue = renderQueue(),
  workItems: readonly WorkItemOptions[] = []
): Promise<string> {
  const root = await mkdtemp(path.join(os.tmpdir(), "armbase-project-admin-"));
  await mkdir(path.join(root, "docs", "work-items"), { recursive: true });
  await writeFile(path.join(root, "docs", "WORK_QUEUE.md"), queue, "utf8");

  for (const workItem of workItems) {
    await writeFile(
      path.join(root, "docs", "work-items", `${workItem.id}.md`),
      renderWorkItem(workItem),
      "utf8"
    );
  }

  return root;
}

async function withRepository(
  callback: (root: string) => Promise<void>,
  queue?: string,
  workItems?: readonly WorkItemOptions[]
): Promise<void> {
  const root = await createRepository(queue, workItems);
  try {
    await callback(root);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
}

function creationManifest(): Record<string, unknown> {
  const sections = Object.fromEntries(
    [
      "background",
      "goal",
      "scope",
      "requirements",
      "verification",
      "acceptance_criteria",
      "out_of_scope",
      "deliverables"
    ].map((section) => [section, [`Test ${section.replaceAll("_", " ")}.`]])
  );

  return {
    schema_version: 1,
    operation: "create_work_item",
    work_item: {
      id: "auto",
      prefix: "AB",
      title: "Create Test Work Item",
      initial_status: "ready",
      created_on: "2026-06-30",
      sections
    },
    documentation: { changes: [] },
    git: {
      commit_message: "test: create fixture work item",
      commit: false,
      push: false
    }
  };
}

async function writeTopicTaxonomy(root: string, content: string): Promise<void> {
  await mkdir(path.join(root, ".worksmith"), { recursive: true });
  await writeFile(path.join(root, ".worksmith", "topics.json"), content, "utf8");
}

function sampleTopicsJson(): string {
  return JSON.stringify(
    {
      schema_version: 1,
      topics: [
        { id: "worksmith", label: "Worksmith / Project Administration" },
        { id: "parser-import", label: "Parser & Import" }
      ]
    },
    null,
    2
  );
}

function presentationConfiguration(): Record<string, unknown> {
  return {
    schema_version: 1,
    project: {
      name: "Fixture",
      profile: "armbase-v1"
    },
    output: {
      language: "en",
      target: "handoff",
      shell: "bash",
      color: "never",
      warning_detail: "summary"
    }
  };
}

test("Worksmith result core defines stable envelope and boundary fields", () => {
  const success = createWorksmithSuccess(
    "allocate_id",
    { value: 42 },
    {
      diagnostics: [{ code: "TEST_INFO", severity: "info", message: "Test information." }],
      changedFiles: [{ path: "docs/example.md", operation: "updated" }],
      nextActions: [
        {
          id: "review",
          description: "Review the result.",
          command: { executable: "npm", arguments: ["run", "project:test"] }
        }
      ]
    }
  );

  assert.deepEqual(success, {
    result_version: 1,
    producer: "worksmith",
    command: "allocate_id",
    status: "success",
    exit_code: 0,
    diagnostics: [{ code: "TEST_INFO", severity: "info", message: "Test information." }],
    changed_files: [{ path: "docs/example.md", operation: "updated" }],
    next_actions: [
      {
        id: "review",
        description: "Review the result.",
        command: { executable: "npm", arguments: ["run", "project:test"] }
      }
    ],
    payload: { value: 42 }
  });

  assert.deepEqual(createWorksmithError("allocate_id", "TEST_ERROR", "Test failed."), {
    result_version: 1,
    producer: "worksmith",
    command: "allocate_id",
    status: "error",
    exit_code: 1,
    diagnostics: [{ code: "TEST_ERROR", severity: "error", message: "Test failed." }],
    changed_files: [],
    next_actions: [],
    payload: {}
  });
});

test("shared transaction service rolls back marked steps in reverse order", async () => {
  const events: string[] = [];

  await assert.rejects(
    executeCoordinatedTransaction({
      steps: [
        {
          rollbackFailureLabel: "first rollback failed",
          apply: async (markForRollback) => {
            events.push("apply first");
            markForRollback();
          },
          rollback: async () => {
            events.push("rollback first");
          }
        },
        {
          rollbackFailureLabel: "second rollback failed",
          apply: async (markForRollback) => {
            events.push("apply second");
            markForRollback();
            throw new Error("apply failed");
          },
          rollback: async () => {
            events.push("rollback second");
          }
        }
      ],
      afterApply: async () => {
        events.push("after apply");
      },
      createRollbackError: (message) => new Error(`rollback: ${message}`)
    }),
    /apply failed/
  );

  assert.deepEqual(events, ["apply first", "apply second", "rollback second", "rollback first"]);
});

test("shared transaction service preserves rollback failure diagnostics", async () => {
  await assert.rejects(
    executeCoordinatedTransaction({
      steps: [
        {
          rollbackFailureLabel: "work-item rollback failed",
          apply: async (markForRollback) => {
            markForRollback();
          },
          rollback: async () => {
            throw new Error("restore failed");
          }
        }
      ],
      afterApply: async () => {
        throw new Error("post-write validation failed");
      },
      createRollbackError: (message) => new Error(`ROLLBACK_FAILED: ${message}`)
    }),
    /ROLLBACK_FAILED: post-write validation failed; work-item rollback failed: Error: restore failed/
  );
});

test("repository mutation lock is exclusive and released after success", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "armbase-project-lock-"));
  const lockPath = path.join(root, MUTATION_LOCK_FILENAME);
  try {
    await withRepositoryMutationLock(
      "outer_operation",
      async () => {
        const lock = JSON.parse(await readFile(lockPath, "utf8")) as Record<string, unknown>;
        assert.equal(lock.lock_version, 1);
        assert.equal(lock.operation, "outer_operation");
        assert.equal(lock.pid, process.pid);

        await assert.rejects(
          withRepositoryMutationLock("concurrent_operation", async () => undefined, root),
          (error: unknown) =>
            error instanceof RepositoryMutationLockError && error.code === "MUTATION_LOCK_HELD"
        );
      },
      root
    );
    await assert.rejects(access(lockPath), { code: "ENOENT" });
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("repository mutation lock is released after a handled operation failure", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "armbase-project-lock-failure-"));
  const lockPath = path.join(root, MUTATION_LOCK_FILENAME);
  try {
    await assert.rejects(
      withRepositoryMutationLock(
        "failing_operation",
        async () => {
          throw new Error("operation failed");
        },
        root
      ),
      /operation failed/
    );
    await assert.rejects(access(lockPath), { code: "ENOENT" });
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("strict JSON parsing accepts nested values and rejects malformed or duplicate keys", () => {
  assert.deepEqual(parseStrictJson('{"outer":{"value":1},"items":[true,null]}'), {
    outer: { value: 1 },
    items: [true, null]
  });
  assert.throws(() => parseStrictJson('{"id":1,"id":2}'), /Duplicate JSON key/);
  assert.throws(() => parseStrictJson('{"id":'), SyntaxError);
});

test("initialization dry-run performs zero writes", async () => {
  const parent = await mkdtemp(path.join(os.tmpdir(), "armbase-project-init-dry-run-"));
  const target = path.join(parent, "new-project");
  try {
    const output = parseJsonOutput(runScript(SCRIPTS.unified, ["init", target, "--dry-run"], parent));
    assert.equal(output.dry_run, true);
    assert.equal(output.applied, false);
    await assert.rejects(access(target), { code: "ENOENT" });
  } finally {
    await rm(parent, { recursive: true, force: true });
  }
});

test("initialization creates a valid minimal structure and refuses overwrites", async () => {
  const parent = await mkdtemp(path.join(os.tmpdir(), "armbase-project-init-"));
  const target = path.join(parent, "new-project");
  try {
    const output = parseJsonOutput(runScript(SCRIPTS.unified, ["init", target], parent));
    assert.equal(output.applied, true);
    assert.deepEqual(await readdir(path.join(target, "docs", "work-items")), []);
    const queue = await readFile(path.join(target, "docs", "WORK_QUEUE.md"), "utf8");
    assert.match(queue, /## Inbox[\s\S]*## Done/);
    await assert.rejects(access(path.join(target, MUTATION_LOCK_FILENAME)), { code: "ENOENT" });
    assert.equal(runScript(SCRIPTS.validate, [], target).status, 0);

    const repeated = runScript(SCRIPTS.unified, ["init", target], parent);
    assert.equal(repeated.status, 1);
    assert.match(repeated.stderr, /INIT_REFUSES_OVERWRITE/);
    assert.equal(await readFile(path.join(target, "docs", "WORK_QUEUE.md"), "utf8"), queue);
  } finally {
    await rm(parent, { recursive: true, force: true });
  }
});

test("initialization refuses an already-held target mutation lock", async () => {
  const parent = await mkdtemp(path.join(os.tmpdir(), "armbase-project-init-lock-"));
  const target = path.join(parent, "new-project");
  const lockPath = path.join(target, MUTATION_LOCK_FILENAME);
  try {
    await mkdir(target, { recursive: true });
    await writeFile(lockPath, "simulated active initialization\n", "utf8");

    const result = runScript(SCRIPTS.unified, ["init", target], parent);
    assert.equal(result.status, 1);
    assert.match(result.stderr, /MUTATION_LOCK_HELD/);
    assert.equal(await readFile(lockPath, "utf8"), "simulated active initialization\n");
    await assert.rejects(access(path.join(target, "docs")), { code: "ENOENT" });
  } finally {
    await rm(parent, { recursive: true, force: true });
  }
});

test("initialization accepts reusable configuration paths", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "project-admin-config-init-"));
  try {
    const config = {
      ...ARMBASE_PROJECT_ADMINISTRATION_CONFIG,
      applicationName: "Fixture Project Administration",
      paths: {
        workItemsDirectory: "planning/items",
        workQueue: "state/project/QUEUE.md"
      }
    };
    const output = await initializeProject(root, false, config);
    assert.equal(output.configuration, "Fixture Project Administration");
    assert.deepEqual(await readdir(path.join(root, "planning", "items")), []);
    assert.match(await readFile(path.join(root, "state", "project", "QUEUE.md"), "utf8"), /## Done/);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("identifier allocation uses the highest file or queue reservation and ignores gaps", () => {
  const state: IdentifierState = {
    fileIdentifiers: [
      { identifier: "AB-001", location: "one" },
      { identifier: "AB-004", location: "four" },
      { identifier: "AN-009", location: "analysis" }
    ],
    queueIdentifiers: [{ identifier: "AB-007", location: "queue" }]
  };

  assert.deepEqual(allocateIdentifier("AB", state), {
    allocatedId: "AB-008",
    highestExisting: "AB-007"
  });
});

test("identifiers support canonical widths from three through five digits", () => {
  assert.equal(isWorkItemIdentifier("AB-001"), true);
  assert.equal(isWorkItemIdentifier("AB-1000"), true);
  assert.equal(isWorkItemIdentifier("AB-99999"), true);
  assert.equal(isWorkItemIdentifier("AB-01000"), false);
  assert.equal(isWorkItemIdentifier("AB-100000"), false);

  const state: IdentifierState = {
    fileIdentifiers: [{ identifier: "AB-999", location: "last-three-digit" }],
    queueIdentifiers: []
  };
  assert.deepEqual(allocateIdentifier("AB", state), {
    allocatedId: "AB-1000",
    highestExisting: "AB-999"
  });
  assert.throws(
    () =>
      allocateIdentifier("AB", {
        fileIdentifiers: [{ identifier: "AB-99999", location: "range-end" }],
        queueIdentifiers: []
      }),
    /No 3-5 digit AB identifiers remain/
  );
});

test("allocator rejects invalid prefixes and detects duplicate identifiers", async () => {
  await withRepository(async (root) => {
    const invalid = runScript(SCRIPTS.allocate, ["XX"], root);
    assert.equal(invalid.status, 1);
    assert.equal(
      invalid.stderr,
      `${JSON.stringify(
        {
          error: {
            code: "INVALID_PREFIX",
            message: "Unsupported prefix 'XX'. Expected AB, AN or IM."
          }
        },
        null,
        2
      )}\n`
    );
  });

  const duplicated: IdentifierState = {
    fileIdentifiers: [
      { identifier: "AB-001", location: "one" },
      { identifier: "AB-001", location: "two" }
    ],
    queueIdentifiers: []
  };
  assert.throws(() => allocateIdentifier("AB", duplicated), /Duplicate work-item identifiers/);
});

test("queue mutations preserve CRLF formatting and canonical entry fields", () => {
  const queue = renderQueue().replaceAll("\n", "\r\n");
  const inserted = insertQueueEntry(queue, "Ready", "AB-001", "Queue Test");
  assert.match(inserted.content, /## Ready\r\n\r\n- AB-001 - Queue Test\r\n  See:/);
  assert.equal(inserted.content.replaceAll("\r\n", "").includes("\n"), false);

  const moved = moveQueueEntry(
    inserted.content,
    "AB-001",
    "Queue Test",
    "Ready",
    "Done",
    "2026-06-30"
  );
  assert.match(moved.content, /## Done\r\n\r\n- AB-001 - Queue Test/);
  assert.match(moved.content, /  Completed: 2026-06-30/);
});

test("queue command lists canonical sections including empty sections without writes", async () => {
  const queue = renderQueue({
    Ready: [queueEntry("AB-001", "Ready Item")],
    Done: [queueEntry("AB-002", "Done Item", "2026-06-30")]
  });
  await withRepository(
    async (root) => {
      const queuePath = path.join(root, "docs", "WORK_QUEUE.md");
      const readyPath = path.join(root, "docs", "work-items", "AB-001.md");
      const donePath = path.join(root, "docs", "work-items", "AB-002.md");
      const originalQueue = await readFile(queuePath, "utf8");
      const originalReady = await readFile(readyPath, "utf8");
      const originalDone = await readFile(donePath, "utf8");

      const result = runScript(SCRIPTS.unified, ["queue"], root);
      const explicitTerminal = runScript(
        SCRIPTS.unified,
        ["queue", "--output", "terminal"],
        root
      );
      assert.equal(result.status, 0);
      assert.equal(result.stderr, "");
      assert.equal(explicitTerminal.status, 0);
      assert.equal(explicitTerminal.stderr, "");
      assert.equal(explicitTerminal.stdout, result.stdout);
      assert.equal(
        result.stdout,
        [
          "ArmBase Project Administration CLI",
          "",
          "Work Queue",
          "",
          "## Inbox (0)",
          "(empty)",
          "",
          "## Backlog (0)",
          "(empty)",
          "",
          "## Parking Lot (0)",
          "(empty)",
          "",
          "## Ready (1)",
          "- AB-001 - Ready Item",
          "",
          "## In Progress (0)",
          "(empty)",
          "",
          "## Needs Review (0)",
          "(empty)",
          "",
          "## Done (1)",
          "- AB-002 - Done Item (completed 2026-06-30)",
          "",
          "Total: 2",
          ""
        ].join("\n")
      );
      assert.match(result.stdout, /^ArmBase Project Administration CLI\n\nWork Queue\n/);
      assert.match(result.stdout, /## Inbox \(0\)\n\(empty\)/);
      assert.match(result.stdout, /## Ready \(1\)\n- AB-001 - Ready Item/);
      assert.match(
        result.stdout,
        /## Done \(1\)\n- AB-002 - Done Item \(completed 2026-06-30\)/
      );
      assert.match(result.stdout, /Total: 2\n$/);

      let previousIndex = -1;
      for (const section of QUEUE_SECTIONS) {
        const sectionIndex = result.stdout.indexOf(`## ${section} (`);
        assert.ok(sectionIndex > previousIndex, `${section} should use canonical order.`);
        previousIndex = sectionIndex;
      }

      assert.equal(await readFile(queuePath, "utf8"), originalQueue);
      assert.equal(await readFile(readyPath, "utf8"), originalReady);
      assert.equal(await readFile(donePath, "utf8"), originalDone);
    },
    queue,
    [
      { id: "AB-001", title: "Ready Item", status: "ready" },
      { id: "AB-002", title: "Done Item", status: "done", completedOn: "2026-06-30" }
    ]
  );
});

test("missing presentation config uses immutable ArmBase compatibility defaults", async () => {
  assert.equal(Object.isFrozen(ARMBASE_V1_POLICY_PROFILE), true);
  assert.equal(Object.isFrozen(ARMBASE_PROJECT_ADMINISTRATION_CONFIG), true);
  assert.equal(Object.isFrozen(ARMBASE_PROJECT_ADMINISTRATION_CONFIG.validTransitions), true);
  assert.equal(Object.isFrozen(ARMBASE_PRESENTATION_DEFAULTS), true);
  assert.equal(Object.isFrozen(ARMBASE_PRESENTATION_DEFAULTS.project), true);
  assert.equal(Object.isFrozen(ARMBASE_PRESENTATION_DEFAULTS.output), true);

  await withRepository(async (root) => {
    const output = parseJsonOutput(runScript(SCRIPTS.unified, ["config"], root));
    assert.deepEqual(output, {
      path: ".worksmith.json",
      source: "built_in_defaults",
      effective_configuration: {
        schema_version: 1,
        project: { name: "ArmBase", profile: "armbase-v1" },
        output: {
          language: "en",
          target: "terminal",
          shell: "powershell",
          color: "auto",
          warning_detail: "summary"
        }
      }
    });
  });
});

test("presentation language falls back to English for legacy config and catalog misses", async () => {
  await withRepository(async (root) => {
    const configuration = presentationConfiguration();
    delete (configuration.output as Record<string, unknown>).language;
    await writeFile(
      path.join(root, ".worksmith.json"),
      JSON.stringify(configuration),
      "utf8"
    );

    const effective = parseJsonOutput(runScript(SCRIPTS.unified, ["config"], root));
    assert.equal(
      (effective.effective_configuration as { output: { language: string } }).output.language,
      "en"
    );
    const terminal = runScript(
      SCRIPTS.unified,
      ["queue", "--output", "terminal"],
      root
    );
    assert.match(terminal.stdout, /^Fixture Project Administration CLI\n\nWork Queue\n/);
  });
  assert.equal(getWorksmithMessage("unsupported", "queue.title"), "Work Queue");
});

test("Swedish generic queue and config output preserve machine tokens and authored values", async () => {
  const queue = renderQueue({
    Ready: [queueEntry("AB-001", "Ready Item")],
    Done: [queueEntry("AB-002", "Done Item", "2026-06-30")]
  });
  await withRepository(async (root) => {
    const configuration = presentationConfiguration();
    const output = configuration.output as Record<string, unknown>;
    output.language = "sv";
    output.target = "terminal";
    await writeFile(
      path.join(root, ".worksmith.json"),
      JSON.stringify(configuration),
      "utf8"
    );

    const terminal = runScript(SCRIPTS.unified, ["queue"], root);
    assert.equal(terminal.status, 0);
    assert.match(terminal.stdout, /^Fixture projektadministrations-CLI\n\nArbetskö\n/);
    assert.match(terminal.stdout, /## Ready \(1\)\n- AB-001 - Ready Item/);
    assert.match(terminal.stdout, /## Inbox \(0\)\n\(tom\)/);
    assert.match(terminal.stdout, /Done Item \(slutförd 2026-06-30\)/);
    assert.match(terminal.stdout, /Totalt: 2\n$/);
    assert.doesNotMatch(terminal.stdout, /## Redo|AB-ett|Redo objekt/);

    const handoff = runScript(
      SCRIPTS.unified,
      ["queue", "--output", "handoff", "--shell", "bash"],
      root
    );
    assert.equal(handoff.status, 0);
    assert.match(handoff.stdout, /^# Worksmith kööverlämning\n/);
    assert.match(handoff.stdout, /## Resultat/);
    assert.match(handoff.stdout, /- Kommando: `queue_list`/);
    assert.match(handoff.stdout, /- Status: `success`/);
    assert.match(handoff.stdout, /## Utförda åtgärder/);
    assert.match(handoff.stdout, /## Föreslagna nästa åtgärder/);
    assert.match(handoff.stdout, /```bash\nnpm run project -- validate\n```/);
    assert.match(handoff.stdout, /- AB-001 - Ready Item/);

    const configTerminal = runScript(
      SCRIPTS.unified,
      ["config", "--output", "terminal"],
      root
    );
    assert.equal(configTerminal.status, 0);
    assert.match(configTerminal.stdout, /^Effektiv konfiguration\n/);
    assert.match(configTerminal.stdout, /Källa: configuration_file/);
    assert.match(configTerminal.stdout, /Sökväg: \.worksmith\.json/);
    assert.match(configTerminal.stdout, /Profil: armbase-v1/);
    assert.match(configTerminal.stdout, /Språk: sv/);
    assert.match(configTerminal.stdout, /Utmatningsmål: terminal/);

    const jsonResult = runScript(
      SCRIPTS.unified,
      ["queue", "--output", "json"],
      root
    );
    const json = parseJsonOutput(jsonResult);
    assert.equal(json.command, "queue_list");
    assert.equal(json.status, "success");
    assert.deepEqual(json.next_actions, [
      {
        id: "validate",
        description: "Validate project administration state.",
        command: { executable: "npm", arguments: ["run", "project", "--", "validate"] }
      }
    ]);
  }, queue, [
    { id: "AB-001", title: "Ready Item", status: "ready" },
    { id: "AB-002", title: "Done Item", status: "done", completedOn: "2026-06-30" }
  ]);
});

test("unsupported presentation language fails before writes", async () => {
  await withRepository(async (root) => {
    const configuration = presentationConfiguration();
    (configuration.output as Record<string, unknown>).language = "de";
    const configPath = path.join(root, ".worksmith.json");
    const manifestPath = path.join(root, "manifest.json");
    const queuePath = path.join(root, "docs", "WORK_QUEUE.md");
    await writeFile(configPath, JSON.stringify(configuration), "utf8");
    await writeFile(manifestPath, JSON.stringify(creationManifest()), "utf8");
    const originalQueue = await readFile(queuePath, "utf8");

    const result = runScript(SCRIPTS.unified, ["create", manifestPath], root);
    assert.equal(result.status, 1);
    assert.match(result.stderr, /output\.language must be one of: en, sv/);
    assert.deepEqual(await readdir(path.join(root, "docs", "work-items")), []);
    assert.equal(await readFile(queuePath, "utf8"), originalQueue);
  });
});

test("valid presentation config affects queue output and flags take precedence", async () => {
  const queue = renderQueue({ Ready: [queueEntry("AB-001", "Ready Item")] });
  await withRepository(async (root) => {
    const queuePath = path.join(root, "docs", "WORK_QUEUE.md");
    const originalQueue = await readFile(queuePath, "utf8");
    await writeFile(
      path.join(root, ".worksmith.json"),
      JSON.stringify(presentationConfiguration(), null, 2),
      "utf8"
    );

    const effective = parseJsonOutput(runScript(SCRIPTS.unified, ["config"], root));
    assert.equal(effective.source, "configuration_file");
    assert.deepEqual(effective.effective_configuration, presentationConfiguration());
    const configTerminal = runScript(
      SCRIPTS.unified,
      ["config", "--output", "terminal"],
      root
    );
    assert.equal(configTerminal.status, 0);
    assert.match(configTerminal.stdout, /^Effective Configuration\n/);
    assert.match(configTerminal.stdout, /Language: en/);

    const configured = runScript(SCRIPTS.unified, ["queue"], root);
    assert.equal(configured.status, 0);
    assert.match(configured.stdout, /^# Worksmith Queue Handoff\n/);
    assert.match(configured.stdout, /- Project: Fixture/);
    assert.match(configured.stdout, /```bash\nnpm run project -- validate\n```/);

    const targetOverride = runScript(
      SCRIPTS.unified,
      ["queue", "--output", "terminal"],
      root
    );
    assert.equal(targetOverride.status, 0);
    assert.match(targetOverride.stdout, /^Fixture Project Administration CLI\n/);

    const shellOverride = runScript(
      SCRIPTS.unified,
      ["queue", "--output", "handoff", "--shell", "powershell"],
      root
    );
    assert.equal(shellOverride.status, 0);
    assert.match(shellOverride.stdout, /```powershell\nnpm run project -- validate\n```/);
    assert.equal(await readFile(queuePath, "utf8"), originalQueue);
  }, queue, [{ id: "AB-001", title: "Ready Item", status: "ready" }]);
});

test("invalid presentation config blocks mutation before repository writes", async () => {
  await withRepository(async (root) => {
    const manifestPath = path.join(root, "manifest.json");
    const queuePath = path.join(root, "docs", "WORK_QUEUE.md");
    await writeFile(manifestPath, JSON.stringify(creationManifest()), "utf8");
    await writeFile(
      path.join(root, ".worksmith.json"),
      JSON.stringify({
        ...presentationConfiguration(),
        project: { name: "Fixture", profile: "custom-policy" }
      }),
      "utf8"
    );
    const originalQueue = await readFile(queuePath, "utf8");

    const result = runScript(SCRIPTS.unified, ["create", manifestPath], root);
    assert.equal(result.status, 1);
    assert.match(result.stderr, /"code": "INVALID_PRESENTATION_CONFIGURATION"/);
    assert.match(result.stderr, /project\.profile must be one of: armbase-v1/);
    assert.deepEqual(await readdir(path.join(root, "docs", "work-items")), []);
    assert.equal(await readFile(queuePath, "utf8"), originalQueue);
  });
});

test("presentation config rejects unknown fields and duplicate strict JSON keys", async () => {
  await withRepository(async (root) => {
    const configPath = path.join(root, ".worksmith.json");
    await writeFile(
      configPath,
      JSON.stringify({ ...presentationConfiguration(), prefixes: ["XX"] }),
      "utf8"
    );
    const unknown = runScript(SCRIPTS.unified, ["config"], root);
    assert.equal(unknown.status, 1);
    assert.match(unknown.stderr, /Unknown field\(s\) in configuration: prefixes/);

    await writeFile(
      configPath,
      '{"schema_version":1,"schema_version":1,"project":{"name":"ArmBase","profile":"armbase-v1"},"output":{"target":"terminal","shell":"powershell","color":"auto","warning_detail":"full"}}',
      "utf8"
    );
    const duplicate = runScript(SCRIPTS.unified, ["config"], root);
    assert.equal(duplicate.status, 1);
    assert.match(duplicate.stderr, /Duplicate JSON key\(s\): schema_version/);
  });
});

test("queue JSON output emits the deterministic Worksmith result envelope", async () => {
  const queue = renderQueue({ Ready: [queueEntry("AB-001", "Ready Item")] });
  await withRepository(async (root) => {
    const first = runScript(SCRIPTS.unified, ["queue", "--output", "json"], root);
    const second = runScript(SCRIPTS.unified, ["queue", "--output", "json"], root);
    assert.equal(first.status, 0);
    assert.equal(first.stderr, "");
    assert.equal(first.stdout, second.stdout);

    const output = JSON.parse(first.stdout) as Record<string, unknown>;
    assert.equal(output.result_version, 1);
    assert.equal(output.producer, "worksmith");
    assert.equal(output.command, "queue_list");
    assert.equal(output.status, "success");
    assert.equal(output.exit_code, 0);
    assert.deepEqual(output.diagnostics, []);
    assert.deepEqual(output.changed_files, []);
    assert.deepEqual(output.next_actions, [
      {
        id: "validate",
        description: "Validate project administration state.",
        command: { executable: "npm", arguments: ["run", "project", "--", "validate"] }
      }
    ]);
    const payload = output.payload as { sections: Array<{ name: string }>; total_items: number };
    assert.deepEqual(
      payload.sections.map((section) => section.name),
      QUEUE_SECTIONS
    );
    assert.equal(payload.total_items, 1);
  }, queue, [{ id: "AB-001", title: "Ready Item", status: "ready" }]);
});

test("queue handoff output is stable Markdown with selectable shell fences", async () => {
  const queue = renderQueue({ Ready: [queueEntry("AB-001", "Ready Item")] });
  await withRepository(async (root) => {
    const powershell = runScript(
      SCRIPTS.unified,
      ["queue", "--output", "handoff", "--shell", "powershell"],
      root
    );
    assert.equal(powershell.status, 0);
    assert.equal(powershell.stderr, "");
    assert.match(powershell.stdout, /^# Worksmith Queue Handoff\n/);
    assert.match(powershell.stdout, /## Completed Actions/);
    assert.match(powershell.stdout, /## Suggested Next Actions/);
    assert.match(powershell.stdout, /### Ready \(1\)\n- AB-001 - Ready Item/);
    assert.match(powershell.stdout, /```powershell\nnpm run project -- validate\n```/);
    assert.doesNotMatch(powershell.stdout, /--approved/);

    const bash = runScript(
      SCRIPTS.unified,
      ["queue", "--output", "handoff", "--shell", "bash"],
      root
    );
    assert.equal(bash.status, 0);
    assert.equal(bash.stderr, "");
    assert.match(bash.stdout, /```bash\nnpm run project -- validate\n```/);
  }, queue, [{ id: "AB-001", title: "Ready Item", status: "ready" }]);
});

test("PowerShell and Bash handoff commands use deterministic shell quoting", () => {
  const command = {
    executable: "npm",
    arguments: ["run", "project", "--", "value with space", "owner's"]
  };
  assert.equal(
    renderWorksmithShellCommand(command, "powershell"),
    "npm run project -- 'value with space' 'owner''s'"
  );
  assert.equal(
    renderWorksmithShellCommand(command, "bash"),
    `npm run project -- 'value with space' 'owner'"'"'s'`
  );
});

test("unsupported queue output options fail without writes", async () => {
  await withRepository(async (root) => {
    const queuePath = path.join(root, "docs", "WORK_QUEUE.md");
    const originalQueue = await readFile(queuePath, "utf8");

    const unsupportedOutput = runScript(
      SCRIPTS.unified,
      ["queue", "--output", "yaml"],
      root
    );
    assert.equal(unsupportedOutput.status, 1);
    assert.match(unsupportedOutput.stderr, /Unsupported output 'yaml'/);

    const invalidCombination = runScript(
      SCRIPTS.unified,
      ["queue", "--shell", "bash"],
      root
    );
    assert.equal(invalidCombination.status, 1);
    assert.match(invalidCombination.stderr, /supported only with --output handoff/);

    const unsupportedCommand = runScript(
      SCRIPTS.unified,
      ["allocate-id", "AB", "--output", "json"],
      root
    );
    assert.equal(unsupportedCommand.status, 1);
    assert.match(unsupportedCommand.stderr, /"code": "UNKNOWN_OPTION"/);
    assert.match(unsupportedCommand.stderr, /Unknown option\(s\): --output/);
    assert.equal(await readFile(queuePath, "utf8"), originalQueue);
  });
});

test("read-only commands do not acquire or require the mutation lock", async () => {
  await withRepository(async (root) => {
    const lockPath = path.join(root, MUTATION_LOCK_FILENAME);
    const lockContent = "simulated active mutation\n";
    await writeFile(lockPath, lockContent, "utf8");

    assert.equal(runScript(SCRIPTS.unified, ["validate"], root).status, 0);
    assert.equal(runScript(SCRIPTS.unified, ["queue"], root).status, 0);
    assert.equal(runScript(SCRIPTS.unified, ["config"], root).status, 0);
    assert.equal(await readFile(lockPath, "utf8"), lockContent);
  });
});

test("work item creation dry-run performs zero writes", async () => {
  await withRepository(async (root) => {
    const manifestPath = path.join(root, "manifest.json");
    await writeFile(manifestPath, JSON.stringify(creationManifest()), "utf8");
    const originalQueue = await readFile(path.join(root, "docs", "WORK_QUEUE.md"), "utf8");

    const result = runScript(SCRIPTS.create, [manifestPath, "--dry-run"], root);
    assert.equal(result.status, 0);
    assert.equal(result.stderr, "");
    assert.match(result.stdout, /^Work Item Creation Preview\n/);
    assert.match(result.stdout, /ID: AB-001/);
    assert.match(result.stdout, /Title: Create Test Work Item/);
    assert.match(result.stdout, /File: docs\/work-items\/AB-001\.md/);
    assert.match(result.stdout, /Queue section: Ready/);
    assert.match(result.stdout, /Preflight: passed/);
    assert.match(result.stdout, /Validation: 0 error\(s\), 0 warning\(s\), 0 legacy observation\(s\)/);
    assert.match(result.stdout, /Writes: none \(dry-run\)/);
    assert.match(result.stdout, /Recommended next commands:/);
    assert.match(result.stdout, /npm run project -- create .*manifest\.json/);
    assert.doesNotMatch(result.stdout, /work_item_content|queue_entry|ARMBASE_WORK_ITEM_METADATA/);
    assert.deepEqual(await readdir(path.join(root, "docs", "work-items")), []);
    assert.equal(await readFile(path.join(root, "docs", "WORK_QUEUE.md"), "utf8"), originalQueue);
    await assert.rejects(access(path.join(root, MUTATION_LOCK_FILENAME)), { code: "ENOENT" });
  });
});

test("detailed create preview preserves generated content across allocation boundary", async () => {
  const queue = renderQueue({ Backlog: [queueEntry("AB-999", "Legacy Reservation")] });
  await withRepository(async (root) => {
    const manifestPath = path.join(root, "manifest.json");
    await writeFile(manifestPath, JSON.stringify(creationManifest()), "utf8");

    const output = parseJsonOutput(
      runScript(SCRIPTS.create, [manifestPath, "--dry-run", "--detail", "full"], root)
    );
    assert.equal(output.allocated_id, "AB-1000");
    assert.equal(output.title, "Create Test Work Item");
    assert.equal(output.dry_run, true);
    assert.equal(output.created, false);
    assert.match(output.queue_entry as string, /- AB-1000 - Create Test Work Item/);
    assert.match(output.work_item_content as string, /# AB-1000 - Create Test Work Item/);
    assert.match(output.work_item_content as string, /ARMBASE_WORK_ITEM_METADATA_START/);
    assert.deepEqual(output.validation, {
      errors: 0,
      warnings: 2,
      legacy_observations: 0
    });
    assert.deepEqual(output.next_commands, [
      `npm run project -- create ${manifestPath}`,
      `npm run project -- create ${manifestPath} --dry-run --detail full`
    ]);
    assert.deepEqual(await readdir(path.join(root, "docs", "work-items")), []);
  }, queue);
});

test("work item creation writes metadata and a valid queue entry", async () => {
  await withRepository(async (root) => {
    const manifestPath = path.join(root, "manifest.json");
    await writeFile(manifestPath, JSON.stringify(creationManifest()), "utf8");

    const result = runScript(SCRIPTS.create, [manifestPath], root);
    assert.equal(result.status, 0);
    assert.equal(result.stderr, "");
    assert.match(result.stdout, /^Work Item Created\n/);
    assert.match(result.stdout, /ID: AB-001/);
    assert.match(result.stdout, /Title: Create Test Work Item/);
    assert.match(result.stdout, /File: docs\/work-items\/AB-001\.md/);
    assert.match(result.stdout, /Queue section: Ready/);
    assert.match(result.stdout, /Preflight: passed/);
    assert.match(result.stdout, /Validation: 0 error\(s\), 0 warning\(s\), 0 legacy observation\(s\)/);
    assert.match(result.stdout, /npm run project -- queue/);
    assert.match(result.stdout, /npm run project -- validate/);
    assert.doesNotMatch(result.stdout, /work_item_content|queue_entry/);
    const workItem = await readFile(path.join(root, "docs", "work-items", "AB-001.md"), "utf8");
    const queue = await readFile(path.join(root, "docs", "WORK_QUEUE.md"), "utf8");
    assert.match(workItem, /"status": "ready"/);
    assert.match(workItem, /## Acceptance Criteria/);
    assert.match(queue, /## Ready[\s\S]*- AB-001 - Create Test Work Item/);
    await assert.rejects(access(path.join(root, MUTATION_LOCK_FILENAME)), { code: "ENOENT" });
    assert.equal(runScript(SCRIPTS.validate, [], root).status, 0);
  });
});

test("work item creation refuses an already-held mutation lock before writing", async () => {
  await withRepository(async (root) => {
    const manifestPath = path.join(root, "manifest.json");
    const queuePath = path.join(root, "docs", "WORK_QUEUE.md");
    const lockPath = path.join(root, MUTATION_LOCK_FILENAME);
    await writeFile(manifestPath, JSON.stringify(creationManifest()), "utf8");
    await writeFile(lockPath, "simulated orphaned lock\n", "utf8");
    const originalQueue = await readFile(queuePath, "utf8");

    const result = runScript(SCRIPTS.create, [manifestPath], root);
    assert.equal(result.status, 1);
    assert.match(result.stderr, /MUTATION_LOCK_HELD/);
    assert.match(result.stderr, /remove the orphaned lock manually/);
    assert.deepEqual(await readdir(path.join(root, "docs", "work-items")), []);
    assert.equal(await readFile(queuePath, "utf8"), originalQueue);
    assert.equal(await readFile(lockPath, "utf8"), "simulated orphaned lock\n");
  });
});

test("work item creation rejects an invalid manifest before writing", async () => {
  await withRepository(async (root) => {
    const manifestPath = path.join(root, "manifest.json");
    const invalidManifest = creationManifest();
    (invalidManifest.work_item as Record<string, unknown>).initial_status = "in_progress";
    await writeFile(manifestPath, JSON.stringify(invalidManifest), "utf8");
    const queuePath = path.join(root, "docs", "WORK_QUEUE.md");
    const originalQueue = await readFile(queuePath, "utf8");

    const result = runScript(SCRIPTS.create, [manifestPath], root);
    assert.equal(result.status, 1);
    assert.match(result.stderr, /MANIFEST_STATUS/);
    assert.deepEqual(await readdir(path.join(root, "docs", "work-items")), []);
    assert.equal(await readFile(queuePath, "utf8"), originalQueue);
  });
});

test("work item creation stops without writes when repository preflight fails", async () => {
  const queue = renderQueue({ "In Progress": [queueEntry("AB-009", "Missing Active Item")] });
  await withRepository(async (root) => {
    const manifestPath = path.join(root, "manifest.json");
    await writeFile(manifestPath, JSON.stringify(creationManifest()), "utf8");
    const queuePath = path.join(root, "docs", "WORK_QUEUE.md");
    const originalQueue = await readFile(queuePath, "utf8");

    const result = runScript(SCRIPTS.create, [manifestPath], root);
    assert.equal(result.status, 1);
    assert.match(result.stderr, /REPOSITORY_VALIDATION_FAILED/);
    assert.deepEqual(await readdir(path.join(root, "docs", "work-items")), []);
    assert.equal(await readFile(queuePath, "utf8"), originalQueue);
  }, queue);
});

test("legacy work items are rejected by lifecycle commands", async () => {
  const queue = renderQueue({ Ready: [queueEntry("AB-001", "Legacy Item")] });
  await withRepository(
    async (root) => {
      const result = runScript(SCRIPTS.transition, ["AB-001", "ready", "in_progress"], root);
      assert.equal(result.status, 1);
      assert.match(result.stderr, /LEGACY_WORK_ITEM/);
    },
    queue,
    [{ id: "AB-001", title: "Legacy Item", legacy: true }]
  );
});

test("lifecycle transition dry-run performs zero writes without acquiring a lock", async () => {
  const queue = renderQueue({ Ready: [queueEntry("AB-001", "Transition Item")] });
  await withRepository(
    async (root) => {
      const itemPath = path.join(root, "docs", "work-items", "AB-001.md");
      const queuePath = path.join(root, "docs", "WORK_QUEUE.md");
      const originalItem = await readFile(itemPath, "utf8");
      const originalQueue = await readFile(queuePath, "utf8");
      const output = parseJsonOutput(
        runScript(SCRIPTS.transition, ["AB-001", "ready", "in_progress", "--dry-run"], root)
      );
      assert.equal(output.dry_run, true);
      assert.equal(output.applied, false);
      assert.equal(await readFile(itemPath, "utf8"), originalItem);
      assert.equal(await readFile(queuePath, "utf8"), originalQueue);
      await assert.rejects(access(path.join(root, MUTATION_LOCK_FILENAME)), { code: "ENOENT" });
    },
    queue,
    [{ id: "AB-001", title: "Transition Item", status: "ready" }]
  );
});

test("valid lifecycle transition updates metadata and queue", async () => {
  const queue = renderQueue({ Ready: [queueEntry("AB-10000", "Transition Item")] });
  await withRepository(
    async (root) => {
      const result = runScript(
        SCRIPTS.unified,
        ["transition", "AB-10000", "ready", "in_progress"],
        root
      );
      const output = parseJsonOutput(result);
      assert.equal(output.applied, true);
      assert.equal(
        result.stdout,
        `${JSON.stringify(
          {
            operation: "transition_work_item",
            id: "AB-10000",
            from: "ready",
            to: "in_progress",
            queue_from: "Ready",
            queue_to: "In Progress",
            queue_entry:
              "- AB-10000 - Transition Item\n  See: docs/work-items/AB-10000.md",
            dry_run: false,
            applied: true,
            validation: { errors: 0, warnings: 0, legacy_observations: 0 }
          },
          null,
          2
        )}\n`
      );
      assert.doesNotMatch(result.stdout, /result_version|producer|diagnostics|changed_files/);
      const item = await readFile(path.join(root, "docs", "work-items", "AB-10000.md"), "utf8");
      const updatedQueue = await readFile(path.join(root, "docs", "WORK_QUEUE.md"), "utf8");
      assert.match(item, /"status": "in_progress"/);
      assert.match(updatedQueue, /## In Progress[\s\S]*- AB-10000 - Transition Item/);
      await assert.rejects(access(path.join(root, MUTATION_LOCK_FILENAME)), { code: "ENOENT" });
      assert.equal(runScript(SCRIPTS.validate, [], root).status, 0);
    },
    queue,
    [{ id: "AB-10000", title: "Transition Item", status: "ready" }]
  );
});

test("invalid lifecycle transition is rejected without writes", async () => {
  const queue = renderQueue({ Ready: [queueEntry("AB-001", "Transition Item")] });
  await withRepository(
    async (root) => {
      const itemPath = path.join(root, "docs", "work-items", "AB-001.md");
      const queuePath = path.join(root, "docs", "WORK_QUEUE.md");
      const originalItem = await readFile(itemPath, "utf8");
      const originalQueue = await readFile(queuePath, "utf8");
      const result = runScript(
        SCRIPTS.transition,
        ["AB-001", "ready", "needs_review"],
        root
      );
      assert.equal(result.status, 1);
      assert.match(result.stderr, /INVALID_TRANSITION/);
      assert.equal(await readFile(itemPath, "utf8"), originalItem);
      assert.equal(await readFile(queuePath, "utf8"), originalQueue);
      await assert.rejects(access(path.join(root, MUTATION_LOCK_FILENAME)), { code: "ENOENT" });
    },
    queue,
    [{ id: "AB-001", title: "Transition Item", status: "ready" }]
  );
});

test("completion dry-run performs zero writes", async () => {
  const queue = renderQueue({ "Needs Review": [queueEntry("AB-001", "Completion Item")] });
  await withRepository(
    async (root) => {
      const itemPath = path.join(root, "docs", "work-items", "AB-001.md");
      const queuePath = path.join(root, "docs", "WORK_QUEUE.md");
      const originalItem = await readFile(itemPath, "utf8");
      const originalQueue = await readFile(queuePath, "utf8");
      const output = parseJsonOutput(
        runScript(SCRIPTS.complete, ["AB-001", "--approved", "--dry-run"], root)
      );
      assert.equal(output.dry_run, true);
      assert.equal(output.applied, false);
      assert.equal(await readFile(itemPath, "utf8"), originalItem);
      assert.equal(await readFile(queuePath, "utf8"), originalQueue);
      await assert.rejects(access(path.join(root, MUTATION_LOCK_FILENAME)), { code: "ENOENT" });
    },
    queue,
    [{ id: "AB-001", title: "Completion Item", status: "needs_review" }]
  );
});

test("completion requires explicit approval", async () => {
  const queue = renderQueue({ "Needs Review": [queueEntry("AB-001", "Completion Item")] });
  await withRepository(
    async (root) => {
      const itemPath = path.join(root, "docs", "work-items", "AB-001.md");
      const queuePath = path.join(root, "docs", "WORK_QUEUE.md");
      const originalItem = await readFile(itemPath, "utf8");
      const originalQueue = await readFile(queuePath, "utf8");
      const result = runScript(SCRIPTS.complete, ["AB-001"], root);
      assert.equal(result.status, 1);
      assert.match(result.stderr, /APPROVAL_REQUIRED/);
      assert.equal(await readFile(itemPath, "utf8"), originalItem);
      assert.equal(await readFile(queuePath, "utf8"), originalQueue);
      await assert.rejects(access(path.join(root, MUTATION_LOCK_FILENAME)), { code: "ENOENT" });
    },
    queue,
    [{ id: "AB-001", title: "Completion Item", status: "needs_review" }]
  );
});

test("completion transaction marks metadata and queue done with the same date", async () => {
  const queue = renderQueue({ "Needs Review": [queueEntry("AB-001", "Completion Item")] });
  await withRepository(
    async (root) => {
      const output = parseJsonOutput(
        runScript(SCRIPTS.unified, ["complete", "AB-001", "--approved"], root)
      );
      assert.equal(output.applied, true);
      assert.match(String(output.completed_on), /^\d{4}-\d{2}-\d{2}$/);
      const item = await readFile(path.join(root, "docs", "work-items", "AB-001.md"), "utf8");
      const updatedQueue = await readFile(path.join(root, "docs", "WORK_QUEUE.md"), "utf8");
      assert.match(item, /"status": "done"/);
      assert.match(item, new RegExp(`"completed_on": "${String(output.completed_on)}"`));
      assert.match(updatedQueue, new RegExp(`Completed: ${String(output.completed_on)}`));
      await assert.rejects(access(path.join(root, MUTATION_LOCK_FILENAME)), { code: "ENOENT" });
      assert.equal(runScript(SCRIPTS.validate, [], root).status, 0);
    },
    queue,
    [{ id: "AB-001", title: "Completion Item", status: "needs_review" }]
  );
});

test("validator returns blocking exit codes for duplicate identifiers and malformed metadata", async () => {
  const duplicateQueue = renderQueue({
    Ready: [queueEntry("AB-001", "Duplicate Item")],
    Backlog: [queueEntry("AB-001", "Duplicate Item")]
  });
  await withRepository(
    async (root) => {
      const result = runScript(SCRIPTS.validate, [], root);
      assert.equal(result.status, 1);
      assert.match(result.stdout, /DUPLICATE_QUEUE_IDENTIFIER/);
      assert.match(result.stdout, /identifier 'AB-001' appears in 2 queue entries/);
      assert.match(result.stdout, /Result: FAILED/);
    },
    duplicateQueue,
    [{ id: "AB-001", title: "Duplicate Item", status: "ready" }]
  );

  const malformedQueue = renderQueue({ Ready: [queueEntry("AB-002", "Malformed Metadata")] });
  await withRepository(
    async (root) => {
      const result = runScript(SCRIPTS.validate, [], root);
      assert.equal(result.status, 1);
      assert.match(result.stdout, /METADATA_JSON/);
    },
    malformedQueue,
    [{ id: "AB-002", title: "Malformed Metadata", metadataJson: '{"schema_version":1' }]
  );
});

test("validator supports compact and full warning detail without writes", async () => {
  const queue = renderQueue({ Backlog: ["  - AB-001 - Legacy Item"] });
  await withRepository(
    async (root) => {
      const queuePath = path.join(root, "docs", "WORK_QUEUE.md");
      const itemPath = path.join(root, "docs", "work-items", "AB-001.md");
      const originalQueue = await readFile(queuePath, "utf8");
      const originalItem = await readFile(itemPath, "utf8");

      const compact = runScript(SCRIPTS.validate, [], root);
      assert.equal(compact.status, 0);
      assert.match(compact.stdout, /Warnings \(2\)/);
      assert.match(compact.stdout, /\[QUEUE_ENTRY_INDENTATION\] 1 warning\(s\); details omitted/);
      assert.match(compact.stdout, /\[QUEUE_MISSING_SEE\] 1 warning\(s\); details omitted/);
      assert.match(compact.stdout, /Legacy observations \(1\)/);
      assert.match(compact.stdout, /Summary: 0 error\(s\), 2 warning\(s\), 1 legacy observation\(s\)/);
      assert.match(compact.stdout, /validate --detail full/);
      assert.doesNotMatch(compact.stdout, /AB-001' should not be indented/);

      const full = runScript(SCRIPTS.validate, ["--detail", "full"], root);
      assert.equal(full.status, 0);
      assert.match(full.stdout, /\[QUEUE_ENTRY_INDENTATION\] docs\/WORK_QUEUE\.md:\d+: 'AB-001' should not be indented/);
      assert.match(full.stdout, /\[QUEUE_MISSING_SEE\] docs\/WORK_QUEUE\.md:\d+: 'AB-001' has no canonical See reference/);
      assert.match(full.stdout, /Summary: 0 error\(s\), 2 warning\(s\), 1 legacy observation\(s\)/);

      assert.equal(await readFile(queuePath, "utf8"), originalQueue);
      assert.equal(await readFile(itemPath, "utf8"), originalItem);
    },
    queue,
    [{ id: "AB-001", title: "Legacy Item", legacy: true }]
  );
});

test("validation warning detail follows config and explicit flags take precedence", async () => {
  const queue = renderQueue({ Backlog: ["  - AB-001 - Legacy Item"] });
  await withRepository(
    async (root) => {
      const configuration = presentationConfiguration();
      (configuration.output as Record<string, unknown>).warning_detail = "full";
      await writeFile(
        path.join(root, ".worksmith.json"),
        JSON.stringify(configuration),
        "utf8"
      );

      const configuredFull = runScript(SCRIPTS.unified, ["validate"], root);
      assert.equal(configuredFull.status, 0);
      assert.match(configuredFull.stdout, /AB-001' should not be indented/);

      const explicitSummary = runScript(
        SCRIPTS.unified,
        ["validate", "--detail", "summary"],
        root
      );
      assert.equal(explicitSummary.status, 0);
      assert.match(explicitSummary.stdout, /\[QUEUE_ENTRY_INDENTATION\] 1 warning\(s\); details omitted/);
      assert.doesNotMatch(explicitSummary.stdout, /AB-001' should not be indented/);

      (configuration.output as Record<string, unknown>).warning_detail = "summary";
      await writeFile(
        path.join(root, ".worksmith.json"),
        JSON.stringify(configuration),
        "utf8"
      );
      const explicitFull = runScript(
        SCRIPTS.unified,
        ["validate", "--detail", "full"],
        root
      );
      assert.equal(explicitFull.status, 0);
      assert.match(explicitFull.stdout, /AB-001' should not be indented/);
    },
    queue,
    [{ id: "AB-001", title: "Legacy Item", legacy: true }]
  );
});

test("validator returns success when only legacy observations remain", async () => {
  const queue = renderQueue({ Backlog: [queueEntry("AB-001", "Legacy Item")] });
  await withRepository(
    async (root) => {
      const direct = runScript(SCRIPTS.validate, [], root);
      const unified = runScript(SCRIPTS.unified, ["validate"], root);
      assert.equal(direct.status, 0);
      assert.equal(unified.status, 0);
      assert.match(direct.stdout, /Legacy observations \(1\)/);
      assert.doesNotMatch(direct.stdout, /docs\/work-items\/AB-001\.md/);
      assert.match(unified.stdout, /Result: PASSED/);
    },
    queue,
    [{ id: "AB-001", title: "Legacy Item", legacy: true }]
  );
});

test("unified allocator and compatibility alias produce equivalent output", async () => {
  const queue = renderQueue({ Backlog: [queueEntry("AB-005", "Reserved Placeholder")] });
  await withRepository(async (root) => {
    const direct = parseJsonOutput(runScript(SCRIPTS.allocate, ["AB"], root));
    const unified = parseJsonOutput(runScript(SCRIPTS.unified, ["allocate-id", "AB"], root));
    const legacyUnified = parseJsonOutput(
      runScript(SCRIPTS.legacyUnified, ["allocate-id", "AB"], root)
    );
    const expectedOutput = `${JSON.stringify(
      {
        prefix: "AB",
        allocated_id: "AB-006",
        highest_existing: "AB-005",
        source: ["docs/work-items", "docs/WORK_QUEUE.md"],
        dry_run: true
      },
      null,
      2
    )}\n`;
    assert.equal(direct.allocated_id, "AB-006");
    assert.deepEqual(unified, direct);
    assert.deepEqual(legacyUnified, direct);
    assert.equal(runScript(SCRIPTS.allocate, ["AB"], root).stdout, expectedOutput);
    assert.doesNotMatch(expectedOutput, /result_version|producer|diagnostics/);
  }, queue);
});

// --- AB-244: Read-only Worksmith discovery commands (draft compiler, work-item show) ---

function sampleDraftLines(overrides: Partial<Record<string, string>> = {}): string {
  const fields = {
    Prefix: "AB",
    Title: "Example Draft Compiled Item",
    "Initial Status": "ready",
    "Created On": "2026-07-03",
    "Commit Message": "test: create draft compiled item",
    ...overrides
  };
  const fieldLines = Object.entries(fields)
    .filter(([, value]) => value !== undefined)
    .map(([label, value]) => `${label}: ${value}`)
    .join("\n");

  return [
    "WORKSMITH_DRAFT_V1",
    "",
    fieldLines,
    "",
    "## Background",
    "",
    "Background paragraph one.",
    "",
    "Background paragraph two.",
    "",
    "## Goal",
    "",
    "The intended outcome.",
    "",
    "## Scope",
    "",
    "- First scope item.",
    "- Second scope item.",
    "",
    "## Requirements",
    "",
    "- A required behavior.",
    "",
    "## Verification",
    "",
    "- A verification step.",
    "",
    "## Acceptance Criteria",
    "",
    "- A completion condition.",
    "",
    "## Out of Scope",
    "",
    "- An excluded behavior.",
    "",
    "## Deliverables",
    "",
    "- The expected result.",
    ""
  ].join("\n");
}

function runDraftCompile(root: string, draftContent: string): CommandResult {
  return runScript(SCRIPTS.draftCompile, ["compile"], root, draftContent);
}

test("valid draft compiles to a deterministic, create-compatible manifest", async () => {
  await withRepository(async (root) => {
    const draft = sampleDraftLines();
    const first = runDraftCompile(root, draft);
    const second = runDraftCompile(root, draft);

    assert.equal(first.status, 0, first.stderr);
    assert.equal(first.stderr, "");
    assert.equal(first.stdout, second.stdout, "identical draft content must compile deterministically");

    const manifest = JSON.parse(first.stdout) as Record<string, unknown>;
    assert.deepEqual(manifest, {
      schema_version: 1,
      operation: "create_work_item",
      work_item: {
        id: "auto",
        prefix: "AB",
        title: "Example Draft Compiled Item",
        initial_status: "ready",
        created_on: "2026-07-03",
        sections: {
          background: ["Background paragraph one.", "Background paragraph two."],
          goal: ["The intended outcome."],
          scope: ["First scope item.", "Second scope item."],
          requirements: ["A required behavior."],
          verification: ["A verification step."],
          acceptance_criteria: ["A completion condition."],
          out_of_scope: ["An excluded behavior."],
          deliverables: ["The expected result."]
        }
      },
      documentation: { changes: [] },
      git: { commit_message: "test: create draft compiled item", commit: false, push: false }
    });

    await assert.rejects(access(path.join(root, MUTATION_LOCK_FILENAME)), { code: "ENOENT" });
    assert.deepEqual(await readdir(path.join(root, "docs", "work-items")), []);
  });
});

test("compiled draft manifest is accepted by the existing create command unmodified", async () => {
  await withRepository(async (root) => {
    const compiled = runDraftCompile(root, sampleDraftLines());
    assert.equal(compiled.status, 0, compiled.stderr);

    const manifestPath = path.join(root, "from-draft.manifest.json");
    await writeFile(manifestPath, compiled.stdout, "utf8");

    const preview = runScript(SCRIPTS.create, [manifestPath, "--dry-run", "--detail", "full"], root);
    assert.equal(preview.status, 0, preview.stderr);
    const payload = parseJsonOutput(preview);
    assert.equal(payload.allocated_id, "AB-001");
    assert.equal(payload.title, "Example Draft Compiled Item");
    assert.equal((payload.preflight as { passed: boolean }).passed, true);
    assert.equal(payload.created, false);
  });
});

test("draft compiler rejects a missing WORKSMITH_DRAFT_V1 marker", async () => {
  await withRepository(async (root) => {
    const result = runDraftCompile(root, "Prefix: AB\nTitle: X\n");
    assert.equal(result.status, 1);
    assert.match(result.stderr, /"code": "DRAFT_MISSING_MARKER"/);
  });
});

test("draft compiler rejects a missing required field", async () => {
  await withRepository(async (root) => {
    const draft = sampleDraftLines({ "Commit Message": undefined as unknown as string });
    const result = runDraftCompile(root, draft);
    assert.equal(result.status, 1);
    assert.match(result.stderr, /"code": "DRAFT_MISSING_FIELD"/);
    assert.match(result.stderr, /Commit Message/);
  });
});

test("draft compiler rejects a duplicate field", async () => {
  await withRepository(async (root) => {
    const draft = sampleDraftLines().replace("Prefix: AB\n", "Prefix: AB\nPrefix: AN\n");
    const result = runDraftCompile(root, draft);
    assert.equal(result.status, 1);
    assert.match(result.stderr, /"code": "DRAFT_DUPLICATE_FIELD"/);
  });
});

test("draft compiler rejects a duplicate section", async () => {
  await withRepository(async (root) => {
    const draft = sampleDraftLines().replace(
      "## Goal\n\nThe intended outcome.\n",
      "## Goal\n\nThe intended outcome.\n\n## Background\n\nDuplicate.\n"
    );
    const result = runDraftCompile(root, draft);
    assert.equal(result.status, 1);
    assert.match(result.stderr, /"code": "DRAFT_DUPLICATE_SECTION"/);
  });
});

test("draft compiler rejects an unknown section heading", async () => {
  await withRepository(async (root) => {
    const draft = sampleDraftLines().replace("## Deliverables", "## Notes");
    const result = runDraftCompile(root, draft);
    assert.equal(result.status, 1);
    assert.match(result.stderr, /"code": "DRAFT_UNKNOWN_SECTION"/);
  });
});

test("draft compiler rejects an ambiguous list line", async () => {
  await withRepository(async (root) => {
    const draft = sampleDraftLines().replace(
      "- First scope item.\n- Second scope item.",
      "First scope item without a bullet."
    );
    const result = runDraftCompile(root, draft);
    assert.equal(result.status, 1);
    assert.match(result.stderr, /"code": "DRAFT_AMBIGUOUS_SECTION_LINE"/);
  });
});

test("draft compiler rejects an empty required section", async () => {
  await withRepository(async (root) => {
    const draft = sampleDraftLines().replace(
      "## Requirements\n\n- A required behavior.\n",
      "## Requirements\n\n"
    );
    const result = runDraftCompile(root, draft);
    assert.equal(result.status, 1);
    assert.match(result.stderr, /"code": "DRAFT_EMPTY_SECTION"/);
  });
});

test("draft compiler rejects an unsupported prefix via the shared manifest validator", async () => {
  await withRepository(async (root) => {
    const draft = sampleDraftLines({ Prefix: "ZZ" });
    const result = runDraftCompile(root, draft);
    assert.equal(result.status, 1);
    assert.match(result.stderr, /"code": "DRAFT_MANIFEST_INVALID"/);
    assert.match(result.stderr, /MANIFEST_PREFIX/);
  });
});

test("draft compiler rejects an unsupported initial status via the shared manifest validator", async () => {
  await withRepository(async (root) => {
    const draft = sampleDraftLines({ "Initial Status": "done" });
    const result = runDraftCompile(root, draft);
    assert.equal(result.status, 1);
    assert.match(result.stderr, /"code": "DRAFT_MANIFEST_INVALID"/);
    assert.match(result.stderr, /MANIFEST_STATUS/);
  });
});

test("draft compiler rejects an invalid date via the shared manifest validator", async () => {
  await withRepository(async (root) => {
    const draft = sampleDraftLines({ "Created On": "2026-02-30" });
    const result = runDraftCompile(root, draft);
    assert.equal(result.status, 1);
    assert.match(result.stderr, /"code": "DRAFT_MANIFEST_INVALID"/);
    assert.match(result.stderr, /MANIFEST_DATE/);
  });
});

test("work-item show returns a compact summary for a metadata-enabled item", async () => {
  const queue = renderQueue({ Ready: [queueEntry("AB-050", "Sample Show Target")] });
  await withRepository(
    async (root) => {
      const terminal = runScript(SCRIPTS.unified, ["show", "AB-050"], root);
      assert.equal(terminal.status, 0, terminal.stderr);
      assert.match(terminal.stdout, /^AB-050 - Sample Show Target/);
      assert.match(terminal.stdout, /Status: ready/);
      assert.match(terminal.stdout, /Goal:\n {2}Sample goal text\./);
      assert.match(terminal.stdout, /Scope:\n {2}- Sample scope item\./);
      assert.match(terminal.stdout, /Out of Scope:\n {2}- Sample exclusion\./);

      const jsonResult = runScript(SCRIPTS.unified, ["show", "AB-050", "--output", "json"], root);
      assert.equal(jsonResult.status, 0, jsonResult.stderr);
      const envelope = parseJsonOutput(jsonResult);
      assert.equal(envelope.command, "work_item_show");
      assert.equal(envelope.status, "success");
      const payload = envelope.payload as Record<string, unknown>;
      assert.equal(payload.id, "AB-050");
      assert.equal(payload.legacy, false);
      assert.equal(payload.status, "ready");
      assert.equal(payload.created_on, "2026-06-30");
      assert.equal(payload.completed_on, null);
      assert.equal(payload.goal, "Sample goal text.");
      assert.deepEqual(payload.scope, ["Sample scope item."]);
      assert.deepEqual(payload.out_of_scope, ["Sample exclusion."]);
      assert.equal(payload.file, "docs/work-items/AB-050.md");
    },
    queue,
    [
      {
        id: "AB-050",
        title: "Sample Show Target",
        status: "ready",
        body: "## Background\n\nBackground text.\n\n## Goal\n\nSample goal text.\n\n## Scope\n\n- Sample scope item.\n\n## Out of Scope\n\n- Sample exclusion.\n"
      }
    ]
  );
});

test("work-item show handles a missing identifier clearly without writes", async () => {
  await withRepository(async (root) => {
    const missingArgument = runScript(SCRIPTS.unified, ["show"], root);
    assert.equal(missingArgument.status, 1);
    assert.match(missingArgument.stderr, /"code": "MISSING_IDENTIFIER"/);

    const missingItem = runScript(SCRIPTS.unified, ["show", "AB-999999"], root);
    assert.equal(missingItem.status, 1);
    assert.match(missingItem.stderr, /"code": "INVALID_IDENTIFIER"/);

    const wellFormedButAbsent = runScript(SCRIPTS.unified, ["show", "AB-777"], root);
    assert.equal(wellFormedButAbsent.status, 1);
    assert.match(wellFormedButAbsent.stderr, /"code": "WORK_ITEM_NOT_FOUND"/);
  });
});

test("work-item show reports a legacy item without mutating or retrofitting it", async () => {
  await withRepository(
    async (root) => {
      const filePath = path.join(root, "docs", "work-items", "AB-002.md");
      const before = await readFile(filePath, "utf8");

      const result = runScript(SCRIPTS.unified, ["show", "AB-002"], root);
      assert.equal(result.status, 0, result.stderr);
      assert.match(result.stdout, /^AB-002 - Legacy Fixture/);
      assert.match(result.stdout, /Legacy work item: no metadata block present/);
      assert.doesNotMatch(result.stdout, /Status:|Goal:|Scope:/);

      const jsonResult = runScript(SCRIPTS.unified, ["show", "AB-002", "--output", "json"], root);
      const payload = parseJsonOutput(jsonResult).payload as Record<string, unknown>;
      assert.equal(payload.legacy, true);
      assert.equal(payload.status, null);
      assert.equal(payload.created_on, null);

      assert.equal(await readFile(filePath, "utf8"), before, "legacy work item must remain byte-identical");
    },
    undefined,
    [{ id: "AB-002", title: "Legacy Fixture", legacy: true }]
  );
});

test("draft compile and work-item show perform no repository writes and never acquire the mutation lock", async () => {
  const queue = renderQueue({ Ready: [queueEntry("AB-050", "Sample Show Target")] });
  await withRepository(
    async (root) => {
      const queuePath = path.join(root, "docs", "WORK_QUEUE.md");
      const originalQueue = await readFile(queuePath, "utf8");
      const lockPath = path.join(root, MUTATION_LOCK_FILENAME);
      const lockContent = "simulated active mutation\n";
      await writeFile(lockPath, lockContent, "utf8");

      const draftResult = runDraftCompile(root, sampleDraftLines());
      assert.equal(draftResult.status, 0, draftResult.stderr);
      const showResult = runScript(SCRIPTS.unified, ["show", "AB-050"], root);
      assert.equal(showResult.status, 0, showResult.stderr);

      assert.equal(await readFile(queuePath, "utf8"), originalQueue);
      assert.equal(await readFile(lockPath, "utf8"), lockContent, "pre-existing lock must be left untouched");
      assert.deepEqual(await readdir(path.join(root, "docs", "work-items")), ["AB-050.md"]);
    },
    queue,
    [{ id: "AB-050", title: "Sample Show Target", status: "ready" }]
  );
});

test("existing create, transition, validate and queue behavior is unchanged by AB-244", async () => {
  const queue = renderQueue({ Ready: [queueEntry("AB-050", "Sample Show Target")] });
  await withRepository(
    async (root) => {
      const manifestPath = path.join(root, "manifest.json");
      await writeFile(manifestPath, JSON.stringify(creationManifest()), "utf8");
      const createPreview = runScript(SCRIPTS.create, [manifestPath, "--dry-run"], root);
      assert.equal(createPreview.status, 0);
      assert.match(createPreview.stdout, /^Work Item Creation Preview\n/);

      const transitionPreview = runScript(
        SCRIPTS.unified,
        ["transition", "AB-050", "ready", "in_progress", "--dry-run"],
        root
      );
      assert.equal(transitionPreview.status, 0, transitionPreview.stderr);

      const validateResult = runScript(SCRIPTS.unified, ["validate"], root);
      assert.equal(validateResult.status, 0, validateResult.stderr);

      const queueResult = runScript(SCRIPTS.unified, ["queue"], root);
      assert.equal(queueResult.status, 0, queueResult.stderr);
      assert.match(queueResult.stdout, /AB-050/);
    },
    queue,
    [{ id: "AB-050", title: "Sample Show Target", status: "ready" }]
  );
});

test("topic taxonomy parser accepts a valid file and rejects malformed shapes", () => {
  const valid = parseTopicTaxonomy(
    JSON.stringify({
      schema_version: 1,
      topics: [
        { id: "worksmith", label: "Worksmith / Project Administration" },
        { id: "parser-import", label: "Parser & Import" }
      ]
    })
  );
  assert.deepEqual(valid.topics, [
    { id: "worksmith", label: "Worksmith / Project Administration" },
    { id: "parser-import", label: "Parser & Import" }
  ]);

  assert.throws(
    () => parseTopicTaxonomy(JSON.stringify({ schema_version: 2, topics: [] })),
    (error: unknown) =>
      error instanceof TopicTaxonomyError && error.code === "TOPIC_TAXONOMY_UNSUPPORTED_VERSION"
  );
  assert.throws(
    () => parseTopicTaxonomy(JSON.stringify({ schema_version: 1, topics: "not-an-array" })),
    (error: unknown) => error instanceof TopicTaxonomyError && error.code === "TOPIC_TAXONOMY_INVALID"
  );
  assert.throws(
    () => parseTopicTaxonomy(JSON.stringify({ schema_version: 1, topics: [{ id: "worksmith" }] })),
    (error: unknown) => error instanceof TopicTaxonomyError && error.code === "TOPIC_TAXONOMY_INVALID"
  );
  assert.throws(
    () => parseTopicTaxonomy("{not valid json"),
    (error: unknown) => error instanceof TopicTaxonomyError && error.code === "TOPIC_TAXONOMY_INVALID"
  );
});

test("topic taxonomy parser reports duplicate topic ids clearly", () => {
  assert.throws(
    () =>
      parseTopicTaxonomy(
        JSON.stringify({
          schema_version: 1,
          topics: [
            { id: "worksmith", label: "Worksmith" },
            { id: "worksmith", label: "Worksmith Duplicate" }
          ]
        })
      ),
    (error: unknown) =>
      error instanceof TopicTaxonomyError &&
      error.code === "TOPIC_TAXONOMY_DUPLICATE_IDS" &&
      /worksmith/.test(error.message)
  );
});

test("topic convention parser reads plain, bold and bulleted labels without fuzzy matching", () => {
  const content = [
    "## Analysis Result",
    "",
    "- **Primary topic:** worksmith",
    "Secondary topics: workflow-governance, parser-import",
    "**Disposition:** accepted_later",
    "Disposition note: Deferred pending Stage B usage.",
    "- Follow-up: AB-247, AB-248"
  ].join("\n");

  const parsed = parseTopicConvention(content);
  assert.equal(parsed.primary_topic, "worksmith");
  assert.deepEqual(parsed.secondary_topics, ["workflow-governance", "parser-import"]);
  assert.equal(parsed.disposition, "accepted_later");
  assert.equal(parsed.disposition_note, "Deferred pending Stage B usage.");
  assert.deepEqual(parsed.follow_up, ["AB-247", "AB-248"]);
  assert.equal(isKnownDispositionStatus(parsed.disposition ?? ""), true);
});

test("topic convention parser leaves items without labels valid and empty", () => {
  const parsed = parseTopicConvention("## Background\n\nNo convention labels here.\n");
  assert.equal(parsed.primary_topic, null);
  assert.deepEqual(parsed.secondary_topics, []);
  assert.equal(parsed.disposition, null);
  assert.equal(parsed.disposition_note, null);
  assert.deepEqual(parsed.follow_up, []);
});

test("show exposes parsed topic and disposition data and flags unregistered or malformed values", async () => {
  const queue = renderQueue({ "In Progress": [queueEntry("AN-090", "Sample Analysis With Topics")] });
  await withRepository(
    async (root) => {
      await writeTopicTaxonomy(root, sampleTopicsJson());

      const terminal = runScript(SCRIPTS.unified, ["show", "AN-090"], root);
      assert.equal(terminal.status, 0, terminal.stderr);
      assert.match(terminal.stdout, /Topics:/);
      assert.match(terminal.stdout, /Primary topic: worksmith/);
      assert.match(terminal.stdout, /Secondary topics: unregistered-topic/);
      assert.match(terminal.stdout, /Disposition: not_a_real_status/);
      assert.match(terminal.stdout, /Warnings:/);
      assert.match(terminal.stdout, /not registered in \.worksmith\/topics\.json/);
      assert.match(terminal.stdout, /not one of the known disposition statuses/);

      const jsonResult = runScript(SCRIPTS.unified, ["show", "AN-090", "--output", "json"], root);
      const envelope = parseJsonOutput(jsonResult);
      const payload = envelope.payload as Record<string, unknown>;
      assert.equal(payload.primary_topic, "worksmith");
      assert.deepEqual(payload.secondary_topics, ["unregistered-topic"]);
      assert.equal(payload.disposition, "not_a_real_status");
      assert.equal(payload.disposition_note, "Needs more input before a real status is set.");
      assert.deepEqual(payload.follow_up, ["AB-247"]);
      const diagnostics = envelope.diagnostics as Array<Record<string, unknown>>;
      assert.ok(diagnostics.some((diagnostic) => diagnostic.code === "UNREGISTERED_TOPIC"));
      assert.ok(diagnostics.some((diagnostic) => diagnostic.code === "MALFORMED_DISPOSITION"));
    },
    queue,
    [
      {
        id: "AN-090",
        title: "Sample Analysis With Topics",
        status: "in_progress",
        body: [
          "## Background",
          "",
          "Test analysis.",
          "",
          "## Analysis Result",
          "",
          "- **Primary topic:** worksmith",
          "- Secondary topics: unregistered-topic",
          "- Disposition: not_a_real_status",
          "- Disposition note: Needs more input before a real status is set.",
          "- Follow-up: AB-247",
          ""
        ].join("\n")
      }
    ]
  );
});

test("show renders no Topics block and empty convention fields for an item without labels", async () => {
  const queue = renderQueue({ Ready: [queueEntry("AB-095", "Plain Item")] });
  await withRepository(
    async (root) => {
      const terminal = runScript(SCRIPTS.unified, ["show", "AB-095"], root);
      assert.equal(terminal.status, 0, terminal.stderr);
      assert.doesNotMatch(terminal.stdout, /Topics:/);
      assert.doesNotMatch(terminal.stdout, /Warnings:/);

      const jsonResult = runScript(SCRIPTS.unified, ["show", "AB-095", "--output", "json"], root);
      const envelope = parseJsonOutput(jsonResult);
      const payload = envelope.payload as Record<string, unknown>;
      assert.equal(payload.primary_topic, null);
      assert.deepEqual(payload.secondary_topics, []);
      assert.equal(payload.disposition, null);
      assert.equal(payload.disposition_note, null);
      assert.deepEqual(payload.follow_up, []);
      assert.deepEqual(envelope.diagnostics, []);
    },
    queue,
    [{ id: "AB-095", title: "Plain Item", status: "ready" }]
  );
});

test("show parses topic labels from a legacy item without retrofitting metadata", async () => {
  await withRepository(
    async (root) => {
      const filePath = path.join(root, "docs", "work-items", "AB-003.md");
      const before = await readFile(filePath, "utf8");

      const result = runScript(SCRIPTS.unified, ["show", "AB-003", "--output", "json"], root);
      assert.equal(result.status, 0, result.stderr);
      const payload = parseJsonOutput(result).payload as Record<string, unknown>;
      assert.equal(payload.legacy, true);
      assert.equal(payload.primary_topic, "documentation");

      assert.equal(await readFile(filePath, "utf8"), before, "legacy work item must remain byte-identical");
    },
    undefined,
    [
      {
        id: "AB-003",
        title: "Legacy Fixture With Topic",
        legacy: true,
        body: "## Background\n\nLegacy fixture.\n\nPrimary topic: documentation\n"
      }
    ]
  );
});

test("show downgrades a malformed taxonomy file to a warning instead of failing", async () => {
  const queue = renderQueue({ Ready: [queueEntry("AB-096", "Item With Topic")] });
  await withRepository(
    async (root) => {
      await mkdir(path.join(root, ".worksmith"), { recursive: true });
      await writeFile(path.join(root, ".worksmith", "topics.json"), "{ not valid json", "utf8");

      const result = runScript(SCRIPTS.unified, ["show", "AB-096", "--output", "json"], root);
      assert.equal(result.status, 0, result.stderr);
      const envelope = parseJsonOutput(result);
      const diagnostics = envelope.diagnostics as Array<Record<string, unknown>>;
      assert.ok(diagnostics.some((diagnostic) => diagnostic.code === "TOPIC_TAXONOMY_INVALID"));
    },
    queue,
    [
      {
        id: "AB-096",
        title: "Item With Topic",
        status: "ready",
        body: "## Background\n\nPrimary topic: worksmith\n"
      }
    ]
  );
});

test("topic catalog lists registered topics with usage counts and flags unregistered references", async () => {
  const queue = renderQueue({
    Ready: [queueEntry("AB-097", "Item A"), queueEntry("AB-098", "Item B")]
  });
  await withRepository(
    async (root) => {
      await writeTopicTaxonomy(root, sampleTopicsJson());

      const result = runScript(SCRIPTS.unified, ["topics", "--output", "json"], root);
      assert.equal(result.status, 0, result.stderr);
      const envelope = parseJsonOutput(result);
      const payload = envelope.payload as {
        present: boolean;
        topics: Array<Record<string, unknown>>;
        unregistered_topic_references: Array<Record<string, unknown>>;
      };
      assert.equal(payload.present, true);
      const worksmithTopic = payload.topics.find((topic) => topic.id === "worksmith");
      assert.ok(worksmithTopic);
      assert.equal(worksmithTopic?.item_count, 1);
      assert.deepEqual(worksmithTopic?.items, ["AB-097"]);
      assert.ok(
        payload.unregistered_topic_references.some(
          (reference) => reference.topic_id === "not-a-real-topic"
        )
      );

      const terminal = runScript(SCRIPTS.unified, ["topics"], root);
      assert.equal(terminal.status, 0, terminal.stderr);
      assert.match(terminal.stdout, /worksmith \(Worksmith \/ Project Administration\): 1 item\(s\)/);
      assert.match(terminal.stdout, /Unregistered topic references:/);
    },
    queue,
    [
      {
        id: "AB-097",
        title: "Item A",
        status: "ready",
        body: "## Background\n\nPrimary topic: worksmith\n"
      },
      {
        id: "AB-098",
        title: "Item B",
        status: "ready",
        body: "## Background\n\nPrimary topic: not-a-real-topic\n"
      }
    ]
  );
});

test("topic catalog reports an empty taxonomy without error when .worksmith/topics.json is absent", async () => {
  await withRepository(async (root) => {
    const result = runScript(SCRIPTS.unified, ["topics", "--output", "json"], root);
    assert.equal(result.status, 0, result.stderr);
    const payload = parseJsonOutput(result).payload as { present: boolean; topics: unknown[] };
    assert.equal(payload.present, false);
    assert.deepEqual(payload.topics, []);
  });
});

test("topic catalog fails clearly on a malformed taxonomy file without writing anything", async () => {
  await withRepository(async (root) => {
    await mkdir(path.join(root, ".worksmith"), { recursive: true });
    await writeFile(
      path.join(root, ".worksmith", "topics.json"),
      JSON.stringify({
        schema_version: 1,
        topics: [
          { id: "dup", label: "One" },
          { id: "dup", label: "Two" }
        ]
      }),
      "utf8"
    );

    const result = runScript(SCRIPTS.unified, ["topics"], root);
    assert.equal(result.status, 1);
    assert.match(result.stderr, /"code": "TOPIC_TAXONOMY_DUPLICATE_IDS"/);
  });
});

test("disposition report finds AN items missing or with a malformed disposition, scoped to in_progress and needs_review", async () => {
  const queue = renderQueue({
    "In Progress": [queueEntry("AN-091", "Missing Disposition Analysis")],
    "Needs Review": [
      queueEntry("AN-092", "Malformed Disposition Analysis"),
      queueEntry("AN-093", "Valid Disposition Analysis")
    ],
    Backlog: [queueEntry("AN-094", "Backlog Analysis Without Disposition")]
  });
  await withRepository(
    async (root) => {
      const result = runScript(SCRIPTS.unified, ["disposition-report", "--output", "json"], root);
      assert.equal(result.status, 0, result.stderr);
      const envelope = parseJsonOutput(result);
      const payload = envelope.payload as {
        scanned_count: number;
        gaps: Array<Record<string, unknown>>;
      };
      assert.equal(payload.scanned_count, 3);
      const ids = payload.gaps.map((gap) => gap.id).sort();
      assert.deepEqual(ids, ["AN-091", "AN-092"]);
      const missing = payload.gaps.find((gap) => gap.id === "AN-091");
      assert.equal(missing?.reason, "missing");
      const malformed = payload.gaps.find((gap) => gap.id === "AN-092");
      assert.equal(malformed?.reason, "malformed");
      assert.equal(malformed?.disposition, "not_a_real_status");

      const terminal = runScript(SCRIPTS.unified, ["disposition-report"], root);
      assert.equal(terminal.status, 0, terminal.stderr);
      assert.match(
        terminal.stdout,
        /AN-091 - Missing Disposition Analysis \(in_progress\): missing disposition/
      );
      assert.match(
        terminal.stdout,
        /AN-092 - Malformed Disposition Analysis \(needs_review\): malformed disposition 'not_a_real_status'/
      );
      assert.doesNotMatch(terminal.stdout, /AN-093/);
      assert.doesNotMatch(terminal.stdout, /AN-094/);
    },
    queue,
    [
      { id: "AN-091", title: "Missing Disposition Analysis", status: "in_progress" },
      {
        id: "AN-092",
        title: "Malformed Disposition Analysis",
        status: "needs_review",
        body: "## Background\n\nAnalysis text.\n\nDisposition: not_a_real_status\n"
      },
      {
        id: "AN-093",
        title: "Valid Disposition Analysis",
        status: "needs_review",
        body: "## Background\n\nAnalysis text.\n\nDisposition: accepted_now\nDisposition note: Done directly.\n"
      },
      { id: "AN-094", title: "Backlog Analysis Without Disposition", status: "backlog" }
    ]
  );
});

test("topics and disposition-report perform no repository writes and never acquire the mutation lock", async () => {
  const queue = renderQueue({ "In Progress": [queueEntry("AN-095", "Read Only Analysis")] });
  await withRepository(
    async (root) => {
      await writeTopicTaxonomy(root, sampleTopicsJson());
      const queuePath = path.join(root, "docs", "WORK_QUEUE.md");
      const originalQueue = await readFile(queuePath, "utf8");
      const lockPath = path.join(root, MUTATION_LOCK_FILENAME);
      const lockContent = "simulated active mutation\n";
      await writeFile(lockPath, lockContent, "utf8");
      const taxonomyPath = path.join(root, ".worksmith", "topics.json");
      const originalTaxonomy = await readFile(taxonomyPath, "utf8");

      assert.equal(runScript(SCRIPTS.unified, ["topics"], root).status, 0);
      assert.equal(runScript(SCRIPTS.unified, ["disposition-report"], root).status, 0);

      assert.equal(await readFile(queuePath, "utf8"), originalQueue);
      assert.equal(await readFile(lockPath, "utf8"), lockContent, "pre-existing lock must be left untouched");
      assert.equal(
        await readFile(taxonomyPath, "utf8"),
        originalTaxonomy,
        "taxonomy file must never be modified"
      );
    },
    queue,
    [{ id: "AN-095", title: "Read Only Analysis", status: "in_progress" }]
  );
});

test("handoff renders goal, scope, out-of-scope, verification and lifecycle commands for a metadata-enabled item", async () => {
  const queue = renderQueue({ Ready: [queueEntry("AB-099", "Sample Handoff Target")] });
  await withRepository(
    async (root) => {
      const terminal = runScript(SCRIPTS.unified, ["handoff", "AB-099"], root);
      assert.equal(terminal.status, 0, terminal.stderr);
      assert.match(terminal.stdout, /^# Handoff: AB-099 - Sample Handoff Target/);
      assert.match(terminal.stdout, /## Read First\n\n- docs\/project\/PROJECT_RULES\.md/);
      assert.match(terminal.stdout, /- docs\/work-items\/AB-099\.md/);
      assert.match(terminal.stdout, /## Goal\n\nSample goal text\./);
      assert.match(terminal.stdout, /## Scope\n\n- Sample scope item\./);
      assert.match(terminal.stdout, /## Out Of Scope \/ Prohibitions\n\n- Sample exclusion\./);
      assert.match(terminal.stdout, /## Suggested Verification\n\n- Sample verification step\./);
      assert.match(terminal.stdout, /## Lifecycle Commands/);
      assert.match(
        terminal.stdout,
        /npm run project -- transition AB-099 ready in_progress --dry-run/
      );
      assert.match(terminal.stdout, /## Expected Final Handoff/);
      assert.match(terminal.stdout, /## Reminders/);
      assert.match(terminal.stdout, /outrank older work-item prose/);

      const jsonResult = runScript(SCRIPTS.unified, ["handoff", "AB-099", "--output", "json"], root);
      const envelope = parseJsonOutput(jsonResult);
      assert.equal(envelope.command, "work_item_handoff");
      const payload = envelope.payload as Record<string, unknown>;
      assert.equal(payload.id, "AB-099");
      assert.equal(payload.legacy, false);
      assert.equal(payload.goal, "Sample goal text.");
      assert.deepEqual(payload.scope, ["Sample scope item."]);
      assert.deepEqual(payload.out_of_scope, ["Sample exclusion."]);
      assert.deepEqual(payload.verification, ["Sample verification step."]);
      assert.deepEqual(payload.next_lifecycle_options, [
        {
          to: "backlog",
          dry_run_command: "npm run project -- transition AB-099 ready backlog --dry-run",
          apply_command: "npm run project -- transition AB-099 ready backlog"
        },
        {
          to: "parking_lot",
          dry_run_command: "npm run project -- transition AB-099 ready parking_lot --dry-run",
          apply_command: "npm run project -- transition AB-099 ready parking_lot"
        },
        {
          to: "in_progress",
          dry_run_command: "npm run project -- transition AB-099 ready in_progress --dry-run",
          apply_command: "npm run project -- transition AB-099 ready in_progress"
        }
      ]);
      assert.equal(payload.disposition_reminder, false);
    },
    queue,
    [
      {
        id: "AB-099",
        title: "Sample Handoff Target",
        status: "ready",
        body: [
          "## Background",
          "",
          "Background text.",
          "",
          "## Goal",
          "",
          "Sample goal text.",
          "",
          "## Scope",
          "",
          "- Sample scope item.",
          "",
          "## Out of Scope",
          "",
          "- Sample exclusion.",
          "",
          "## Verification",
          "",
          "- Sample verification step.",
          ""
        ].join("\n")
      }
    ]
  );
});

test("handoff renders a legacy item safely without inferring metadata or lifecycle commands", async () => {
  await withRepository(
    async (root) => {
      const filePath = path.join(root, "docs", "work-items", "AB-004.md");
      const before = await readFile(filePath, "utf8");

      const terminal = runScript(SCRIPTS.unified, ["handoff", "AB-004"], root);
      assert.equal(terminal.status, 0, terminal.stderr);
      assert.match(terminal.stdout, /^# Handoff: AB-004 - Legacy Handoff Fixture/);
      assert.match(terminal.stdout, /Legacy work item: no metadata block present/);
      assert.doesNotMatch(terminal.stdout, /## Goal/);
      assert.doesNotMatch(terminal.stdout, /## Lifecycle Commands/);

      const jsonResult = runScript(SCRIPTS.unified, ["handoff", "AB-004", "--output", "json"], root);
      const payload = parseJsonOutput(jsonResult).payload as Record<string, unknown>;
      assert.equal(payload.legacy, true);
      assert.equal(payload.status, null);
      assert.deepEqual(payload.next_lifecycle_options, []);

      assert.equal(await readFile(filePath, "utf8"), before, "legacy work item must remain byte-identical");
    },
    undefined,
    [{ id: "AB-004", title: "Legacy Handoff Fixture", legacy: true }]
  );
});

test("handoff handles missing or invalid identifiers clearly without writes", async () => {
  await withRepository(async (root) => {
    const missingArgument = runScript(SCRIPTS.unified, ["handoff"], root);
    assert.equal(missingArgument.status, 1);
    assert.match(missingArgument.stderr, /"code": "MISSING_IDENTIFIER"/);

    const invalidId = runScript(SCRIPTS.unified, ["handoff", "AB-999999"], root);
    assert.equal(invalidId.status, 1);
    assert.match(invalidId.stderr, /"code": "INVALID_IDENTIFIER"/);

    const notFound = runScript(SCRIPTS.unified, ["handoff", "AB-777"], root);
    assert.equal(notFound.status, 1);
    assert.match(notFound.stderr, /"code": "WORK_ITEM_NOT_FOUND"/);
  });
});

test("handoff renders topic and disposition context when present and flags unregistered or malformed values", async () => {
  const queue = renderQueue({ "In Progress": [queueEntry("AN-096", "Sample Analysis With Topics")] });
  await withRepository(
    async (root) => {
      await writeTopicTaxonomy(root, sampleTopicsJson());

      const terminal = runScript(SCRIPTS.unified, ["handoff", "AN-096"], root);
      assert.equal(terminal.status, 0, terminal.stderr);
      assert.match(terminal.stdout, /- Primary topic: worksmith/);
      assert.match(terminal.stdout, /- Secondary topics: unregistered-topic/);
      assert.match(terminal.stdout, /- Disposition: not_a_real_status/);
      assert.match(terminal.stdout, /Warnings:/);
      assert.doesNotMatch(terminal.stdout, /Reminder: record AN disposition/);

      const jsonResult = runScript(SCRIPTS.unified, ["handoff", "AN-096", "--output", "json"], root);
      const envelope = parseJsonOutput(jsonResult);
      const diagnostics = envelope.diagnostics as Array<Record<string, unknown>>;
      assert.ok(diagnostics.some((diagnostic) => diagnostic.code === "UNREGISTERED_TOPIC"));
      assert.ok(diagnostics.some((diagnostic) => diagnostic.code === "MALFORMED_DISPOSITION"));
    },
    queue,
    [
      {
        id: "AN-096",
        title: "Sample Analysis With Topics",
        status: "in_progress",
        body: [
          "## Background",
          "",
          "Test analysis.",
          "",
          "## Analysis Result",
          "",
          "- **Primary topic:** worksmith",
          "- Secondary topics: unregistered-topic",
          "- Disposition: not_a_real_status",
          ""
        ].join("\n")
      }
    ]
  );
});

test("handoff shows a neutral topic line and an AN disposition reminder when disposition is missing", async () => {
  const queue = renderQueue({
    "Needs Review": [queueEntry("AN-097", "Sample Analysis Without Disposition")]
  });
  await withRepository(
    async (root) => {
      const terminal = runScript(SCRIPTS.unified, ["handoff", "AN-097"], root);
      assert.equal(terminal.status, 0, terminal.stderr);
      assert.match(
        terminal.stdout,
        /Topic classification: not yet recorded — see \.worksmith\/topics\.json for the registered vocabulary\./
      );
      assert.match(
        terminal.stdout,
        /Reminder: record AN disposition \(see PROJECT_WORKFLOW\.md\) before requesting needs_review\./
      );

      const jsonResult = runScript(SCRIPTS.unified, ["handoff", "AN-097", "--output", "json"], root);
      const payload = parseJsonOutput(jsonResult).payload as Record<string, unknown>;
      assert.equal(payload.disposition_reminder, true);
    },
    queue,
    [{ id: "AN-097", title: "Sample Analysis Without Disposition", status: "needs_review" }]
  );
});

test("handoff performs no repository writes and never acquires the mutation lock", async () => {
  const queue = renderQueue({ Ready: [queueEntry("AB-098", "Read Only Handoff Target")] });
  await withRepository(
    async (root) => {
      const queuePath = path.join(root, "docs", "WORK_QUEUE.md");
      const originalQueue = await readFile(queuePath, "utf8");
      const lockPath = path.join(root, MUTATION_LOCK_FILENAME);
      const lockContent = "simulated active mutation\n";
      await writeFile(lockPath, lockContent, "utf8");
      const itemPath = path.join(root, "docs", "work-items", "AB-098.md");
      const originalItem = await readFile(itemPath, "utf8");

      assert.equal(runScript(SCRIPTS.unified, ["handoff", "AB-098"], root).status, 0);

      assert.equal(await readFile(queuePath, "utf8"), originalQueue);
      assert.equal(await readFile(lockPath, "utf8"), lockContent, "pre-existing lock must be left untouched");
      assert.equal(await readFile(itemPath, "utf8"), originalItem, "work item must never be modified");
    },
    queue,
    [{ id: "AB-098", title: "Read Only Handoff Target", status: "ready" }]
  );
});

test("usage text and help command list the handoff command", async () => {
  await withRepository(async (root) => {
    const help = runScript(SCRIPTS.unified, ["help"], root);
    assert.equal(help.status, 0, help.stderr);
    assert.match(help.stdout, /npm run project -- handoff AB-204 \[--output terminal\|json\]/);
  });
});

async function listFilesRecursively(directory: string, baseDirectory = directory): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await listFilesRecursively(entryPath, baseDirectory)));
    } else {
      files.push(path.relative(baseDirectory, entryPath).split(path.sep).join("/"));
    }
  }
  return files;
}

test("worksmith kit exists with required files and documented sections", async () => {
  const kitDirectory = path.join(REPOSITORY_ROOT, "tools", "worksmith");
  const expectedFiles = [
    "START_HERE_FOR_AI.md",
    "README.md",
    "UPGRADE_NOTES.md",
    "MANIFEST.json",
    "scaffold/AGENTS_TEMPLATE.md",
    "scaffold/PACKAGE_SCRIPT_SNIPPET.md",
    "scaffold/docs/project/PROJECT_RULES_TEMPLATE.md",
    "scaffold/docs/project/PROJECT_WORKFLOW_TEMPLATE.md",
    "scaffold/docs/project/WORK_ITEM_SCHEMA_TEMPLATE.md",
    "scaffold/docs/project/DOCUMENT_INDEX_TEMPLATE.md",
    "scaffold/docs/project/PROJECT_STATUS_TEMPLATE.md",
    "scaffold/docs/project/DECISIONS_TEMPLATE.md",
    "scaffold/docs/project/PROJECT_CONTEXT_TEMPLATE.md",
    "scaffold/docs/development/PROJECT_ADMINISTRATION_TEMPLATE.md",
    "examples/topics.json.example"
  ];

  const contents = new Map<string, string>();
  for (const fileName of expectedFiles) {
    const content = await readFile(path.join(kitDirectory, fileName), "utf8");
    assert.ok(content.trim().length > 0, `${fileName} must not be empty`);
    contents.set(fileName, content);
  }

  const startHere = contents.get("START_HERE_FOR_AI.md") ?? "";
  assert.match(startHere, /docs\/project\//);
  assert.match(startHere, /docs\/development\//);
  assert.match(startHere, /may be deleted or ignored/);
  assert.match(startHere, /Never touch, ever/);
  assert.match(startHere, /Required Before Manifest:/);

  const readme = contents.get("README.md") ?? "";
  assert.match(readme, /Known Limitations/);
  assert.match(readme, /"AN"/);
  assert.match(readme, /in_progress/);
  assert.match(readme, /needs_review/);
  assert.match(readme, /own permanent documentation home/i);

  const administrationTemplate =
    contents.get("scaffold/docs/development/PROJECT_ADMINISTRATION_TEMPLATE.md") ?? "";
  assert.match(administrationTemplate, /Known Bootstrap Limitations/);
  assert.match(administrationTemplate, /"AN"/);

  const topicsExample = JSON.parse(contents.get("examples/topics.json.example") ?? "{}") as {
    schema_version: number;
    topics: Array<{ id: string; label: string }>;
  };
  assert.equal(topicsExample.schema_version, 1);
  assert.ok(topicsExample.topics.length > 0);

  const manifest = JSON.parse(contents.get("MANIFEST.json") ?? "{}") as {
    schema_version: number;
    core_files: Array<{ source_path: string; core_path: string; sha256: string }>;
  };
  assert.equal(manifest.schema_version, 1);
  assert.ok(manifest.core_files.length > 0);
});

test("worksmith kit templates and examples do not contain real ArmBase topic ids", async () => {
  const armbaseTopics = JSON.parse(
    await readFile(path.join(REPOSITORY_ROOT, ".worksmith", "topics.json"), "utf8")
  ) as { topics: Array<{ id: string }> };
  const armbaseTopicIds = armbaseTopics.topics.map((topic) => topic.id);
  assert.ok(armbaseTopicIds.length > 0, "expected ArmBase's own topics.json to be non-empty");

  const kitDirectory = path.join(REPOSITORY_ROOT, "tools", "worksmith");
  const kitFiles = (await listFilesRecursively(kitDirectory)).filter(
    (fileName) => !fileName.startsWith("core/")
  );
  assert.ok(kitFiles.length > 5, "expected the kit to contain its full nested scaffold/examples file set");

  for (const fileName of kitFiles) {
    const content = await readFile(path.join(kitDirectory, fileName), "utf8");
    for (const topicId of armbaseTopicIds) {
      assert.ok(
        !content.includes(`"${topicId}"`),
        `${fileName} must not contain the real ArmBase topic id "${topicId}"`
      );
    }
  }
});

test("worksmith kit core/ and MANIFEST.json match the live runtime source without drift", async () => {
  const { computeExpectedCoreFiles } = await import("../../build-worksmith-kit");
  const expected = await computeExpectedCoreFiles();

  const manifestPath = path.join(REPOSITORY_ROOT, "tools", "worksmith", "MANIFEST.json");
  const manifest = JSON.parse(await readFile(manifestPath, "utf8")) as {
    schema_version: number;
    core_files: Array<{ source_path: string; core_path: string; sha256: string }>;
  };

  assert.deepEqual(
    manifest.core_files,
    expected.map(({ source_path, core_path, sha256 }) => ({ source_path, core_path, sha256 })),
    "MANIFEST.json is stale — run `npm run worksmith:build-kit` after changing Worksmith runtime source"
  );

  for (const entry of expected) {
    const committedContent = await readFile(
      path.join(REPOSITORY_ROOT, "tools", "worksmith", entry.core_path),
      "utf8"
    );
    assert.equal(
      committedContent,
      entry.content.toString("utf8"),
      `tools/worksmith/${entry.core_path} is stale relative to ${entry.source_path} — run \`npm run worksmith:build-kit\``
    );
  }
});

test("docs/templates does not exist as a competing Worksmith adoption path", async () => {
  await assert.rejects(
    () => access(path.join(REPOSITORY_ROOT, "docs", "templates")),
    /ENOENT/,
    "docs/templates was retired in favor of tools/worksmith/scaffold/ being the single adoption path"
  );
  await assert.rejects(
    () => access(path.join(REPOSITORY_ROOT, "docs", "templates", "worksmith-adoption")),
    /ENOENT/,
    "the superseded AB-249 bundle should be retired now that tools/worksmith/ exists"
  );
});
