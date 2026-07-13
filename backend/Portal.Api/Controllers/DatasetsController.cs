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

    public DatasetsController(IDatasetSourceAdapter datasetSourceAdapter)
    {
        _datasetSourceAdapter = datasetSourceAdapter;
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
}
