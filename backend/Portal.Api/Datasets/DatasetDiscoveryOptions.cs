namespace Portal.Api.Datasets;

/// <summary>
/// Configuration-driven discovery scope for SqlServerTechnicalAssetDiscoveryAdapter:
/// which SQL Server schema pattern and object types the adapter is allowed to read.
/// Deliberately never lists individual tables, views or dataset-ids - a new object
/// inside this already-configured scope is found automatically by the adapter, not
/// registered here. There is deliberately no separate Database/catalog field here:
/// the database scope is implicit in whichever database ConnectionStrings:Default
/// points to (read back via SELECT DB_NAME() in the adapter) - discovery cannot
/// search across multiple databases. SourceId and SchemaPattern are environment-
/// specific values and are kept out of the environment-neutral base appsettings.json
/// - see backend/Portal.Api/appsettings.Development.example.json and
/// backend/Portal.Api/README.md. See docs/work-items/AB-032.md.
/// </summary>
public sealed class DatasetDiscoveryOptions
{
    public const string SectionName = "DatasetDiscovery";

    /// <summary>
    /// Free-text identifier for the configured technical source (e.g. a specific local
    /// SQL Server POC instance). Used only to source-qualify the technical identity
    /// built for each discovered asset (see TechnicalAssetIdentity) - not a new
    /// business concept and not persisted anywhere else. No existing technical
    /// source/system identifier was found elsewhere in the backend to reuse for this
    /// (DatasetDetailDto has no source field).
    /// </summary>
    public string SourceId { get; set; } = string.Empty;

    /// <summary>
    /// SQL Server LIKE pattern (e.g. "demo%"), matched against
    /// INFORMATION_SCHEMA.TABLES.TABLE_SCHEMA. Always used as a bound query parameter
    /// in the adapter, never concatenated into SQL text - see DiscoveryObjectsQuery.
    /// In T-SQL LIKE, "_" matches any single character, so it is NOT a literal
    /// underscore: the pattern "im_%" also matches e.g. "imXfoo", not just schemas
    /// literally starting with "im_". To match schemas that literally start with
    /// "im_", use SQL Server's own LIKE bracket-escape syntax and configure the
    /// pattern as "im[_]%" - "[_]" matches exactly one literal underscore character.
    /// No separate escape-character setting exists or is needed for this.
    /// </summary>
    public string SchemaPattern { get; set; } = string.Empty;

    /// <summary>
    /// Friendly object type names allowed within the scope. Recognized values:
    /// "Table", "View" (see DiscoveryObjectTypeMapper). Both are allowed by default -
    /// this AB does not build in a "views only" rule.
    /// </summary>
    public IReadOnlyList<string> AllowedObjectTypes { get; set; } = ["Table", "View"];
}
