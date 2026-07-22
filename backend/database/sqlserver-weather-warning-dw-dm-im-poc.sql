/*
Local SQL Server POC: simplified DW -> DM -> IM
================================================

Purpose:
- Demonstrate a simplified local data flow from a flattened DW source table,
  through a small Kimball-like DM model, to a consumption-oriented IM view.
- Provide a repeatable setup that another developer can run in a local POC database.

Important:
- All seed data in this script is synthetic demo data.
- The data is inspired by publicly available weather-warning concepts.
- It does not contain copied production records or internal technical metadata.
- This script is not a production architecture and does not implement lineage.
*/

SET NOCOUNT ON;
GO

/* 1. Safety check */

IF DB_NAME() IN (N'master', N'model', N'msdb', N'tempdb')
BEGIN
    RAISERROR(N'Stop: select a local non-system POC database before running this script.', 16, 1);
    SET NOEXEC ON;
END
ELSE
BEGIN
    SELECT
        DB_NAME() AS current_database,
        N'OK - non-system database selected' AS safety_status;
END
GO

/* 2. Drop POC views in dependency order */

DROP VIEW IF EXISTS demo_im.weather_warning_overview;
DROP VIEW IF EXISTS demo_dm.weather_warning_events;
GO

/* 3. Drop POC tables in dependency order */

DROP TABLE IF EXISTS demo_dm.fact_weather_warning_event;
DROP TABLE IF EXISTS demo_dm.dim_affected_area;
DROP TABLE IF EXISTS demo_dm.dim_warning_area;
DROP TABLE IF EXISTS demo_dm.dim_warning_level;
DROP TABLE IF EXISTS demo_dm.dim_event;
DROP TABLE IF EXISTS demo_dw.weather_warning_event_source;
GO

/* 4. Create schemas when missing */

IF SCHEMA_ID(N'demo_dw') IS NULL
    EXEC(N'CREATE SCHEMA demo_dw');

IF SCHEMA_ID(N'demo_dm') IS NULL
    EXEC(N'CREATE SCHEMA demo_dm');

IF SCHEMA_ID(N'demo_im') IS NULL
    EXEC(N'CREATE SCHEMA demo_im');
GO

/* 5. Create simplified DW source table */

CREATE TABLE demo_dw.weather_warning_event_source
(
    warning_id            int            NOT NULL,
    warning_area_id       int            NOT NULL,
    warning_area_name     nvarchar(200)  NOT NULL,
    event_code            varchar(50)    NOT NULL,
    event_name            nvarchar(100)  NOT NULL,
    affected_area_id      int            NOT NULL,
    affected_area_name    nvarchar(100)  NOT NULL,
    warning_level_code    varchar(50)    NOT NULL,
    warning_level_name    nvarchar(100)  NOT NULL,
    created_at            datetime2(3)   NOT NULL,
    published_at          datetime2(3)   NOT NULL,
    approximate_start_at  datetime2(3)   NOT NULL,

    CONSTRAINT PK_demo_dw_weather_warning_event_source
        PRIMARY KEY (warning_id, affected_area_id)
);
GO

/* 6. Insert synthetic DW seed data */

