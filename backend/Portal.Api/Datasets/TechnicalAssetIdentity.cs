namespace Portal.Api.Datasets;

/// <summary>
/// Builds the source-qualified technical identity for a discovered asset: source +
/// database + schema + object. This is an internal backend correlation key - not a
/// portal-facing dataset-id, not a replacement for the existing, unrelated dataset-id
/// values in KnownDatasetsRegistry, and not a new information-model concept. It exists
/// so a future, separate matching step (e.g. against an OpenMetadata FQN, out of scope
/// for this AB) has a deterministic key to match against without redesigning
/// discovery later. No fuzzy or display-name matching is involved.
///
/// Each segment is percent-encoded individually (via Uri.EscapeDataString, existing
/// .NET functionality - no custom escaping logic) before the segments are joined with
/// "/". SourceId is free configuration text and SQL Server identifiers can in
/// principle contain unusual characters, including "/" itself; encoding every segment
/// first guarantees a literal "/" inside a segment (e.g. an unusual SourceId) can never
/// be mistaken for the separator between segments, so two different
/// (source, database, schema, object) tuples never collide onto the same TechnicalId.
/// TechnicalId must be treated as an opaque string by callers, not parsed.
/// </summary>
public static class TechnicalAssetIdentity
{
    public static string Build(string sourceId, string database, string schemaName, string objectName) =>
        string.Join(
            "/",
            Uri.EscapeDataString(sourceId),
            Uri.EscapeDataString(database),
            Uri.EscapeDataString(schemaName),
            Uri.EscapeDataString(objectName));
}
