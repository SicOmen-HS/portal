using Microsoft.AspNetCore.Mvc;
using Portal.Api.Contracts;
using Portal.Api.Controllers;
using Portal.Api.Datasets;

namespace Portal.Api.Tests;

/// <summary>
/// Database-free tests for the discovery scope's object-type mapping, technical
/// identity building, query construction and the controller's pass-through behavior
/// (AB-032). The actual SQL Server read in
/// SqlServerTechnicalAssetDiscoveryAdapter.DiscoverAsync is not unit tested here -
/// same, already-documented limitation as
/// SqlServerDatasetSourceAdapter/SqlServerDeclaredOriginAdapter.
/// </summary>
public class TechnicalAssetDiscoveryTests
{
    [Theory]
    [InlineData("Table", "BASE TABLE")]
    [InlineData("View", "VIEW")]
    [InlineData("table", "BASE TABLE")]
    [InlineData("VIEW", "VIEW")]
    public void ResolveSqlTableTypes_MapsFriendlyNames_ToSqlTableTypeValues(string configuredValue, string expectedSqlTableType)
    {
        var resolved = DiscoveryObjectTypeMapper.ResolveSqlTableTypes([configuredValue]);

        Assert.Single(resolved);
        Assert.Equal(expectedSqlTableType, resolved[0]);
    }

    [Fact]
    public void ResolveSqlTableTypes_ResolvesBothConfiguredTypes_InOrder()
    {
        var resolved = DiscoveryObjectTypeMapper.ResolveSqlTableTypes(["Table", "View"]);

        Assert.Equal(["BASE TABLE", "VIEW"], resolved);
    }

    [Fact]
    public void ResolveSqlTableTypes_Throws_ForEmptyList()
    {
        Assert.Throws<InvalidOperationException>(() => DiscoveryObjectTypeMapper.ResolveSqlTableTypes([]));
    }

    [Fact]
    public void ResolveSqlTableTypes_Throws_ForUnrecognizedObjectType()
    {
        Assert.Throws<InvalidOperationException>(() => DiscoveryObjectTypeMapper.ResolveSqlTableTypes(["StoredProcedure"]));
    }

    [Theory]
    [InlineData("BASE TABLE", "Table")]
    [InlineData("VIEW", "View")]
    public void ToFriendlyObjectType_MapsSqlTableTypeValues_ToFriendlyNames(string sqlTableType, string expectedFriendlyType)
    {
        Assert.Equal(expectedFriendlyType, DiscoveryObjectTypeMapper.ToFriendlyObjectType(sqlTableType));
    }

    [Fact]
    public void ToFriendlyObjectType_PassesThroughUnknownValue_Unchanged()
    {
        Assert.Equal("SYSTEM VIEW", DiscoveryObjectTypeMapper.ToFriendlyObjectType("SYSTEM VIEW"));
    }

    [Fact]
    public void Build_ProducesSourceQualifiedTechnicalIdentity()
    {
        var technicalId = TechnicalAssetIdentity.Build("local-sql-server-poc", "PortalPocLocal", "demo_dm", "weather_warning_events");

        Assert.Equal("local-sql-server-poc/PortalPocLocal/demo_dm/weather_warning_events", technicalId);
    }

    [Fact]
    public void Build_DistinguishesObjectsWithSameSchemaAndObjectName_FromDifferentSources()
    {
        var first = TechnicalAssetIdentity.Build("sqlserver-a", "database-a", "im_x", "fact_y");
        var second = TechnicalAssetIdentity.Build("sqlserver-b", "database-b", "im_x", "fact_y");

        Assert.NotEqual(first, second);
    }

    [Fact]
    public void Build_EscapesALiteralSlashInsideASegment_SoItCannotActAsASeparator()
    {
        var technicalId = TechnicalAssetIdentity.Build("a/b", "c", "schema", "object");

        Assert.Equal("a%2Fb/c/schema/object", technicalId);
    }

    [Fact]
    public void Build_PreventsSegmentBoundaryCollisions_WhenASlashMovesBetweenSegments()
    {
        // "a/b" + "c" and "a" + "b/c" would collide onto the same raw "a/b/c/..." string
        // without per-segment escaping - this is exactly the ambiguity encoding removes.
        var slashInFirstSegment = TechnicalAssetIdentity.Build("a/b", "c", "schema", "object");
        var slashInSecondSegment = TechnicalAssetIdentity.Build("a", "b/c", "schema", "object");
        var noSlashAtAll = TechnicalAssetIdentity.Build("a", "b", "schema", "object");

        Assert.NotEqual(slashInFirstSegment, slashInSecondSegment);
        Assert.NotEqual(slashInFirstSegment, noSlashAtAll);
        Assert.NotEqual(slashInSecondSegment, noSlashAtAll);
    }

