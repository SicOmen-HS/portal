# Portal lakehouse integration

## Purpose

Define how the portal should integrate with the local lakehouse lab.

Current goal:

    Portal frontend
    -> backend/API
    -> Trino
    -> Lakekeeper REST catalog
    -> Iceberg tables
    -> SeaweedFS/S3

## Boundary

The frontend must not connect directly to Trino, Lakekeeper, S3, OpenMetadata or internal databases.

The frontend should call a backend/API owned by the portal.

The backend/API is responsible for:

    authentication and authorization
    query validation
    hiding infrastructure details
    translating portal concepts to lakehouse queries
    returning safe API responses to the frontend

## Current lab endpoint

Trino is available only when the optional lakehouse stack is running.

Local lab Trino endpoint:

    http://lab-ubuntu:9999
    or from the lab host:
    http://localhost:9999

Catalog:

    lakekeeper

Current verified test table:

    lakekeeper.labtest.hello_iceberg

## First backend proof of concept

Create a minimal backend endpoint that can:

    connect to Trino
    run a fixed safe query
    return JSON
    expose no raw SQL input from the frontend

Example safe query:

    SELECT id, name
    FROM lakekeeper.labtest.hello_iceberg
    ORDER BY id

Example API route:

    GET /api/lakehouse/hello

Expected JSON:

    [
      { "id": 1, "name": "hello" },
      { "id": 2, "name": "lakehouse" }
    ]

## Development rule

Start with a fixed query.

Do not add user-provided SQL.

Do not add authentication complexity yet.

Do not add OpenMetadata yet.

Do not add Keycloak yet.

## Later steps

1. Add minimal backend project.
2. Add Trino client configuration through environment variables.
3. Add one fixed query endpoint.
4. Add frontend mock integration.
5. Add OpenMetadata metadata lookup.
6. Add Keycloak/OIDC.
7. Replace lab-only endpoints with company environment configuration.

## Environment variables draft

    TRINO_HOST=localhost
    TRINO_PORT=9999
    TRINO_CATALOG=lakekeeper
    TRINO_SCHEMA=labtest
    TRINO_USER=portal_lab

## Related lab commands

Start lakehouse:

    /srv/lab/scripts/start-lakehouse-lab.sh

Stop lakehouse:

    /srv/lab/scripts/stop-lakehouse-lab.sh
