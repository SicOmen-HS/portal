using Portal.Api.Contracts;

namespace Portal.Api.Datasets;

/// <summary>
/// Reads preview rows for a known dataset from its underlying data source.
/// Implementations must never accept a table name, column name or SQL fragment
/// from a caller - only a dataset-id, resolved against KnownDatasetsRegistry.
/// </summary>
public interface IDatasetSourceAdapter
{
    /// <summary>
    /// Returns up to <paramref name="maxRows"/> fictional preview rows for
    /// <paramref name="datasetId"/>, or null if the dataset-id is not known/allowed.
    /// </summary>
    Task<DatasetPreviewDto?> GetPreviewRowsAsync(string datasetId, int maxRows, CancellationToken cancellationToken);
}
