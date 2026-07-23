using Microsoft.Data.SqlClient;
using Portal.Api.Contracts;

namespace Portal.Api.Datasets;

/// <summary>
/// Reads declared, immediate dataset origins from the local
/// demo_metadata.declared_dataset_origins table. The table name is a hardcoded,
/// server-owned literal - only dataset_id is ever a caller-supplied SQL parameter.
/// This adapter never analyzes SQL definitions or system lineage; it only returns
/// the manually registered rows for the given dataset-id.
/// </summary>
public sealed class SqlServerDeclaredOriginAdapter : IDeclaredDatasetOriginAdapter
{
    private const string DeclaredOriginsTableName = "demo_metadata.declared_dataset_origins";

    private readonly IConfiguration _configuration;

    public SqlServerDeclaredOriginAdapter(IConfiguration configuration)
    {
        // Deliberately does not read ConnectionStrings:Default here - this adapter is
        // constructor-injected into DatasetsController alongside IDatasetSourceAdapter,
        // which also serves the SQL-free static metadata endpoint. Validating eagerly
        // would make every action on that controller require a configured connection
        // string. The check happens lazily below instead, same principle as
        // SqlServerDatasetSourceAdapter.
        _configuration = configuration;
    }

    public async Task<IReadOnlyList<DeclaredDatasetOriginDto>> GetDeclaredOriginsAsync(string datasetId, CancellationToken cancellationToken)
    {
        var connectionString = _configuration.GetConnectionString("Default") is { Length: > 0 } value
            ? value
            : throw new InvalidOperationException(
                "Local ConnectionStrings:Default is not configured. Set it with 'dotnet user-secrets' for local development.");

        const string sql = $"""
            SELECT
                dataset_id,
                upstream_schema_name,
                upstream_object_name
            FROM {DeclaredOriginsTableName}
            WHERE dataset_id = @datasetId
            ORDER BY
                upstream_schema_name,
                upstream_object_name;
            """;

        await using var connection = new SqlConnection(connectionString);
        await connection.OpenAsync(cancellationToken);

        await using var command = new SqlCommand(sql, connection);
        command.Parameters.Add(new SqlParameter("@datasetId", System.Data.SqlDbType.NVarChar, 150) { Value = datasetId });

        await using var reader = await command.ExecuteReaderAsync(cancellationToken);

        var origins = new List<DeclaredDatasetOriginDto>();
        while (await reader.ReadAsync(cancellationToken))
        {
            origins.Add(new DeclaredDatasetOriginDto(
                DatasetId: reader.GetString(0),
                UpstreamSchemaName: reader.GetString(1),
                UpstreamObjectName: reader.GetString(2)));
        }

        return origins;
    }
}