INSERT INTO demo_dw.weather_warning_event_source
(
    warning_id,
    warning_area_id,
    warning_area_name,
    event_code,
    event_name,
    affected_area_id,
    affected_area_name,
    warning_level_code,
    warning_level_name,
    created_at,
    published_at,
    approximate_start_at
)
VALUES
(
    1001, 501, N'Example Region South',
    'THUNDER', N'Thunderstorm',
    11, N'Example Area A',
    'YELLOW', N'Yellow',
    '2026-04-01T08:00:00.000',
    '2026-04-01T08:15:00.000',
    '2026-04-02T12:00:00.000'
),
(
    1001, 501, N'Example Region South',
    'THUNDER', N'Thunderstorm',
    12, N'Example Area B',
    'YELLOW', N'Yellow',
    '2026-04-01T08:00:00.000',
    '2026-04-01T08:15:00.000',
    '2026-04-02T12:00:00.000'
),
(
    1001, 501, N'Example Region South',
    'THUNDER', N'Thunderstorm',
    13, N'Example Area C',
    'YELLOW', N'Yellow',
    '2026-04-01T08:00:00.000',
    '2026-04-01T08:15:00.000',
    '2026-04-02T12:00:00.000'
),
(
    1002, 502, N'Example Coastal Waters',
    'WIND_SEA', N'Offshore wind',
    21, N'Example Sea Zone',
    'YELLOW', N'Yellow',
    '2026-04-03T09:30:00.000',
    '2026-04-03T09:45:00.000',
    '2026-04-03T18:00:00.000'
),
(
    1003, 503, N'Example Region East',
    'WATER_SHORTAGE', N'Risk of water shortage',
    31, N'Example Area D',
    'MESSAGE', N'Message',
    '2026-03-20T10:00:00.000',
    '2026-04-04T07:00:00.000',
    '2026-03-21T00:00:00.000'
),
(
    1003, 503, N'Example Region East',
    'WATER_SHORTAGE', N'Risk of water shortage',
    32, N'Example Area E',
    'MESSAGE', N'Message',
    '2026-03-20T10:00:00.000',
    '2026-04-04T07:00:00.000',
    '2026-03-21T00:00:00.000'
),
(
    1004, 504, N'Example Region North',
    'SNOWFALL', N'Heavy snowfall',
    41, N'Example Area F',
    'ORANGE', N'Orange',
    '2026-04-05T06:00:00.000',
    '2026-04-05T06:20:00.000',
    '2026-04-06T04:00:00.000'
),
(
    1004, 504, N'Example Region North',
    'SNOWFALL', N'Heavy snowfall',
    42, N'Example Area G',
    'ORANGE', N'Orange',
    '2026-04-05T06:00:00.000',
    '2026-04-05T06:20:00.000',
    '2026-04-06T04:00:00.000'
);
GO

/* 7. Create and load DM dimensions */

CREATE TABLE demo_dm.dim_event
(
    event_key   int IDENTITY(1,1) NOT NULL,
    event_code  varchar(50)       NOT NULL,
    event_name  nvarchar(100)     NOT NULL,

    CONSTRAINT PK_demo_dm_dim_event
        PRIMARY KEY (event_key),

    CONSTRAINT UQ_demo_dm_dim_event_code
        UNIQUE (event_code)
);

CREATE TABLE demo_dm.dim_warning_level
(
    warning_level_key   int IDENTITY(1,1) NOT NULL,
    warning_level_code  varchar(50)       NOT NULL,
    warning_level_name  nvarchar(100)     NOT NULL,

    CONSTRAINT PK_demo_dm_dim_warning_level
        PRIMARY KEY (warning_level_key),

    CONSTRAINT UQ_demo_dm_dim_warning_level_code
        UNIQUE (warning_level_code)
);

CREATE TABLE demo_dm.dim_warning_area
(
    warning_area_key   int IDENTITY(1,1) NOT NULL,
    warning_area_id    int               NOT NULL,
    warning_area_name  nvarchar(200)     NOT NULL,

    CONSTRAINT PK_demo_dm_dim_warning_area
        PRIMARY KEY (warning_area_key),

    CONSTRAINT UQ_demo_dm_dim_warning_area_id
        UNIQUE (warning_area_id)
);

CREATE TABLE demo_dm.dim_affected_area
(
    affected_area_key   int IDENTITY(1,1) NOT NULL,
    affected_area_id    int               NOT NULL,
    affected_area_name  nvarchar(100)     NOT NULL,

    CONSTRAINT PK_demo_dm_dim_affected_area
        PRIMARY KEY (affected_area_key),

    CONSTRAINT UQ_demo_dm_dim_affected_area_id
        UNIQUE (affected_area_id)
);
GO

