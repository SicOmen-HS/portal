# Portal Lab Lakehouse Plan

## Purpose

This document describes a lab plan for recreating a company-like data platform environment for the portal project.

The goal is to support development and learning without connecting directly to real company systems.

## Target outcome

The lab should eventually support this flow:

    Portal frontend
      -> Portal backend/API
          -> Trino
              -> Iceberg tables
                  -> Lakekeeper REST catalog
                      -> MinIO/S3-compatible object storage
                          -> Parquet data files

Additional integrations:

    Portal backend/API
      -> MS SQL lab
      -> OpenMetadata lab
      -> Keycloak/OIDC lab

## Non-goals

The lab must not:

- connect to real company production systems
- use real company credentials
- expose internal data publicly
- replace company infrastructure
- act as production
- write to real company data sources
- assume lab configuration is production-ready

## Core principles

### 1. Mock and lab first

Start with local/lab-only services and sample data.

### 2. Build in layers

Do not introduce all components at once.

Recommended order:

1. MinIO
2. Lakekeeper
3. Trino
4. Iceberg table creation/read test
5. OpenMetadata
6. Portal backend integration
7. Keycloak/OIDC

### 3. No auth first, auth later

Initial lakehouse testing should avoid Keycloak until the data path works.

Reason:

If table access fails, we first want to isolate storage/catalog/query problems before adding auth complexity.

### 4. Same patterns, not same secrets

The lab should resemble company architecture patterns:

- query engine
- metadata catalog
- object storage
- REST catalog
- backend integration
- OIDC later

But it must not use company secrets or real sensitive data.

## Planned components

### MinIO

Purpose:

S3-compatible object storage for Parquet and Iceberg table files.

Lab role:

- stores warehouse files
- simulates object storage
- provides local bucket for Iceberg data

Possible service name:

    lakehouse-minio

Possible bucket:

    lakehouse

### Lakekeeper

Purpose:

Iceberg REST catalog.

Lab role:

- manages Iceberg namespaces and table metadata
- connects Trino to Iceberg tables
- uses PostgreSQL metadata database if required

Possible service name:

    lakehouse-lakekeeper

### Trino

Purpose:

SQL query engine.

Lab role:

- queries Iceberg tables
- later used by Portal backend
- later visible to OpenMetadata

Possible service name:

    lakehouse-trino

First success criteria:

    SELECT * FROM iceberg.<schema>.<table>;

### PostgreSQL metadata database

Purpose:

Metadata database for Lakekeeper and possibly other services.

Lab role:

- stores service metadata only
- not application business data

Possible service name:

    lakehouse-postgres

### OpenMetadata

Purpose:

Metadata discovery and catalog UI/API.

Lab role:

- catalog Trino and/or databases
- test metadata workflows for Portal integration
- use sample metadata only

Possible service name:

    openmetadata-lab

### Keycloak

Purpose:

OIDC identity provider.

Lab role:

- simulate company auth model
- provide test users/groups
- later secure Portal backend/frontend
- possibly integrate with OpenMetadata where useful

Possible service name:

    keycloak-lab

## Proposed directory structure

Hosting lab infrastructure:

    /srv/lab/stacks/lakehouse-lab/
      compose.yaml
      .env.example
      README.md

    /srv/lab/stacks/openmetadata-lab/
      compose.yaml
      .env.example
      README.md

    /srv/lab/stacks/keycloak-lab/
      compose.yaml
      .env.example
      README.md

Portal development:

    /srv/dev/portal/
      docs/LAB_LAKEHOUSE_PLAN.md

## Phase 1: Minimal lakehouse

Goal:

Create and query one Iceberg table through Trino.

Components:

- MinIO
- Lakekeeper
- Trino
- PostgreSQL metadata DB if required

Out of scope:

- Keycloak
- OpenMetadata
- Portal backend
- real company data
- public exposure

Success criteria:

- all containers start
- Trino can connect to Iceberg catalog
- test namespace can be created
- test Iceberg table can be created
- sample rows can be inserted or loaded
- `SELECT` returns expected rows
- data files are visible in MinIO

Example target:

    CREATE SCHEMA iceberg.lab;
    CREATE TABLE iceberg.lab.sample_people (
      id integer,
      name varchar
    );

    INSERT INTO iceberg.lab.sample_people VALUES
      (1, 'Alice'),
      (2, 'Bob');

    SELECT * FROM iceberg.lab.sample_people;

## Phase 2: Parquet files

Goal:

Test working with Parquet-backed data.

Options:

- write Parquet files through Iceberg table operations
- import sample Parquet files into object storage
- register or convert them into Iceberg-managed tables if appropriate

Success criteria:

- Parquet files exist in object storage
- Trino can query data through Iceberg table abstraction

## Phase 3: OpenMetadata lab

Goal:

Add metadata discovery on top of Trino and/or databases.

Components:

- OpenMetadata
- required metadata database/search dependencies
- connector to Trino or sample databases

Success criteria:

- OpenMetadata UI/API starts
- Trino service is registered
- sample schema/table metadata appears
- no real company credentials are used

## Phase 4: Portal backend integration

Goal:

Portal backend talks to lab services instead of frontend talking directly to data systems.

Pattern:

    frontend -> backend -> Trino/OpenMetadata/MS SQL

Backend responsibilities:

- hide credentials
- validate requests
- centralize authorization
- normalize errors
- expose portal-specific API contracts

Success criteria:

- frontend calls backend only
- backend can query sample data through Trino
- backend can read metadata from OpenMetadata
- configuration is environment-based

## Phase 5: Keycloak

Goal:

Simulate authentication and authorization.

Components:

- Keycloak
- test realm
- test users
- test groups/roles
- Portal frontend/backend OIDC configuration

Success criteria:

- user can log in
- backend can validate token
- roles/groups can influence portal behavior
- no company identity provider is used

## Risks

### Resource usage

Trino, OpenMetadata and Keycloak can use significant RAM.

Mitigation:

- start components one phase at a time
- monitor RAM through health check
- move to stronger iMac if needed
- avoid running every stack all the time

### Alert fatigue

Avoid OK-notifications.

Only alert on:

- service down
- failed backup
- critical RAM/disk usage
- failed scheduled job

### Production confusion

Clearly label all lab endpoints and data.

Never reuse production credentials.

## Home lab versus VPS

Home lab:

- LAN-only
- local hostnames
- test data
- MinIO acceptable
- lower security exposure

VPS/staging:

- real DNS/TLS
- stricter firewall
- external monitoring
- off-host backup
- stronger secret handling
- clear separation from production

## First implementation task

Create:

    /srv/lab/stacks/lakehouse-lab

Initial components:

- MinIO
- Lakekeeper
- Trino
- required metadata DB

First measurable goal:

    Trino can query one Iceberg table stored in MinIO and cataloged through Lakekeeper.

## Open questions

- Which Lakekeeper version should be used?
- Which Trino version should be used?
- Does Lakekeeper require PostgreSQL in the selected setup?
- Should MinIO be shared with other lab stacks later or remain lakehouse-only?
- Should Trino be exposed through Caddy on LAN?
- What sample data should represent the company use case without leaking sensitive data?
