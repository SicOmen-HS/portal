# syntax=docker/dockerfile:1
#
# Container-builddefinition för Portal.Api (ADR-0007).
#
# Byggkontext: backend/Portal.Api/ (Portal.Api.csproj har inga
# ProjectReference till Portal.Api.Tests eller andra projekt, så den
# räcker som fristående byggkontext). Bygg t.ex. från repositoryts rot:
#
#   docker build -t portal-api:local backend/Portal.Api
#
# Imagen är miljöoberoende: inga secrets, inga connection strings och
# ingen miljöspecifik appsettings.*-fil byggs in. All miljöspecifik
# konfiguration tillförs externt vid körning via ASP.NET Core:s
# standardmekanismer (miljövariabler och/eller monterad konfiguration) -
# se README.md för det fullständiga runtimekontraktet.

# ---- Build- och publish-stage ---------------------------------------------
# Innehåller .NET SDK. Ingår inte i den slutliga imagen.
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Kopiera enbart projektfilen först så att `dotnet restore` cachas separat
# från källkodsändringar.
COPY Portal.Api.csproj ./
RUN dotnet restore "Portal.Api.csproj"

COPY . .
RUN dotnet publish "Portal.Api.csproj" \
    -c Release \
    -o /app/publish \
    --no-restore \
    /p:UseAppHost=false

# ---- Runtime-stage ----------------------------------------------------------
# Enbart ASP.NET Core-runtime - ingen SDK.
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final

# "app" är den icke-root-användare som redan finns i denna officiella
# runtime-image sedan .NET 8 - används i stället för root.
USER app
WORKDIR /app

# Generisk, containerintern HTTP-port. Detta är inte en Hosting Lab-specifik
# host-port - den faktiska portmappningen/reverse proxy-exponeringen ägs av
# Hosting Lab (ADR-0007).
ENV ASPNETCORE_HTTP_PORTS=8080
EXPOSE 8080

COPY --from=build /app/publish .

# Health-kontraktet mot containerruntimen är GET /health (se Program.cs).
# Den officiella aspnet-runtime-imagen innehåller varken curl eller wget,
# så inget Docker HEALTHCHECK läggs till här enbart för att tillfredsställa
# det - att lägga till ett verktyg enbart för healthchecken skulle vara en
# onödig runtime-dependency. Hosting Lab använder /health direkt från sin
# Compose-/reverse-proxy-/övervakningskonfiguration istället.

ENTRYPOINT ["dotnet", "Portal.Api.dll"]
