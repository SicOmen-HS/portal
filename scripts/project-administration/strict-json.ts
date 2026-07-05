export function findDuplicateJsonKeys(json: string): string[] {
  let offset = 0;
  const duplicates: string[] = [];

  function skipWhitespace(): void {
    while (/\s/.test(json[offset] ?? "")) {
      offset += 1;
    }
  }

  function parseString(): string {
    const start = offset;
    offset += 1;

    while (offset < json.length) {
      if (json[offset] === "\\") {
        offset += 2;
      } else if (json[offset] === '"') {
        offset += 1;
        return JSON.parse(json.slice(start, offset)) as string;
      } else {
        offset += 1;
      }
    }

    return "";
  }

  function parseValue(location: string): void {
    skipWhitespace();

    if (json[offset] === "{") {
      parseObject(location);
      return;
    }

    if (json[offset] === "[") {
      parseArray(location);
      return;
    }

    if (json[offset] === '"') {
      parseString();
      return;
    }

    while (offset < json.length && !/[\s,}\]]/.test(json[offset])) {
      offset += 1;
    }
  }

  function parseObject(location: string): void {
    const keys = new Set<string>();
    offset += 1;
    skipWhitespace();

    if (json[offset] === "}") {
      offset += 1;
      return;
    }

    while (offset < json.length) {
      skipWhitespace();
      const key = parseString();
      const keyLocation = location ? `${location}.${key}` : key;

      if (keys.has(key)) {
        duplicates.push(keyLocation);
      }
      keys.add(key);

      skipWhitespace();
      offset += 1;
      parseValue(keyLocation);
      skipWhitespace();

      if (json[offset] === "}") {
        offset += 1;
        return;
      }

      offset += 1;
    }
  }

  function parseArray(location: string): void {
    offset += 1;
    skipWhitespace();

    if (json[offset] === "]") {
      offset += 1;
      return;
    }

    let index = 0;
    while (offset < json.length) {
      parseValue(`${location}[${index}]`);
      index += 1;
      skipWhitespace();

      if (json[offset] === "]") {
        offset += 1;
        return;
      }

      offset += 1;
    }
  }

  parseValue("");
  return duplicates;
}

export function parseStrictJson(json: string): unknown {
  const parsed = JSON.parse(json) as unknown;
  const duplicates = findDuplicateJsonKeys(json);

  if (duplicates.length > 0) {
    throw new Error(`Duplicate JSON key(s): ${duplicates.join(", ")}.`);
  }

  return parsed;
}
