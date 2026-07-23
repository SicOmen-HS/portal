using Portal.Api.Contracts;

namespace Portal.Api.Datasets;

/// <summary>
/// Reads manually declared, immediate upstream origins for a known dataset. This is a
/// separate responsibility from IDatasetSourceAdapter (preview rows) - it never
/// accepts a table name, column name or SQL fragment from a caller, only a
/// dataset-id, resolved against KnownDatasetsRegistry by the caller.
/// </summary>
public interface IDeclaredDatasetOriginAdapter
{
    /// <summary>
    /// Returns every declared immediate origin registered for <paramref name="datasetId"/>,
    /// ordered deterministically by upstream schema and object name. Returns an empty
    /// list when the dataset-id is known but has no declared origin. Callers are
    /// expected to have already confirmed the dataset-id is known (see
    /// KnownDatasetsRegistry) before calling this - this adapter does not decide
    /// whether a dataset-id exists in the catalog.
    /// </summary>
    Task<IReadOnlyList<DeclaredDatasetOriginDto>> GetDeclaredOriginsAsync(string datasetId, CancellationToken cancellationToken);
}
