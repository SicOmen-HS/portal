using Microsoft.Data.SqlClient;
using Portal.Api.Contracts;

namespace Portal.Api.Datasets;

/// <summary>
/// Reads fictional preview rows from a local SQL Server instance. Table and column
/// names always come from KnownDatasetsRegistry - never from the caller - and the
/// row count is always bound as a SQL parameter, never string-concatenated.
/// </summary>
public sealed class SqlServerDatasetSourceAdapter : IDatasetSourceAdapter
{
    private readonly IConfiguration _configuration;

    public SqlServerDatasetSourceAdapter(IConfiguration configuration)
    {
        // Deliberately does not read ConnectionStrings:Default here: this adapter is
        // constructor-injected into DatasetsController, which also serves the
        // SQL-free static metadata endpoint. Validating eagerly would make every
        // action on that controller require a configured connection string, even
        // GET /api/datasets/{id}. The check happens lazily below instead.
        _configuration = configuration;
    }

    public async Task<DatasetPreviewDto?> GetPreviewRowsAsync(string datasetId, int maxRows, CancellationToken cancellationToken)
    {
        var entry = KnownDatasetsRegistry.TryGet(datasetId);
        if (entry is null)
        {
            return null;
        }

        var connectionString = _configuration.GetConnectionString("Default") is { Length: > 0 } value
            ? value
            : throw new InvalidOperationException(
                "Local ConnectionStrings:Default is not configured. Set it with 'dotnet user-secrets' for local development.");

        // Table/column identifiers are hardcoded literals from the registry above -
        // T-SQL cannot parameterize identifiers, so they must never be built from
        // caller input. Only the row limit is a real, bound SQL parameter.
        var columnList = string.Join(", ", entry.PreviewColumns.Select(QuoteIdentifier));
        var sql = $"SELECT TOP (@maxRows) {columnList} FROM {entry.PreviewTableName};";

        await using var connection = new SqlConnection(connectionString);
        await connection.OpenAsync(cancellationToken);

        await using var command = new SqlCommand(sql, connection);
        command.Parameters.Add(new SqlParameter("@maxRows", System.Data.SqlDbType.Int) { Value = maxRows });

        await using var reader = await command.ExecuteReaderAsync(cancellationToken);

        var rows = new List<IReadOnlyList<string>>();
        while (await reader.ReadAsync(cancellationToken))
        {
            var row = new string[reader.FieldCount];
            for (var i = 0; i < reader.FieldCount; i++)
            {
                row[i] = reader.IsDBNull(i) ? string.Empty : reader.GetValue(i).ToString() ?? string.Empty;
            }

            rows.Add(row);
        }

        return new DatasetPreviewDto(datasetId, entry.PreviewColumns, rows);
    }

    private static string QuoteIdentifier(string identifier) => $"[{identifier.Replace("]", "]]")}]";
}
