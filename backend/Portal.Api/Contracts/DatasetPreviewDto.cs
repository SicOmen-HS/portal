namespace Portal.Api.Contracts;

/// <summary>
/// Backend-owned response for GET /api/datasets/{id}/preview. Rows are always read
/// from the local, fictional SQL Server preview table via SqlServerDatasetSourceAdapter
/// - never hardcoded in backend code.
/// </summary>
public sealed record DatasetPreviewDto(
    string DatasetId,
    IReadOnlyList<string> Columns,
    IReadOnlyList<IReadOnlyList<string>> Rows);
