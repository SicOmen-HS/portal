namespace Portal.Api.Contracts;

/// <summary>
/// Backend-owned dataset metadata contract for GET /api/datasets/{id}. Served from
/// static, registry-owned data in this POC — the SQL Server-backed proof of concept
/// is scoped to the preview endpoint (see DatasetPreviewDto).
/// </summary>
public sealed record DatasetDetailDto(
    string Id,
    string Name,
    string Description,
    string DataDomain,
    string Owner,
    string Steward,
    string Classification,
    string UpdateFrequency,
    IReadOnlyList<DatasetFieldDto> Fields);
