/*
    Local SQL Server POC for declared dataset origin metadata.

    Purpose:
    - Register one manually declared, immediate upstream source for a demo dataset.
    - Demonstrate a small isolated metadata registry in SQL Server.

    Limitations:
    - This is a local and temporary POC.
    - It is not full lineage.
    - It does not perform automatic metadata extraction.
    - It does not establish SQL Server as the portal's future metadata store.
    - PostgreSQL remains the intended application database for the portal.
*/

/* 1. Safety check */

IF DB_NAME() IN (N'master', N'model', N'msdb', N'tempdb')
BEGIN
    RAISERROR(
        N'Stop: select a local non-system POC database before running this script.',
        16,
        1
    );
    SET NOEXEC ON;
END
ELSE
BEGIN
    SELECT
        DB_NAME() AS current_database,
        N'OK - non-system database selected' AS safety_status;
END
GO

/* 2. Prerequisite check */

IF OBJECT_ID(N'demo_dw.weather_warning_event_source', N'U') IS NULL
BEGIN
    RAISERROR(
        N'Stop: required source object demo_dw.weather_warning_event_source does not exist. Run the weather warning DW-DM-IM POC script first.',
        16,
        1
    );
    SET NOEXEC ON;
END
ELSE
BEGIN
    SELECT
        N'OK - required source object exists' AS prerequisite_status;
END
GO

/* 3. Create metadata schema */

IF SCHEMA_ID(N'demo_metadata') IS NULL
BEGIN
    EXEC(N'CREATE SCHEMA demo_metadata');
END;
GO

/* 4. Recreate declared origin table */

DROP TABLE IF EXISTS demo_metadata.declared_dataset_origins;
GO

CREATE TABLE demo_metadata.declared_dataset_origins
(
    dataset_id nvarchar(150) NOT NULL,
    upstream_schema_name sysname NOT NULL,
    upstream_object_name sysname NOT NULL,

    CONSTRAINT PK_declared_dataset_origins
        PRIMARY KEY
        (
            dataset_id,
            upstream_schema_name,
            upstream_object_name
        )
);
GO

/* 5. Register declared immediate origin */

INSERT INTO demo_metadata.declared_dataset_origins
(
    dataset_id,
    upstream_schema_name,
    upstream_object_name
)
VALUES
(
    N'dataset-weather-warning-events-demo',
    N'demo_dw',
    N'weather_warning_event_source_demo_dw'
);
GO

/* 6. Verify registered relation
   Expected result: exactly one row.
*/

SELECT
    dataset_id,
    upstream_schema_name,
    upstream_object_name
FROM demo_metadata.declared_dataset_origins
WHERE dataset_id = N'dataset-weather-warning-events-demo';
GO

/* 7. Verify that the declared upstream object exists
   Expected upstream_object_type: USER_TABLE.
*/

SELECT
    d.dataset_id,
    d.upstream_schema_name,
    d.upstream_object_name,
    o.type_desc AS upstream_object_type
FROM demo_metadata.declared_dataset_origins AS d
INNER JOIN sys.schemas AS s
    ON s.name = d.upstream_schema_name
INNER JOIN sys.objects AS o
    ON o.schema_id = s.schema_id
   AND o.name = d.upstream_object_name
   AND o.type = N'U'
WHERE d.dataset_id = N'dataset-weather-warning-events-demo';
GO

/* 8. Verify that no duplicate relations exist
   Expected result: no rows.
*/

SELECT
    dataset_id,
    upstream_schema_name,
    upstream_object_name,
    COUNT(*) AS relation_count
FROM demo_metadata.declared_dataset_origins
GROUP BY
    dataset_id,
    upstream_schema_name,
    upstream_object_name
HAVING COUNT(*) > 1;
GO

/* 9. Verify relation count
   Expected origin_relation_count: 1.
*/

SELECT
    COUNT(*) AS origin_relation_count
FROM demo_metadata.declared_dataset_origins
WHERE dataset_id = N'dataset-weather-warning-events-demo';
GO

/* 10. Reset NOEXEC */

SET NOEXEC OFF;
GO