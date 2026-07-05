export const SUPPORTED_PREFIXES = ["AB", "AN", "IM"] as const;
export type WorkItemPrefix = (typeof SUPPORTED_PREFIXES)[number];

export const SUPPORTED_STATUSES = [
  "inbox",
  "backlog",
  "parking_lot",
  "ready",
  "in_progress",
  "needs_review",
  "done"
] as const;
export type WorkItemStatus = (typeof SUPPORTED_STATUSES)[number];

function deepFreeze<TValue>(value: TValue): TValue {
  if (typeof value === "object" && value !== null && !Object.isFrozen(value)) {
    for (const nested of Object.values(value as Record<string, unknown>)) {
      deepFreeze(nested);
    }
    Object.freeze(value);
  }
  return value;
}

export interface ProjectAdministrationConfig {
  applicationName: string;
  paths: {
    workItemsDirectory: string;
    workQueue: string;
  };
  prefixes: readonly string[];
  identifierDigits: {
    minimum: number;
    maximum: number;
  };
  statuses: readonly string[];
  creationStatuses: readonly string[];
  activeStatuses: readonly string[];
  statusToQueueSection: Readonly<Record<string, string>>;
  validTransitions: Readonly<Record<string, readonly string[]>>;
  metadata: {
    startSentinel: string;
    endSentinel: string;
    schemaVersion: number;
  };
  projectTimezone: string;
  projectKnowledgeFiles: readonly string[];
}

export const STATUS_TO_QUEUE_SECTION: Readonly<Record<string, string>> = {
  inbox: "Inbox",
  backlog: "Backlog",
  parking_lot: "Parking Lot",
  ready: "Ready",
  in_progress: "In Progress",
  needs_review: "Needs Review",
  done: "Done"
};

export const VALID_TRANSITIONS: Readonly<
  Record<WorkItemStatus, readonly WorkItemStatus[]>
> = {
  inbox: ["backlog", "parking_lot", "ready"],
  backlog: ["parking_lot", "ready"],
  parking_lot: ["backlog", "ready"],
  ready: ["backlog", "parking_lot", "in_progress"],
  in_progress: ["ready", "needs_review"],
  needs_review: ["in_progress", "done"],
  done: []
};

export const ARMBASE_PROJECT_ADMINISTRATION_CONFIG: ProjectAdministrationConfig = deepFreeze({
  applicationName: "ArmBase Project Administration CLI",
  paths: {
    workItemsDirectory: "docs/work-items",
    workQueue: "docs/WORK_QUEUE.md"
  },
  prefixes: SUPPORTED_PREFIXES,
  identifierDigits: {
    minimum: 3,
    maximum: 5
  },
  statuses: SUPPORTED_STATUSES,
  creationStatuses: ["inbox", "backlog", "parking_lot", "ready"],
  activeStatuses: ["ready", "in_progress", "needs_review"],
  statusToQueueSection: STATUS_TO_QUEUE_SECTION,
  validTransitions: VALID_TRANSITIONS,
  metadata: {
    startSentinel: "<!-- ARMBASE_WORK_ITEM_METADATA_START",
    endSentinel: "ARMBASE_WORK_ITEM_METADATA_END -->",
    schemaVersion: 1
  },
  projectTimezone: "Europe/Stockholm",
  projectKnowledgeFiles: [
    "README.md",
    "docs/project/PROJECT_RULES.md",
    "docs/project/DOCUMENT_INDEX.md",
    "docs/project/PROJECT_STATUS.md",
    "docs/project/DECISIONS.md",
    "docs/project/ROADMAP.md",
    "docs/project/IMPORT_OBSERVATIONS.md",
    "docs/project/WORK_ITEM_SCHEMA.md",
    "docs/development/PROJECT_ADMINISTRATION.md"
  ]
});
