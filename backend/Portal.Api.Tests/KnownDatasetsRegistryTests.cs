using Portal.Api.Datasets;

namespace Portal.Api.Tests;

public class KnownDatasetsRegistryTests
{
    [Fact]
    public void TryGet_ReturnsEntry_ForKnownDatasetId()
    {
        var entry = KnownDatasetsRegistry.TryGet("dataset-sales-transactions-demo");

        Assert.NotNull(entry);
        Assert.Equal("dataset-sales-transactions-demo", entry!.Metadata.Id);
        Assert.NotEmpty(entry.PreviewTableName);
        Assert.NotEmpty(entry.PreviewColumns);
    }

    [Fact]
    public void TryGet_ReturnsNull_ForUnknownDatasetId()
    {
        var entry = KnownDatasetsRegistry.TryGet("dataset-does-not-exist");

        Assert.Null(entry);
    }

    [Fact]
    public void TryGet_MetadataFieldCount_MatchesPreviewColumnCount()
    {
        var entry = KnownDatasetsRegistry.TryGet("dataset-sales-transactions-demo");

        Assert.NotNull(entry);
        Assert.Equal(entry!.Metadata.Fields.Count, entry.PreviewColumns.Count);
    }

    [Fact]
    public void TryGet_PreviewColumns_MatchFieldNamesInOrder()
    {
        var entry = KnownDatasetsRegistry.TryGet("dataset-sales-transactions-demo");

        Assert.NotNull(entry);
        var fieldNames = entry!.Metadata.Fields.Select(field => field.FieldName).ToArray();
        Assert.Equal(fieldNames, entry.PreviewColumns);
    }
}