INSERT INTO demo_dm.dim_event
(
    event_code,
    event_name
)
SELECT DISTINCT
    event_code,
    event_name
FROM demo_dw.weather_warning_event_source;

INSERT INTO demo_dm.dim_warning_level
(
    warning_level_code,
    warning_level_name
)
SELECT DISTINCT
    warning_level_code,
    warning_level_name
FROM demo_dw.weather_warning_event_source;

INSERT INTO demo_dm.dim_warning_area
(
    warning_area_id,
    warning_area_name
)
SELECT DISTINCT
    warning_area_id,
    warning_area_name
FROM demo_dw.weather_warning_event_source;

INSERT INTO demo_dm.dim_affected_area
(
    affected_area_id,
    affected_area_name
)
SELECT DISTINCT
    affected_area_id,
    affected_area_name
FROM demo_dw.weather_warning_event_source;
GO

/* 8. Create and load DM fact table
   Grain: one warning and one affected area per fact row.
*/

CREATE TABLE demo_dm.fact_weather_warning_event
(
    weather_warning_event_key  int IDENTITY(1,1) NOT NULL,
    warning_id                 int               NOT NULL,
    event_key                  int               NOT NULL,
    warning_level_key          int               NOT NULL,
    warning_area_key           int               NOT NULL,
    affected_area_key          int               NOT NULL,
    created_at                 datetime2(3)      NOT NULL,
    published_at               datetime2(3)      NOT NULL,
    approximate_start_at       datetime2(3)      NOT NULL,

    CONSTRAINT PK_demo_dm_fact_weather_warning_event
        PRIMARY KEY (weather_warning_event_key),

    CONSTRAINT UQ_demo_dm_fact_warning_affected_area
        UNIQUE (warning_id, affected_area_key),

    CONSTRAINT FK_demo_dm_fact_event
        FOREIGN KEY (event_key)
        REFERENCES demo_dm.dim_event (event_key),

    CONSTRAINT FK_demo_dm_fact_warning_level
        FOREIGN KEY (warning_level_key)
        REFERENCES demo_dm.dim_warning_level (warning_level_key),

    CONSTRAINT FK_demo_dm_fact_warning_area
        FOREIGN KEY (warning_area_key)
        REFERENCES demo_dm.dim_warning_area (warning_area_key),

    CONSTRAINT FK_demo_dm_fact_affected_area
        FOREIGN KEY (affected_area_key)
        REFERENCES demo_dm.dim_affected_area (affected_area_key)
);
GO

INSERT INTO demo_dm.fact_weather_warning_event
(
    warning_id,
    event_key,
    warning_level_key,
    warning_area_key,
    affected_area_key,
    created_at,
    published_at,
    approximate_start_at
)
SELECT
    source.warning_id,
    event.event_key,
    warning_level.warning_level_key,
    warning_area.warning_area_key,
    affected_area.affected_area_key,
    source.created_at,
    source.published_at,
    source.approximate_start_at
FROM demo_dw.weather_warning_event_source AS source
JOIN demo_dm.dim_event AS event
    ON event.event_code = source.event_code
JOIN demo_dm.dim_warning_level AS warning_level
    ON warning_level.warning_level_code = source.warning_level_code
JOIN demo_dm.dim_warning_area AS warning_area
    ON warning_area.warning_area_id = source.warning_area_id
JOIN demo_dm.dim_affected_area AS affected_area
    ON affected_area.affected_area_id = source.affected_area_id;
GO

/* 9. Create readable DM view
   The view keeps the fact grain and hides surrogate and foreign keys.
*/

CREATE VIEW demo_dm.weather_warning_events
AS
SELECT
    fact.warning_id,
    event.event_code,
    event.event_name,
    warning_level.warning_level_code,
    warning_level.warning_level_name,
    warning_area.warning_area_id,
    warning_area.warning_area_name,
    affected_area.affected_area_id,
    affected_area.affected_area_name,
    fact.created_at,
    fact.published_at,
    fact.approximate_start_at
