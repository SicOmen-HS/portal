namespace Portal.Api.Datasets;

/// <summary>
/// Pure, database-free translation between DatasetDiscoveryOptions' friendly object
/// type names ("Table"/"View") and the values SQL Server's own
/// INFORMATION_SCHEMA.TABLES.TABLE_TYPE column actually uses ("BASE TABLE"/"VIEW").
/// Kept separate from SqlServerTechnicalAssetDiscoveryAdapter so the mapping and its
/// validation can be unit tested without a SQL Server connection.
/// </summary>
public static class DiscoveryObjectTypeMapper
{
    private static readonly IReadOnlyDictionary<string, string> FriendlyToSqlTableType =
        new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase)
        {
            ["Table"] = "BASE TABLE",
            ["View"] = "VIEW",
        };

    /// <summary>
    /// Resolves the configured friendly object type names to the TABLE_TYPE values
    /// used by INFORMATION_SCHEMA.TABLES. Throws for an empty list or an unrecognized
    /// name - a discovery scope with no valid object types is a configuration error,
    /// not a silent "discover nothing" state.
    /// </summary>
    public static IReadOnlyList<string> ResolveSqlTableTypes(IReadOnlyList<string> allowedObjectTypes)
    {
        if (allowedObjectTypes is not { Count: > 0 })
        {
            throw new InvalidOperationException(
                $"DatasetDiscovery:AllowedObjectTypes must list at least one of: {string.Join(", ", FriendlyToSqlTableType.Keys)}.");
        }

        var resolved = new List<string>(allowedObjectTypes.Count);
        foreach (var objectType in allowedObjectTypes)
        {
            if (!FriendlyToSqlTableType.TryGetValue(objectType, out var sqlTableType))
            {
                throw new InvalidOperationException(
                    $"Unrecognized DatasetDiscovery:AllowedObjectTypes value '{objectType}'. Recognized values: {string.Join(", ", FriendlyToSqlTableType.Keys)}.");
            }

            resolved.Add(sqlTableType);
        }

        return resolved;
    }

    /// <summary>
    /// Reverse mapping, from a raw INFORMATION_SCHEMA.TABLES.TABLE_TYPE value (already
    /// read from SQL Server's own catalog) back to the friendly object type name used
    /// in DiscoveredTechnicalAssetDto.
    /// </summary>
    public static string ToFriendlyObjectType(string sqlTableType) =>
        sqlTableType switch
        {
            "BASE TABLE" => "Table",
            "VIEW" => "View",
            _ => sqlTableType,
        };
}
