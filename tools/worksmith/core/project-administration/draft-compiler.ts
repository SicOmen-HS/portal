import {
  ManifestError,
  SECTION_KEYS,
  validateManifest,
  type CreateWorkItemManifest,
  type SectionKey
} from "../create-work-item";
import { findFirstHeadingIndex, parseBulletList, parseParagraphs, splitMarkdownSections } from "./markdown-sections";

/**
 * Version 1 Markdown draft grammar for work-item creation input (see
 * docs/development/PROJECT_ADMINISTRATION.md). This module only compiles a
 * draft into the existing strict create_work_item manifest shape — it never
 * reads or writes repository files and never allocates an identifier. The
 * strict JSON manifest, validated by the existing `validateManifest` (from
 * create-work-item.ts), remains the sole canonical machine contract; this
 * compiler is an authoring convenience layered on top of it, per AN-010.
 */
export const DRAFT_VERSION_MARKER = "WORKSMITH_DRAFT_V1";

const DRAFT_FIELD_LABELS = {
  Prefix: "prefix",
  Title: "title",
  "Initial Status": "initial_status",
  "Created On": "created_on",
  "Commit Message": "commit_message"
} as const;
type DraftFieldName = (typeof DRAFT_FIELD_LABELS)[keyof typeof DRAFT_FIELD_LABELS];
const DRAFT_FIELD_LABEL_LIST = Object.keys(DRAFT_FIELD_LABELS) as (keyof typeof DRAFT_FIELD_LABELS)[];

const DRAFT_SECTION_HEADINGS: Record<string, SectionKey> = {
  Background: "background",
  Goal: "goal",
  Scope: "scope",
  Requirements: "requirements",
  Verification: "verification",
  "Acceptance Criteria": "acceptance_criteria",
  "Out of Scope": "out_of_scope",
  Deliverables: "deliverables"
};
const PARAGRAPH_SECTIONS = new Set<SectionKey>(["background", "goal"]);

export class DraftCompilationError extends Error {
  constructor(
    readonly code: string,
    message: string,
    readonly details?: unknown
  ) {
    super(message);
    this.name = "DraftCompilationError";
  }
}

interface ParsedDraftFields {
  prefix: string;
  title: string;
  initial_status: string;
  created_on: string;
  commit_message: string;
}

function splitLines(content: string): string[] {
  return content.split(/\r?\n/);
}

function parseDraftFields(lines: readonly string[], startIndex: number, endIndex: number): ParsedDraftFields {
  const found = new Map<DraftFieldName, string>();

  for (let index = startIndex; index < endIndex; index += 1) {
    const line = lines[index];
    if (line.trim().length === 0) {
      continue;
    }

    const match = line.match(/^([A-Za-z ]+):\s?(.*)$/);
    const label = match?.[1].trim();
    const isKnownLabel = label !== undefined && DRAFT_FIELD_LABEL_LIST.includes(label as keyof typeof DRAFT_FIELD_LABELS);

    if (match === null || !isKnownLabel) {
      throw new DraftCompilationError(
        "DRAFT_UNKNOWN_STRUCTURE",
        `Line ${index + 1} is not a recognized draft field: '${line}'.`
      );
    }

    const fieldName = DRAFT_FIELD_LABELS[label as keyof typeof DRAFT_FIELD_LABELS];
    if (found.has(fieldName)) {
      throw new DraftCompilationError(
        "DRAFT_DUPLICATE_FIELD",
        `Draft field '${label}' appears more than once (line ${index + 1}).`
      );
    }
    found.set(fieldName, match[2].trim());
  }

  const missing = DRAFT_FIELD_LABEL_LIST.filter(
    (label) => !found.has(DRAFT_FIELD_LABELS[label])
  );
  if (missing.length > 0) {
    throw new DraftCompilationError(
      "DRAFT_MISSING_FIELD",
      `Draft is missing required field(s): ${missing.join(", ")}.`
    );
  }

  return {
    prefix: found.get("prefix") ?? "",
    title: found.get("title") ?? "",
    initial_status: found.get("initial_status") ?? "",
    created_on: found.get("created_on") ?? "",
    commit_message: found.get("commit_message") ?? ""
  };
}

