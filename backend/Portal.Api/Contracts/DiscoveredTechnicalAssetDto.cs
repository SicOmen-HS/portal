namespace Portal.Api.Contracts;

/// <summary>
/// A technical asset candidate found by SqlServerTechnicalAssetDiscoveryAdapter within
/// a configured SQL Server discovery scope (see DatasetDiscoveryOptions). Deliberately
/// not DatasetDetailDto and not itself a Dataset or InformationMart:
/// Dataset.classification is mandatory (ADR-0006), and discovery has no basis for
/// assigning a classification, owner, display name or description. Whether and how a
/// discovered candidate later becomes a published Dataset is a separate, later
/// decision - see docs/work-items/AB-032.md.
/// </summary>
public sealed record DiscoveredTechnicalAssetDto(
    string TechnicalId,
    string SourceId,
    string Database,
    string SchemaName,
    string ObjectName,
    string ObjectType,
    IReadOnlyList<DiscoveredColumnDto> Columns);

/// <summary>
/// A single column's technical name and SQL Server data type, read directly from
/// INFORMATION_SCHEMA.COLUMNS. No business description, example value or
/// classification - those require a later, separate metadata source (e.g. a future
/// OpenMetadata enrichment step), not this discovery adapter.
/// </summary>
public sealed record DiscoveredColumnDto(
    string ColumnName,
    string DataType);
