using Microsoft.AspNetCore.Diagnostics;
using Portal.Api.Datasets;

var builder = WebApplication.CreateBuilder(args);

const string LocalDevelopmentCorsPolicy = "LocalDevelopmentCors";

// Allowed origins are configuration-driven (see appsettings.json), never hardcoded
// and never a wildcard - local POC only needs the local Angular dev server origin.
var allowedOrigins = builder.Configuration.GetSection("AllowedOrigins").Get<string[]>() ?? [];

builder.Services.AddControllers();
builder.Services.AddCors(options =>
{
    options.AddPolicy(LocalDevelopmentCorsPolicy, policy =>
    {
        policy.WithOrigins(allowedOrigins)
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

builder.Services.AddSingleton<IDatasetSourceAdapter, SqlServerDatasetSourceAdapter>();

var app = builder.Build();

// Controlled, generic error handling: never expose stack traces, connection
// strings or server names to the client. Full details are logged server-side only.
app.UseExceptionHandler(errorApp =>
{
    errorApp.Run(async context =>
    {
        var feature = context.Features.Get<IExceptionHandlerFeature>();
        if (feature is not null)
        {
            var logger = context.RequestServices.GetRequiredService<ILogger<Program>>();
            logger.LogError(feature.Error, "Unhandled error while processing {Path}.", context.Request.Path);
        }

        context.Response.ContentType = "application/json";
        context.Response.StatusCode = StatusCodes.Status500InternalServerError;
        await context.Response.WriteAsJsonAsync(new
        {
            error = "Ett tekniskt fel uppstod. Kontrollera att den lokala SQL Server-datakällan är igång och att lokal konfiguration är korrekt."
        });
    });
});

app.UseCors(LocalDevelopmentCorsPolicy);

app.MapGet("/health", () => Results.Ok(new { status = "ok" }));

app.MapControllers();

app.Run();