function parseDraftSections(lines: readonly string[], fromLineIndex: number): Record<SectionKey, string[]> {
  const found = splitMarkdownSections(lines, fromLineIndex);
  const seenHeadings = new Set<string>();
  const bySectionKey = new Map<SectionKey, string[]>();

  for (const section of found) {
    if (seenHeadings.has(section.heading)) {
      throw new DraftCompilationError(
        "DRAFT_DUPLICATE_SECTION",
        `Section '## ${section.heading}' appears more than once (line ${section.headingLineNumber}).`
      );
    }
    seenHeadings.add(section.heading);

    const sectionKey = DRAFT_SECTION_HEADINGS[section.heading];
    if (sectionKey === undefined) {
      throw new DraftCompilationError(
        "DRAFT_UNKNOWN_SECTION",
        `'## ${section.heading}' (line ${section.headingLineNumber}) is not one of the eight standard work-item sections.`
      );
    }

    const values = PARAGRAPH_SECTIONS.has(sectionKey)
      ? parseParagraphs(section.content)
      : parseBulletList(section.content);

    if (values === null) {
      throw new DraftCompilationError(
        "DRAFT_AMBIGUOUS_SECTION_LINE",
        `Section '## ${section.heading}' contains a line that is not a '- ' bullet. List sections must use one bullet per line.`
      );
    }
    if (values.length === 0) {
      throw new DraftCompilationError(
        "DRAFT_EMPTY_SECTION",
        `Section '## ${section.heading}' has no content.`
      );
    }

    bySectionKey.set(sectionKey, values);
  }

  const missingSections = SECTION_KEYS.filter((key) => !bySectionKey.has(key));
  if (missingSections.length > 0) {
    const missingHeadings = missingSections.map(
      (key) => Object.entries(DRAFT_SECTION_HEADINGS).find(([, value]) => value === key)?.[0]
    );
    throw new DraftCompilationError(
      "DRAFT_MISSING_SECTION",
      `Draft is missing required section(s): ${missingHeadings.join(", ")}.`
    );
  }

  const sections = {} as Record<SectionKey, string[]>;
  for (const key of SECTION_KEYS) {
    sections[key] = bySectionKey.get(key) as string[];
  }
  return sections;
}

/**
 * Compiles a version 1 Markdown draft into the existing strict
 * create_work_item manifest shape. Read-only: performs no file I/O, no
 * identifier allocation and no repository mutation. Rejects ambiguous or
 * incomplete input rather than guessing — see the "Version 1 Markdown Draft
 * Format" section of PROJECT_ADMINISTRATION.md for the exact grammar.
 */
export function compileDraftToManifest(draftContent: string): CreateWorkItemManifest {
  const lines = splitLines(draftContent);
  const firstNonBlankIndex = lines.findIndex((line) => line.trim().length > 0);

  if (firstNonBlankIndex === -1 || lines[firstNonBlankIndex].trim() !== DRAFT_VERSION_MARKER) {
    throw new DraftCompilationError(
      "DRAFT_MISSING_MARKER",
      `Draft must begin with '${DRAFT_VERSION_MARKER}' as its first non-blank line.`
    );
  }

  const firstHeadingIndex = findFirstHeadingIndex(lines, firstNonBlankIndex + 1);
  if (firstHeadingIndex === -1) {
    throw new DraftCompilationError(
      "DRAFT_MISSING_SECTION",
      "Draft has no '## ' section headings. All eight standard sections are required."
    );
  }

  const fields = parseDraftFields(lines, firstNonBlankIndex + 1, firstHeadingIndex);
  const sections = parseDraftSections(lines, firstHeadingIndex);

  const candidateManifest = {
    schema_version: 1,
    operation: "create_work_item",
    work_item: {
      id: "auto",
      prefix: fields.prefix,
      title: fields.title,
      initial_status: fields.initial_status,
      created_on: fields.created_on,
      sections
    },
    documentation: { changes: [] },
    git: {
      commit_message: fields.commit_message,
      commit: false,
      push: false
    }
  };

  try {
    return validateManifest(candidateManifest);
  } catch (error) {
    if (error instanceof ManifestError) {
      throw new DraftCompilationError(
        "DRAFT_MANIFEST_INVALID",
        `Compiled manifest failed validation (${error.code}): ${error.message}`,
        { manifest_error_code: error.code }
      );
    }
    throw error;
  }
}
