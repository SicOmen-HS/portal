using Microsoft.AspNetCore.Mvc;
using Portal.Api.Contracts;
using Portal.Api.Datasets;

namespace Portal.Api.Controllers;

[ApiController]
[Route("api/datasets")]
public sealed class DatasetsController : ControllerBase
{
    // Fixed, backend-controlled row limit for the local POC - never client-supplied.
    private const int PreviewRowLimit = 10;

    private readonly IDatasetSourceAdapter _datasetSourceAdapter;
    private readonly IDeclaredDatasetOriginAdapter _declaredDatasetOriginAdapter;

    public DatasetsController(IDatasetSourceAdapter datasetSourceAdapter, IDeclaredDatasetOriginAdapter declaredDatasetOriginAdapter)
    {
        _datasetSourceAdapter = datasetSourceAdapter;
        _declaredDatasetOriginAdapter = declaredDatasetOriginAdapter;
    }

    /// <summary>
    /// Static, registry-owned dataset metadata. Does not read from SQL Server in
    /// this POC - see GetPreview for the endpoint that proves the real SQL read.
    /// </summary>
    [HttpGet("{id}")]
    public ActionResult<DatasetDetailDto> GetDataset(string id)
    {
        var entry = KnownDatasetsRegistry.TryGet(id);
        return entry is null ? NotFound() : Ok(entry.Metadata);
    }

    [HttpGet("{id}/preview")]
    public async Task<ActionResult<DatasetPreviewDto>> GetPreview(string id, CancellationToken cancellationToken)
    {
        var preview = await _datasetSourceAdapter.GetPreviewRowsAsync(id, PreviewRowLimit, cancellationToken);
        return preview is null ? NotFound() : Ok(preview);
    }

    /// <summary>
    /// Manually declared, immediate upstream origins for a known dataset - not full or
    /// automatically discovered lineage. An unknown dataset-id is rejected here,
    /// against the same registry as GetDataset/GetPreview, before any SQL Server call.
    /// A known dataset with no registered origin returns an empty list, not a 404.
    /// </summary>
    [HttpGet("{id}/declared-origins")]
    public async Task<ActionResult<IReadOnlyList<DeclaredDatasetOriginDto>>> GetDeclaredOrigins(string id, CancellationToken cancellationToken)
    {
        if (KnownDatasetsRegistry.TryGet(id) is null)
        {
            return NotFound();
        }

        var origins = await _declaredDatasetOriginAdapter.GetDeclaredOriginsAsync(id, cancellationToken);
        return Ok(origins);
    }
}
