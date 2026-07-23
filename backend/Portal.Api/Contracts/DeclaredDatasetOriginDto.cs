namespace Portal.Api.Contracts;

/// <summary>
/// Backend-owned description of one manually declared, immediate upstream source for
/// a dataset (GET /api/datasets/{id}/declared-origins). This is a declared technical
/// source reference, not full or automatically discovered lineage, and not a
/// relationship to another catalog object.
/// </summary>
public sealed record DeclaredDatasetOriginDto(
    string DatasetId,
    string UpstreamSchemaName,
    string UpstreamObjectName);
