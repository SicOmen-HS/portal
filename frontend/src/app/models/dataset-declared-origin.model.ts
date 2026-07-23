/**
 * Frontend-owned mirror of the backend's DeclaredDatasetOriginDto response shape
 * (GET /api/datasets/{id}/declared-origins). A manually declared, immediate
 * upstream technical source reference for a Dataset - not full or automatically
 * discovered lineage, and not a relationship to another catalog object.
 */
export interface DatasetDeclaredOrigin {
  datasetId: string;
  upstreamSchemaName: string;
  upstreamObjectName: string;
}
