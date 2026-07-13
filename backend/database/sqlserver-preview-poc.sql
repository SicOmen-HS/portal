-- Fictional, local-only proof-of-concept schema and seed data for the SQL Server
-- preview POC (AB-027). Every value below is entirely fictional and generic.
--
-- This script contains no server name, no connection string, no login, no
-- password and no production data. It does not select or create a database -
-- before running it, first select or create your own local development
-- database in SQL Server Management Studio (see backend/README.md). The guard
-- below refuses to run against a system database, but it cannot know or
-- assume the name of your local database - that choice is always yours.
--
-- The script is safe to re-run: it drops and recreates the single preview
-- table so the local POC can always be reset to a known, fictional state.

-- Safety guard: never run this script against a system database. This does
-- not hardcode or assume any particular local database name - it only
-- refuses the four fixed SQL Server system database names.
IF DB_NAME() IN ('master', 'model', 'msdb', 'tempdb')
BEGIN
    RAISERROR('This script must not run against a system database (master/model/msdb/tempdb). In SQL Server Management Studio, select or create your own local development database first, then run this script against it.', 16, 1);
    SET NOEXEC ON;
END
GO

IF OBJECT_ID('dbo.SalesTransactionsDemoPreview', 'U') IS NOT NULL
    DROP TABLE dbo.SalesTransactionsDemoPreview;
GO

CREATE TABLE dbo.SalesTransactionsDemoPreview
(
    transaktionsmanad   NVARCHAR(7)  NOT NULL,
    kundsegment         NVARCHAR(50) NOT NULL,
    produktkategori     NVARCHAR(50) NOT NULL,
    antal_transaktioner INT          NOT NULL,
    beloppsintervall    NVARCHAR(20) NOT NULL
);
GO

INSERT INTO dbo.SalesTransactionsDemoPreview
    (transaktionsmanad, kundsegment, produktkategori, antal_transaktioner, beloppsintervall)
VALUES
    ('2026-01', 'Segment A', 'Kategori 1', 1280, '100k-500k'),
    ('2026-01', 'Segment B', 'Kategori 2',  640, '0-100k'),
    ('2026-02', 'Segment A', 'Kategori 2',  980, '100k-500k'),
    ('2026-02', 'Segment C', 'Kategori 1',  410, '0-100k'),
    ('2026-03', 'Segment B', 'Kategori 3', 1755, '500k-1M');
GO

-- Reset NOEXEC so the rest of your SSMS query window behaves normally
-- afterwards, whether the guard above triggered or not.
SET NOEXEC OFF;
GO
