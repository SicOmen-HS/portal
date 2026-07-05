/**
 * Reusable parser for the Stage A topic/disposition workflow convention
 * defined in PROJECT_WORKFLOW.md (see AN-019, AB-245). This is a plain-text
 * label scan, not a validator: it never infers values from prose, never
 * fuzzy-matches a label, and treats an item with no labels as valid and
 * readable. Whether a parsed value is actually meaningful (a registered
 * topic id, a known disposition status) is decided by callers.
 */

export const DISPOSITION_STATUSES = [
  "accepted_now",
  "accepted_later",
  "rejected",
  "parked",
  "no_action",
  "needs_more_analysis"
] as const;
export type DispositionStatus = (typeof DISPOSITION_STATUSES)[number];

export function isKnownDispositionStatus(value: string): value is DispositionStatus {
  return DISPOSITION_STATUSES.some((status) => status === value);
}

export interface ParsedTopicConvention {
  primary_topic: string | null;
  secondary_topics: string[];
  disposition: string | null;
  disposition_note: string | null;
  follow_up: string[];
}

type ConventionField = keyof ParsedTopicConvention;

interface LabelPattern {
  field: ConventionField;
  pattern: RegExp;
}

/**
 * Tolerates an optional leading `- ` bullet marker and the bold Markdown
 * form (`**Label:**`) in addition to the plain form (`Label:`), since both
 * appear naturally in Markdown work items. It never fuzzy-matches: the
 * label text itself must be exact.
 */
function labelPattern(label: string): RegExp {
  const escaped = label.replaceAll(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`^(?:-\\s+)?(?:\\*\\*)?${escaped}(?:\\*\\*)?\\s*(.*)$`);
}

const LABEL_PATTERNS: readonly LabelPattern[] = [
  { field: "primary_topic", pattern: labelPattern("Primary topic:") },
  { field: "secondary_topics", pattern: labelPattern("Secondary topics:") },
  { field: "disposition_note", pattern: labelPattern("Disposition note:") },
  { field: "disposition", pattern: labelPattern("Disposition:") },
  { field: "follow_up", pattern: labelPattern("Follow-up:") }
];

function splitCommaList(value: string): string[] {
  if (value.trim().length === 0) {
    return [];
  }
  return value
    .split(",")
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
}

export function parseTopicConvention(content: string): ParsedTopicConvention {
  const result: ParsedTopicConvention = {
    primary_topic: null,
    secondary_topics: [],
    disposition: null,
    disposition_note: null,
    follow_up: []
  };
  const seenFields = new Set<ConventionField>();

  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (line.length === 0) {
      continue;
    }

    for (const { field, pattern } of LABEL_PATTERNS) {
      if (seenFields.has(field)) {
        continue;
      }
      const match = line.match(pattern);
      if (match === null) {
        continue;
      }
      seenFields.add(field);
      const value = match[1].trim();

      switch (field) {
        case "primary_topic":
        case "disposition":
        case "disposition_note":
          result[field] = value.length === 0 ? null : value;
          break;
        case "secondary_topics":
        case "follow_up":
          result[field] = splitCommaList(value);
          break;
      }
      break;
    }
  }

  return result;
}

export function hasTopicConventionData(convention: ParsedTopicConvention): boolean {
  return (
    convention.primary_topic !== null ||
    convention.secondary_topics.length > 0 ||
    convention.disposition !== null ||
    convention.disposition_note !== null ||
    convention.follow_up.length > 0
  );
}