    [Fact]
    public void Build_EscapesALiteralPercentCharacter_Deterministically()
    {
        var technicalId = TechnicalAssetIdentity.Build("100%", "db", "schema", "object");

        Assert.Equal("100%25/db/schema/object", technicalId);
    }

    [Theory]
    [InlineData("demo%")]
    [InlineData("im[_]%")]
    [InlineData("im_%")]
    public void BuildParameters_BindsSchemaPatternValueUnchanged(string configuredSchemaPattern)
    {
        var parameters = DiscoveryObjectsQuery.BuildParameters(configuredSchemaPattern, ["BASE TABLE"]);

        var schemaPatternParameter = Assert.Single(parameters, p => p.ParameterName == "@schemaPattern");
        Assert.Equal(configuredSchemaPattern, schemaPatternParameter.Value);
    }

    [Fact]
    public void BuildParameters_BindsOneParameterPerAllowedTableType_InOrder()
    {
        var parameters = DiscoveryObjectsQuery.BuildParameters("demo%", ["BASE TABLE", "VIEW"]);

        Assert.Equal(3, parameters.Count);
        Assert.Equal("BASE TABLE", parameters.Single(p => p.ParameterName == "@tableType0").Value);
        Assert.Equal("VIEW", parameters.Single(p => p.ParameterName == "@tableType1").Value);
    }

    [Fact]
    public void BuildSql_UsesLikeOperator_WithNoEscapeClause()
    {
        // No ESCAPE clause is ever added: a literal underscore prefix (e.g. "im_")
        // relies entirely on SQL Server's own LIKE bracket-escape syntax in the
        // configured pattern itself (e.g. "im[_]%"), not on any escaping logic here.
        var sql = DiscoveryObjectsQuery.BuildSql(allowedTableTypeCount: 1);

        Assert.Contains("TABLE_SCHEMA LIKE @schemaPattern", sql);
        Assert.DoesNotContain("ESCAPE", sql, StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public void BuildSql_GeneratesOneTableTypePlaceholder_PerAllowedTableTypeCount()
    {
        var sql = DiscoveryObjectsQuery.BuildSql(allowedTableTypeCount: 2);

        Assert.Contains("@tableType0", sql);
        Assert.Contains("@tableType1", sql);
    }

    private sealed class FakeTechnicalAssetDiscoveryAdapter : ITechnicalAssetDiscoveryAdapter
    {
        private readonly IReadOnlyList<DiscoveredTechnicalAssetDto> _assets;

        public FakeTechnicalAssetDiscoveryAdapter(IReadOnlyList<DiscoveredTechnicalAssetDto> assets)
        {
            _assets = assets;
        }

        public Task<IReadOnlyList<DiscoveredTechnicalAssetDto>> DiscoverAsync(CancellationToken cancellationToken) =>
            Task.FromResult(_assets);
    }

    [Fact]
    public async Task GetDiscoveredAssets_ReturnsAssets_FromDiscoveryAdapter()
    {
        var expected = new[]
        {
            new DiscoveredTechnicalAssetDto(
                "local-sql-server-poc/PortalPocLocal/demo_dm/weather_warning_events",
                "local-sql-server-poc",
                "PortalPocLocal",
                "demo_dm",
                "weather_warning_events",
                "View",
                [new DiscoveredColumnDto("warning_id", "int")]),
            new DiscoveredTechnicalAssetDto(
                "local-sql-server-poc/PortalPocLocal/demo_dm/dim_event",
                "local-sql-server-poc",
                "PortalPocLocal",
                "demo_dm",
                "dim_event",
                "Table",
                [new DiscoveredColumnDto("event_key", "int")]),
        };
        var controller = new TechnicalAssetsController(new FakeTechnicalAssetDiscoveryAdapter(expected));

        var result = await controller.GetDiscoveredAssets(CancellationToken.None);

        var ok = Assert.IsType<OkObjectResult>(result.Result);
        var assets = Assert.IsAssignableFrom<IReadOnlyList<DiscoveredTechnicalAssetDto>>(ok.Value);
        Assert.Equal(expected, assets);
    }

    [Fact]
    public async Task GetDiscoveredAssets_ReturnsEmptyList_WhenNoAssetsInScope()
    {
        var controller = new TechnicalAssetsController(new FakeTechnicalAssetDiscoveryAdapter([]));

        var result = await controller.GetDiscoveredAssets(CancellationToken.None);

        var ok = Assert.IsType<OkObjectResult>(result.Result);
        var assets = Assert.IsAssignableFrom<IReadOnlyList<DiscoveredTechnicalAssetDto>>(ok.Value);
        Assert.Empty(assets);
    }
}
