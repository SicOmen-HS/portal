/**
 * Frontend-owned mirror of the backend's DatasetPreviewDto response shape
 * (GET /api/datasets/{id}/preview). A small, additive transport type for the
 * local SQL Server preview POC (AB-027) - not a new top-level information
 * object, and not imported by or dependent on any backend code.
 */
export interface DatasetPreview {
  datasetId: string;
  columns: string[];
  rows: string[][];
}
