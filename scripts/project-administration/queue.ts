import { WORK_ITEM_IDENTIFIER_PATTERN_SOURCE, WORK_ITEMS_DIRECTORY } from "./identifiers";

export { STATUS_TO_QUEUE_SECTION } from "./configuration";

const QUEUE_IDENTIFIER_LINE_PATTERN = new RegExp(
  `^\\s*-\\s+(${WORK_ITEM_IDENTIFIER_PATTERN_SOURCE})\\s+[-–—]\\s+.+$`
);
const QUEUE_ENTRY_LINE_PATTERN = new RegExp(
  `^\\s*-\\s+(${WORK_ITEM_IDENTIFIER_PATTERN_SOURCE})\\s+[-–—]\\s+(.+?)\\s*$`
);

export class QueueMutationError extends Error {
  constructor(
    readonly code: string,
    message: string
  ) {
    super(message);
    this.name = "QueueMutationError";
  }
}

export interface QueueListItem {
  id: string;
  title: string;
  reference?: string;
  completed_on?: string;
}

export interface QueueListSection {
  name: string;
  items: QueueListItem[];
}

function findSectionHeading(lines: string[], section: string): number {
  const heading = `## ${section}`;
  const indexes = lines
    .map((line, index) => (line === heading ? index : -1))
    .filter((index) => index >= 0);

  if (indexes.length !== 1) {
    throw new QueueMutationError(
      "QUEUE_SECTION_COUNT",
      `Expected exactly one '${heading}' section, found ${indexes.length}.`
    );
  }

  return indexes[0];
}

export function parseQueueListing(queue: string, sectionNames: readonly string[]): QueueListSection[] {
  const lines = queue.split(/\r?\n/);

  return sectionNames.map((name) => {
    const headingIndex = findSectionHeading(lines, name);
    let sectionEnd = lines.length;
    for (let index = headingIndex + 1; index < lines.length; index += 1) {
      if (/^## /.test(lines[index])) {
        sectionEnd = index;
        break;
      }
    }

    const items: QueueListItem[] = [];
    for (let index = headingIndex + 1; index < sectionEnd; index += 1) {
      const entryMatch = lines[index].match(QUEUE_ENTRY_LINE_PATTERN);
      if (entryMatch === null) {
        continue;
      }

      const item: QueueListItem = {
        id: entryMatch[1],
        title: entryMatch[2]
      };
      let detailIndex = index + 1;
      while (detailIndex < sectionEnd && /^\s+\S/.test(lines[detailIndex])) {
        const detail = lines[detailIndex].trim();
        if (detail.startsWith("See:")) {
          item.reference = detail.slice("See:".length).trim();
        } else if (detail.startsWith("Completed:")) {
          item.completed_on = detail.slice("Completed:".length).trim();
        }
        detailIndex += 1;
      }
      items.push(item);
      index = detailIndex - 1;
    }

    return { name, items };
  });
}

export function insertQueueEntry(
  queue: string,
  section: string,
  identifier: string,
  title: string,
  completedOn?: string
): { content: string; entry: string } {
  const newline = queue.includes("\r\n") ? "\r\n" : "\n";
  const lines = queue.split(/\r?\n/);
  const headingIndex = findSectionHeading(lines, section);
  let remainderIndex = headingIndex + 1;
  while (remainderIndex < lines.length && lines[remainderIndex].trim() === "") {
    remainderIndex += 1;
  }

  const entryLines = [
    `- ${identifier} - ${title}`,
    `  See: ${WORK_ITEMS_DIRECTORY}/${identifier}.md`,
    ...(completedOn === undefined ? [] : [`  Completed: ${completedOn}`])
  ];
  const updatedLines = [
    ...lines.slice(0, headingIndex + 1),
    "",
    ...entryLines,
    "",
    ...lines.slice(remainderIndex)
  ];

  return { content: updatedLines.join(newline), entry: entryLines.join("\n") };
}

export function getQueueIdentifiersInSection(queue: string, targetSection: string): string[] {
  const identifiers: string[] = [];
  let section = "";

  for (const line of queue.split(/\r?\n/)) {
    const sectionMatch = line.match(/^## (.+)$/);
    if (sectionMatch !== null) {
      section = sectionMatch[1].trim();
      continue;
    }

    const entryMatch = line.match(QUEUE_IDENTIFIER_LINE_PATTERN);
    if (section === targetSection && entryMatch !== null) {
      identifiers.push(entryMatch[1]);
    }
  }

  return identifiers;
}

export function moveQueueEntry(
  queue: string,
  identifier: string,
  title: string,
  expectedSection: string,
  targetSection: string,
  completedOn?: string
): { content: string; entry: string } {
  const newline = queue.includes("\r\n") ? "\r\n" : "\n";
  const lines = queue.split(/\r?\n/);
  let section = "";
  const matches: Array<{ start: number; end: number; section: string; title: string }> = [];

  for (let index = 0; index < lines.length; index += 1) {
    const sectionMatch = lines[index].match(/^## (.+)$/);
    if (sectionMatch !== null) {
      section = sectionMatch[1].trim();
      continue;
    }

    const entryMatch = lines[index].match(QUEUE_ENTRY_LINE_PATTERN);
    if (entryMatch?.[1] !== identifier) {
      continue;
    }

    let end = index + 1;
    while (end < lines.length && /^\s+\S/.test(lines[end])) {
      end += 1;
    }
    matches.push({ start: index, end, section, title: entryMatch[2] });
  }

  if (matches.length !== 1) {
    throw new QueueMutationError(
      "QUEUE_ENTRY_COUNT",
      `Expected exactly one queue entry for '${identifier}', found ${matches.length}.`
    );
  }

  const match = matches[0];
  if (match.section !== expectedSection) {
    throw new QueueMutationError(
      "QUEUE_SOURCE_STATUS_MISMATCH",
      `'${identifier}' is in '${match.section}', expected '${expectedSection}'.`
    );
  }
  if (match.title !== title) {
    throw new QueueMutationError(
      "QUEUE_TITLE_MISMATCH",
      `'${identifier}' queue title does not match work-item metadata.`
    );
  }

  findSectionHeading(lines, targetSection);
  const withoutEntry = [...lines.slice(0, match.start), ...lines.slice(match.end)].join(newline);
  return insertQueueEntry(withoutEntry, targetSection, identifier, title, completedOn);
}
