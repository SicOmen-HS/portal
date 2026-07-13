using Portal.Api.Contracts;

namespace Portal.Api.Datasets;

/// <summary>
/// A known, allowed dataset: its static metadata plus the single, server-owned
/// SQL Server table/view and column list SqlServerDatasetSourceAdapter may read
/// for its preview rows. Table/column names here are the only ones ever used in
/// a SQL statement - they are never accepted from a caller.
/// </summary>
public sealed record KnownDatasetEntry(
    DatasetDetailDto Metadata,
    string PreviewTableName,
    IReadOnlyList<string> PreviewColumns);

/// <summary>
/// Single, server-owned source of truth for which dataset-id values this POC
/// recognizes, their static metadata, and the SQL Server object each one may be
/// previewed from. Both DatasetsController (metadata) and
/// SqlServerDatasetSourceAdapter (preview rows) read this same registry - there is
/// deliberately no second, parallel allowlist anywhere in the backend.
/// </summary>
public static class KnownDatasetsRegistry
{
    private static readonly IReadOnlyDictionary<string, KnownDatasetEntry> Entries =
        new Dictionary<string, KnownDatasetEntry>
        {
            ["dataset-sales-transactions-demo"] = new KnownDatasetEntry(
                Metadata: new DatasetDetailDto(
                    Id: "dataset-sales-transactions-demo",
                    Name: "Exempel Försäljningstransaktioner",
                    Description: "Fiktiv datamängd med transaktionsdata på övergripande nivå, avsedd för rapportering.",
                    DataDomain: "Försäljning",
                    Owner: "Exempelteam Försäljningsanalys",
                    Steward: "Exempelteam Dataplattform",
                    Classification: "internal",
                    UpdateFrequency: "Dagligen (exempel)",
                    Fields:
                    [
                        new DatasetFieldDto("transaktionsmanad", "månad", "Månad då transaktionen bokfördes", "2026-01"),
                        new DatasetFieldDto("kundsegment", "text", "Fiktivt segment för kundgrupp", "Segment A"),
                        new DatasetFieldDto("produktkategori", "text", "Övergripande produktgrupp", "Kategori 1"),
                        new DatasetFieldDto("antal_transaktioner", "heltal", "Aggregerat antal transaktioner", "1280"),
                        new DatasetFieldDto("beloppsintervall", "text", "Belopp uttryckt som intervall", "100k–500k"),
                    ]),
                PreviewTableName: "dbo.SalesTransactionsDemoPreview",
                PreviewColumns:
                [
                    "transaktionsmanad",
                    "kundsegment",
                    "produktkategori",
                    "antal_transaktioner",
                    "beloppsintervall",
                ]),
        };

    public static KnownDatasetEntry? TryGet(string datasetId) =>
        Entries.TryGetValue(datasetId, out var entry) ? entry : null;
}
