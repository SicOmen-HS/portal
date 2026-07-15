type TrinoColumn = {
  name: string;
};

type TrinoResponse = {
  id?: string;
  infoUri?: string;
  nextUri?: string;
  columns?: TrinoColumn[];
  data?: unknown[][];
  error?: {
    message: string;
  };
};

const trinoHost = process.env.TRINO_HOST ?? "localhost";
const trinoPort = process.env.TRINO_PORT ?? "9999";
const trinoCatalog = process.env.TRINO_CATALOG ?? "lakekeeper";
const trinoSchema = process.env.TRINO_SCHEMA ?? "labtest";
const trinoUser = process.env.TRINO_USER ?? "portal_lab";

const trinoBaseUrl = `http://${trinoHost}:${trinoPort}`;

async function fetchJson(url: string, init?: RequestInit): Promise<TrinoResponse> {
  const response = await fetch(url, init);

  if (!response.ok) {
    throw new Error(`Trino HTTP error ${response.status}`);
  }

  return (await response.json()) as TrinoResponse;
}

export async function queryTrino(sql: string): Promise<Record<string, unknown>[]> {
  let result = await fetchJson(`${trinoBaseUrl}/v1/statement`, {
    method: "POST",
    headers: {
      "content-type": "text/plain",
      "X-Trino-User": trinoUser,
      "X-Trino-Catalog": trinoCatalog,
      "X-Trino-Schema": trinoSchema
    },
    body: sql
  });

  const rows: unknown[][] = [];

  while (true) {
    if (result.error) {
      throw new Error(result.error.message);
    }

    if (result.data) {
      rows.push(...result.data);
    }

    if (!result.nextUri) {
      break;
    }

    result = await fetchJson(result.nextUri);
  }

  const columns = result.columns ?? [];
  return rows.map((row) =>
    Object.fromEntries(columns.map((column, index) => [column.name, row[index]]))
  );
}
