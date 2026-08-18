using Microsoft.AspNetCore.Mvc;
using Portal.Api.Contracts;
using Portal.Api.Datasets;

namespace Portal.Api.Controllers;

/// <summary>
/// Exposes technical assets discovered within the backend's configured SQL Server
/// discovery scope (see DatasetDiscoveryOptions). Deliberately a separate resource
/// from DatasetsController/GET /api/datasets: a discovered technical asset is not a
/// published Dataset - see DiscoveredTechnicalAssetDto and docs/work-items/AB-032.md.
/// </summary>
[ApiController]
[Route("api/technical-assets")]
public sealed class TechnicalAssetsController : ControllerBase
{
    private readonly ITechnicalAssetDiscoveryAdapter _discoveryAdapter;

    public TechnicalAssetsController(ITechnicalAssetDiscoveryAdapter discoveryAdapter)
    {
        _discoveryAdapter = discoveryAdapter;
    }

    /// <summary>
    /// Returns every technical asset (table or view) found within the configured
    /// discovery scope. Takes no schema name, table name or SQL fragment from the
    /// caller - the scope is entirely server-configured (DatasetDiscoveryOptions).
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<DiscoveredTechnicalAssetDto>>> GetDiscoveredAssets(CancellationToken cancellationToken)
    {
        var assets = await _discoveryAdapter.DiscoverAsync(cancellationToken);
        return Ok(assets);
    }
}
