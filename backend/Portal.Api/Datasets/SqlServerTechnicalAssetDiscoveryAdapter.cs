using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Options;
using Portal.Api.Contracts;

namespace Portal.Api.Datasets;

/// <summary>
/// Reads SQL Server's own system metadata (INFORMATION_SCHEMA) for objects whose
/// schema matches the configured DatasetDiscoveryOptions.SchemaPattern. Every object
/// and column identifier used afterward comes from SQL Server's own catalog rows,
/// already matched against the configured scope - never from a caller. The schema
/// pattern itself is always a bound SQL parameter (a LIKE query value, not an
/// identifier), and INFORMATION_SCHEMA.COLUMNS is queried by schema/object name as
/// bound filter values rather than by building a per-object SQL statement, so this
/// adapter never constructs dynamic SQL text.
/// </summary>
public sealed class SqlServerTechnicalAssetDiscoveryAdapter : ITechnicalAssetDiscoveryAdapter
{
    private readonly IConfiguration _configuration;
    private readonly DatasetDiscoveryOptions _options;

    public SqlServerTechnicalAssetDiscoveryAdapter(IConfiguration configuration, IOptions<DatasetDiscoveryOptions> options)
    {
        // Deliberately does not validate configuration or open a connection here - same
        // lazy-validation principle already used by SqlServerDatasetSourceAdapter and
        // SqlServerDeclaredOriginAdapter. This adapter is constructor-injected into
        // TechnicalAssetsController; eager validation would fail application startup
        // even when discovery is never called.
        _configuration = configuration;
        _options = options.Value;
    }

    public async Task<IReadOnlyList<DiscoveredTechnicalAssetDto>> DiscoverAsync(CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(_options.SourceId))
        {
            throw new InvalidOperationException("DatasetDiscovery:SourceId is not configured.");
        }

        if (string.IsNullOrWhiteSpace(_options.SchemaPattern))
        {
            throw new InvalidOperationException("DatasetDiscovery:SchemaPattern is not configured.");
        }

        var allowedSqlTableTypes = DiscoveryObjectTypeMapper.ResolveSqlTableTypes(_options.AllowedObjectTypes);

        var connectionString = _configuration.GetConnectionString("Default") is { Length: > 0 } value
            ? value
            : throw new InvalidOperationException("ConnectionStrings:Default is not configured.");

        await using var connection = new SqlConnection(connectionString);
        await connection.OpenAsync(cancellationToken);

        var databaseName = await ReadCurrentDatabaseNameAsync(connection, cancellationToken);
        var objects = await DiscoverObjectsInScopeAsync(connection, _options.SchemaPattern, allowedSqlTableTypes, cancellationToken);

        var assets = new List<DiscoveredTechnicalAssetDto>(objects.Count);
        foreach (var (schemaName, objectName, sqlTableType) in objects)
        {
            var columns = await DiscoverColumnsAsync(connection, schemaName, objectName, cancellationToken);
            assets.Add(new DiscoveredTechnicalAssetDto(
                TechnicalId: TechnicalAssetIdentity.Build(_options.SourceId, databaseName, schemaName, objectName),
                SourceId: _options.SourceId,
                Database: databaseName,
                SchemaName: schemaName,
                ObjectName: objectName,
                ObjectType: DiscoveryObjectTypeMapper.ToFriendlyObjectType(sqlTableType),
                Columns: columns));
        }

        return assets;
    }

    /// <summary>
    /// Reads the connected database's own name from SQL Server, rather than requiring
    /// it in configuration - this avoids a configured value ever drifting out of sync
    /// with what the connection string actually points to.
    /// </summary>
    private static async Task<string> ReadCurrentDatabaseNameAsync(SqlConnection connection, CancellationToken cancellationToken)
    {
        await using var command = new SqlCommand("SELECT DB_NAME();", connection);
        var result = await command.ExecuteScalarAsync(cancellationToken);
        return result as string ?? string.Empty;
    }

    /// <summary>
    /// Finds objects whose schema matches the configured, parameterized LIKE pattern
    /// and whose type is one of the configured, allowed object types. The schema
    /// pattern and each table-type value are always bound query parameters - never
    /// concatenated into SQL text - so no per-object or per-schema string
    /// concatenation happens anywhere in this method. SQL text and parameters are
    /// built by DiscoveryObjectsQuery (a pure, database-free helper) so the schema
    /// pattern is provably bound unchanged - see DiscoveryObjectsQuery for how a
    /// literal underscore prefix (e.g. "im_") is expressed via SQL Server's own LIKE
    /// bracket-escape syntax ("im[_]%") rather than any escaping logic in this class.
    /// </summary>
    private static async Task<IReadOnlyList<(string SchemaName, string ObjectName, string SqlTableType)>> DiscoverObjectsInScopeAsync(
        SqlConnection connection,
        string schemaPattern,
        IReadOnlyList<string> allowedSqlTableTypes,
        CancellationToken cancellationToken)
    {
        var sql = DiscoveryObjectsQuery.BuildSql(allowedSqlTableTypes.Count);

        await using var command = new SqlCommand(sql, connection);
        command.Parameters.AddRange(DiscoveryObjectsQuery.BuildParameters(schemaPattern, allowedSqlTableTypes).ToArray());

        await using var reader = await command.ExecuteReaderAsync(cancellationToken);
        var objects = new List<(string SchemaName, string ObjectName, string SqlTableType)>();
        while (await reader.ReadAsync(cancellationToken))
        {
            objects.Add((reader.GetString(0), reader.GetString(1), reader.GetString(2)));
        }

        return objects;
    }

    /// <summary>
    /// Reads columns for one already-discovered object. schemaName/objectName are
    /// bound as ordinary filter VALUES against INFORMATION_SCHEMA.COLUMNS (a fixed,
    /// known system view) - not as identifiers in a FROM clause - so, unlike
    /// SqlServerDatasetSourceAdapter's preview query, no identifier quoting or dynamic
    /// SQL construction is needed here at all.
    /// </summary>
    private static async Task<IReadOnlyList<DiscoveredColumnDto>> DiscoverColumnsAsync(
        SqlConnection connection,
        string schemaName,
        string objectName,
        CancellationToken cancellationToken)
    {
        const string sql = """
            SELECT COLUMN_NAME, DATA_TYPE
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_SCHEMA = @schemaName AND TABLE_NAME = @objectName
            ORDER BY ORDINAL_POSITION;
            """;

        await using var command = new SqlCommand(sql, connection);
        command.Parameters.Add(new SqlParameter("@schemaName", System.Data.SqlDbType.NVarChar, 128) { Value = schemaName });
        command.Parameters.Add(new SqlParameter("@objectName", System.Data.SqlDbType.NVarChar, 128) { Value = objectName });

        await using var reader = await command.ExecuteReaderAsync(cancellationToken);
        var columns = new List<DiscoveredColumnDto>();
        while (await reader.ReadAsync(cancellationToken))
        {
            columns.Add(new DiscoveredColumnDto(reader.GetString(0), reader.GetString(1)));
        }

        return columns;
    }
}
