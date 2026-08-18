using Microsoft.Data.SqlClient;

namespace Portal.Api.Datasets;

/// <summary>
/// Pure, database-free construction of the SQL text and parameters used by
/// SqlServerTechnicalAssetDiscoveryAdapter to find objects within the configured
/// discovery scope. Kept separate from the adapter so it can be unit tested without a
/// SQL Server connection, and so it is provable that DatasetDiscoveryOptions.SchemaPattern
/// is bound to the LIKE operator exactly as configured - no character substitution and
/// no ESCAPE clause is added by this code. A literal underscore in a schema prefix
/// (e.g. matching schemas that start with "im_") relies entirely on SQL Server's own
/// LIKE bracket-escape syntax in the configured pattern itself (e.g. "im[_]%"), not on
/// any escaping logic here.
/// </summary>
public static class DiscoveryObjectsQuery
{
    public static string BuildSql(int allowedTableTypeCount)
    {
        var typeParameterNames = Enumerable.Range(0, allowedTableTypeCount).Select(index => $"@tableType{index}");
        return $"""
            SELECT TABLE_SCHEMA, TABLE_NAME, TABLE_TYPE
            FROM INFORMATION_SCHEMA.TABLES
            WHERE TABLE_SCHEMA LIKE @schemaPattern
              AND TABLE_TYPE IN ({string.Join(", ", typeParameterNames)})
            ORDER BY TABLE_SCHEMA, TABLE_NAME;
            """;
    }

    public static IReadOnlyList<SqlParameter> BuildParameters(string schemaPattern, IReadOnlyList<string> allowedSqlTableTypes)
    {
        var parameters = new List<SqlParameter>
        {
            new SqlParameter("@schemaPattern", System.Data.SqlDbType.NVarChar, 128) { Value = schemaPattern },
        };

        for (var index = 0; index < allowedSqlTableTypes.Count; index++)
        {
            parameters.Add(new SqlParameter($"@tableType{index}", System.Data.SqlDbType.NVarChar, 64) { Value = allowedSqlTableTypes[index] });
        }

        return parameters;
    }
}
