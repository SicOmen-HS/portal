export interface MarkdownSection {
  heading: string;
  content: string;
  headingLineNumber: number;
}

/**
 * Splits Markdown content into level-2 (`## Heading`) sections. Content
 * before the first `## ` heading (a title, a metadata block, draft fields)
 * is intentionally not returned — callers that need it scan the preamble
 * separately. Shared by the draft compiler (parsing a draft's sections) and
 * the work-item show/fetch command (parsing an existing work item's
 * sections), so both use one exact splitting rule.
 */
export function splitMarkdownSections(
  lines: readonly string[],
  fromLineIndex = 0
): MarkdownSection[] {
  const sections: MarkdownSection[] = [];
  let index = fromLineIndex;

  while (index < lines.length) {
    const headingMatch = lines[index].match(/^##\s+(.+?)\s*$/);
    if (headingMatch === null) {
      index += 1;
      continue;
    }

    const heading = headingMatch[1];
    const headingLineNumber = index + 1;
    index += 1;
    const contentLines: string[] = [];
    while (index < lines.length && !/^##\s+/.test(lines[index])) {
      contentLines.push(lines[index]);
      index += 1;
    }

    sections.push({ heading, content: contentLines.join("\n"), headingLineNumber });
  }

  return sections;
}

export function findFirstHeadingIndex(lines: readonly string[], fromLineIndex = 0): number {
  for (let index = fromLineIndex; index < lines.length; index += 1) {
    if (/^##\s+/.test(lines[index])) {
      return index;
    }
  }
  return -1;
}

/** Blank-line-separated paragraphs; wrapped lines within one paragraph are joined with a space. */
export function parseParagraphs(content: string): string[] {
  return content
    .split(/\r?\n\s*\r?\n/)
    .map((block) =>
      block
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter((line) => line.length > 0)
        .join(" ")
    )
    .filter((paragraph) => paragraph.length > 0);
}

/** `- item` bullet lines only; returns null if a non-blank line does not match the bullet form. */
export function parseBulletList(content: string): string[] | null {
  const items: string[] = [];
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (line.length === 0) {
      continue;
    }
    const match = line.match(/^-\s+(.+)$/);
    if (match === null) {
      return null;
    }
    items.push(match[1].trim());
  }
  return items;
}
