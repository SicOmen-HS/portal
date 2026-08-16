using Portal.Api.Contracts;

namespace Portal.Api.Datasets;

/// <summary>
/// Discovers technical assets (tables and/or views) within a configured SQL Server
/// discovery scope (see DatasetDiscoveryOptions) - never a per-object allowlist. This
/// is a separate responsibility from IDatasetSourceAdapter (preview rows for a single,
/// already-known dataset-id) and IDeclaredDatasetOriginAdapter (declared origins for a
/// single, already-known dataset-id); it does not read or write either of those.
/// </summary>
public interface ITechnicalAssetDiscoveryAdapter
{
    /// <summary>
    /// Returns every technical asset found within the configured scope. Implementations
    /// must never accept a schema name, table name or SQL fragment from a caller - the
    /// scope is entirely server-configured.
    /// </summary>
    Task<IReadOnlyList<DiscoveredTechnicalAssetDto>> DiscoverAsync(CancellationToken cancellationToken);
}
