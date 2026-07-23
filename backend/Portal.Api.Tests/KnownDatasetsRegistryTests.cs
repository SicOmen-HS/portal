using Portal.Api.Datasets;

namespace Portal.Api.Tests;

public class KnownDatasetsRegistryTests
{
    [Theory]
    [InlineData("dataset-sales-transactions-demo")]
    [InlineData("dataset-weather-warning-events-demo")]
    public void TryGet_ReturnsEntry_ForKnownDatasetId(string datasetId)
    {
        var entry = KnownDatasetsRegistry.TryGet(datasetId);

        Assert.NotNull(entry);
        Assert.Equal(datasetId, entry!.Metadata.Id);
        Assert.NotEmpty(entry.PreviewTableName);
        Assert.NotEmpty(entry.PreviewColumns);
    }

    [Fact]
    public void TryGet_ReturnsNull_ForUnknownDatasetId()
    {
        var entry = KnownDatasetsRegistry.TryGet("dataset-does-not-exist");

        Assert.Null(entry);
    }

    [Theory]
    [InlineData("dataset-sales-transactions-demo")]
    [InlineData("dataset-weather-warning-events-demo")]
    public void TryGet_MetadataFieldCount_MatchesPreviewColumnCount(string datasetId)
    {
        var entry = KnownDatasetsRegistry.TryGet(datasetId);

        Assert.NotNull(entry);
        Assert.Equal(entry!.Metadata.Fields.Count, entry.PreviewColumns.Count);
    }

    [Theory]
    [InlineData("dataset-sales-transactions-demo")]
    [InlineData("dataset-weather-warning-events-demo")]
    public void TryGet_PreviewColumns_MatchFieldNamesInOrder(string datasetId)
    {
        var entry = KnownDatasetsRegistry.TryGet(datasetId);

        Assert.NotNull(entry);
        var fieldNames = entry!.Metadata.Fields.Select(field => field.FieldName).ToArray();
        Assert.Equal(fieldNames, entry.PreviewColumns);
    }

    [Fact]
    public void PreviewTableName_IsUniquePerDataset()
    {
        var salesEntry = KnownDatasetsRegistry.TryGet("dataset-sales-transactions-demo");
        var weatherEntry = KnownDatasetsRegistry.TryGet("dataset-weather-warning-events-demo");

        Assert.NotNull(salesEntry);
        Assert.NotNull(weatherEntry);
        Assert.NotEqual(salesEntry!.PreviewTableName, weatherEntry!.PreviewTableName);
    }
}