FROM demo_dm.fact_weather_warning_event AS fact
JOIN demo_dm.dim_event AS event
    ON event.event_key = fact.event_key
JOIN demo_dm.dim_warning_level AS warning_level
    ON warning_level.warning_level_key = fact.warning_level_key
JOIN demo_dm.dim_warning_area AS warning_area
    ON warning_area.warning_area_key = fact.warning_area_key
JOIN demo_dm.dim_affected_area AS affected_area
    ON affected_area.affected_area_key = fact.affected_area_key;
GO

/* 10. Create consumption-oriented IM view
   The view returns one row per warning and aggregates affected areas.
*/

CREATE VIEW demo_im.weather_warning_overview
AS
SELECT
    warning_id,
    event_name,
    warning_level_name,
    warning_area_name,
    COUNT(*) AS affected_area_count,
    STRING_AGG(
        CONVERT(nvarchar(max), affected_area_name),
        N', '
    ) WITHIN GROUP (
        ORDER BY affected_area_name
    ) AS affected_areas,
    published_at,
    approximate_start_at
FROM demo_dm.weather_warning_events
GROUP BY
    warning_id,
    event_name,
    warning_level_name,
    warning_area_name,
    published_at,
    approximate_start_at;
GO

/* 11. Verification queries */

/* Expected:
   dw_row_count      = 8
   fact_row_count    = 8
   dm_view_row_count = 8
   im_view_row_count = 4
*/
SELECT
    (SELECT COUNT(*) FROM demo_dw.weather_warning_event_source) AS dw_row_count,
    (SELECT COUNT(*) FROM demo_dm.fact_weather_warning_event) AS fact_row_count,
    (SELECT COUNT(*) FROM demo_dm.weather_warning_events) AS dm_view_row_count,
    (SELECT COUNT(*) FROM demo_im.weather_warning_overview) AS im_view_row_count;

/* Expected:
   dim_event         = 4
   dim_warning_level = 3
   dim_warning_area  = 4
   dim_affected_area = 8
*/
SELECT 'dim_event' AS object_name, COUNT(*) AS row_count
FROM demo_dm.dim_event

UNION ALL

SELECT 'dim_warning_level', COUNT(*)
FROM demo_dm.dim_warning_level

UNION ALL

SELECT 'dim_warning_area', COUNT(*)
FROM demo_dm.dim_warning_area

UNION ALL

SELECT 'dim_affected_area', COUNT(*)
FROM demo_dm.dim_affected_area;

/* Expected warning grain:
   warning 1001 = 3 affected areas
   warning 1002 = 1 affected area
   warning 1003 = 2 affected areas
   warning 1004 = 2 affected areas
*/
SELECT
    warning_id,
    COUNT(*) AS affected_area_count
FROM demo_dm.weather_warning_events
GROUP BY warning_id
ORDER BY warning_id;

/* Expected: no rows. */
SELECT
    warning_id,
    affected_area_id,
    COUNT(*) AS duplicate_count
FROM demo_dm.weather_warning_events
GROUP BY
    warning_id,
    affected_area_id
HAVING COUNT(*) > 1;

/* Expected: no rows. */
SELECT
    dm.warning_id,
    COUNT(*) AS dm_rows,
    MAX(im.affected_area_count) AS im_affected_area_count
FROM demo_dm.weather_warning_events AS dm
JOIN demo_im.weather_warning_overview AS im
    ON im.warning_id = dm.warning_id
GROUP BY
    dm.warning_id
HAVING COUNT(*) <> MAX(im.affected_area_count);

/* Inspect readable DM rows. */
SELECT *
FROM demo_dm.weather_warning_events
ORDER BY
    warning_id,
    affected_area_id;

/* Inspect consumption-oriented IM rows. */
SELECT *
FROM demo_im.weather_warning_overview
ORDER BY warning_id;
GO

SET NOEXEC OFF;
GO
