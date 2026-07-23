using Microsoft.AspNetCore.Mvc;
using Portal.Api.Contracts;
using Portal.Api.Controllers;
using Portal.Api.Datasets;

namespace Portal.Api.Tests;

/// <summary>
/// Database-free controller tests using hand-written fakes (no mocking framework),
/// covering GetDeclaredOrigins' known/unknown-dataset gate and pass-through of the
/// declared-origin adapter's result. GetPreview/GetDataset are unchanged and remain
/// covered by KnownDatasetsRegistryTests.
/// </summary>
public class DatasetsControllerTests
{
    private sealed class FakeDatasetSourceAdapter : IDatasetSourceAdapter
    {
        public Task<DatasetPreviewDto?> GetPreviewRowsAsync(string datasetId, int maxRows, CancellationToken cancellationToken) =>
            Task.FromResult<DatasetPreviewDto?>(null);
    }

    private sealed class FakeDeclaredDatasetOriginAdapter : IDeclaredDatasetOriginAdapter
    {
        private readonly IReadOnlyList<DeclaredDatasetOriginDto> _origins;

        public FakeDeclaredDatasetOriginAdapter(IReadOnlyList<DeclaredDatasetOriginDto> origins)
        {
            _origins = origins;
        }

        public bool WasCalled { get; private set; }

        public Task<IReadOnlyList<DeclaredDatasetOriginDto>> GetDeclaredOriginsAsync(string datasetId, CancellationToken cancellationToken)
        {
            WasCalled = true;
            return Task.FromResult(_origins);
        }
    }

    private static DatasetsController CreateController(FakeDeclaredDatasetOriginAdapter originAdapter) =>
        new(new FakeDatasetSourceAdapter(), originAdapter);

    [Fact]
    public async Task GetDeclaredOrigins_ReturnsNotFound_ForUnknownDatasetId_WithoutCallingAdapter()
    {
        var originAdapter = new FakeDeclaredDatasetOriginAdapter([]);
        var controller = CreateController(originAdapter);

        var result = await controller.GetDeclaredOrigins("dataset-does-not-exist", CancellationToken.None);

        Assert.IsType<NotFoundResult>(result.Result);
        Assert.False(originAdapter.WasCalled);
    }

    [Fact]
    public async Task GetDeclaredOrigins_ReturnsEmptyList_ForKnownDatasetWithoutDeclaredOrigins()
    {
        var originAdapter = new FakeDeclaredDatasetOriginAdapter([]);
        var controller = CreateController(originAdapter);

        var result = await controller.GetDeclaredOrigins("dataset-sales-transactions-demo", CancellationToken.None);

        var ok = Assert.IsType<OkObjectResult>(result.Result);
        var origins = Assert.IsAssignableFrom<IReadOnlyList<DeclaredDatasetOriginDto>>(ok.Value);
        Assert.Empty(origins);
        Assert.True(originAdapter.WasCalled);
    }

    [Fact]
    public async Task GetDeclaredOrigins_ReturnsAllDeclaredOrigins_ForKnownDatasetWithMultipleOrigins()
    {
        var expected = new[]
        {
            new DeclaredDatasetOriginDto("dataset-weather-warning-events-demo", "demo_dw", "another_source_table"),
            new DeclaredDatasetOriginDto("dataset-weather-warning-events-demo", "demo_dw", "weather_warning_event_source"),
        };
        var originAdapter = new FakeDeclaredDatasetOriginAdapter(expected);
        var controller = CreateController(originAdapter);

        var result = await controller.GetDeclaredOrigins("dataset-weather-warning-events-demo", CancellationToken.None);

        var ok = Assert.IsType<OkObjectResult>(result.Result);
        var origins = Assert.IsAssignableFrom<IReadOnlyList<DeclaredDatasetOriginDto>>(ok.Value);
        Assert.Equal(2, origins.Count);
        Assert.Equal(expected, origins);
    }
}
