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

            ["dataset-weather-warning-events-demo"] = new KnownDatasetEntry(
                Metadata: new DatasetDetailDto(
                    Id: "dataset-weather-warning-events-demo",
                    Name: "Vädervarningshändelser",
                    Description: "Fiktiv datamängd med vädervarningshändelser och berörda områden, framtagen för att demonstrera portalens previewfunktion.",
                    DataDomain: "Väder och klimat",
                    Owner: "Exempelteam Väderdata",
                    Steward: "Exempelförvaltare Väderdata",
                    Classification: "internal",
                    UpdateFrequency: "Vid behov i POC",
                    Fields:
                    [
                        new DatasetFieldDto("warning_id", "heltal", "Unikt tekniskt id för vädervarningen", "1001"),
                        new DatasetFieldDto("event_name", "text", "Namn på händelsetypen som varningen avser", "Thunderstorm"),
                        new DatasetFieldDto("warning_level_name", "text", "Varningsnivåns namn", "Yellow"),
                        new DatasetFieldDto("warning_area_name", "text", "Namn på det övergripande varningsområdet", "Example Region South"),
                        new DatasetFieldDto("affected_area_name", "text", "Namn på ett specifikt påverkat område inom varningsområdet", "Example Area A"),
                        new DatasetFieldDto("published_at", "datum och tid", "Tidpunkt då varningen publicerades", "2026-04-01T08:15:00"),
                    ]),
                PreviewTableName: "demo_dm.weather_warning_events",
                PreviewColumns:
                [
                    "warning_id",
                    "event_name",
                    "warning_level_name",
                    "warning_area_name",
                    "affected_area_name",
                    "published_at",
                ]),
        };

    public static KnownDatasetEntry? TryGet(string datasetId) =>
        Entries.TryGetValue(datasetId, out var entry) ? entry : null;
}
