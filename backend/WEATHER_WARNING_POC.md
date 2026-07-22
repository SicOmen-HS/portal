# Vädervarnings-POC: lokal SQL Server DW till DM till IM (AB-029)

## Vad detta är

Detta är en liten, fristående SQL Server-POC som visar ett förenklat
dataflöde: **förenklat DW-underlag → Kimball-liknande DM →
konsumtionsanpassat IM**, med helt syntetisk vädervarningsdata. Den är
**inte** kopplad till [`Portal.Api`](Portal.Api/README.md) eller till någon
backend- eller frontendkod, och innehåller ingen API-endpoint, ingen
previewregistrering och ingen portalmetadata. Se work item
[`../docs/work-items/AB-029.md`](../docs/work-items/AB-029.md) för bakgrund
och avgränsning.

## Skriptet

[`database/sqlserver-weather-warning-dw-dm-im-poc.sql`](database/sqlserver-weather-warning-dw-dm-im-poc.sql)
skapar och fyller följande objekt, i tre tydligt urskiljbara lager:

* `demo_dw.weather_warning_event_source` — förenklat, plattat DW-underlag.
* `demo_dm.dim_event`, `demo_dm.dim_warning_level`, `demo_dm.dim_warning_area`,
  `demo_dm.dim_affected_area`, `demo_dm.fact_weather_warning_event` —
  Kimball-liknande DM-dimensioner och faktatabell, samt
  `demo_dm.weather_warning_events` — en läsbar DM-vy som döljer tekniska
  surrogat- och främmande nycklar. Faktatabellens och DM-vyns kornighet är
  **en varning och ett påverkat område per rad**.
* `demo_im.weather_warning_overview` — konsumtionsanpassad IM-vy byggd
  ovanpå DM-vyn, som aggregerar till **en rad per varning**.

All seed-data är helt syntetisk (fiktiva platshållarnamn, inspirerad av
offentligt kända vädervarningsbegrepp) — ingen produktionsdata, inga
personuppgifter och inga interna namn.

## Köra skriptet lokalt

1. Öppna SSMS och anslut till din lokala SQL Server.
2. Välj eller skapa själv en lokal POC-databas som aktiv databas innan du
   kör skriptet — det väljer eller skapar ingen databas åt dig och
   hårdkodar inget databasnamn. Du kan använda samma lokala POC-databas som
   redan används av `Portal.Api`:s preview-POC (se
   [`Portal.Api/README.md`](Portal.Api/README.md#skapa-den-lokala-poc-databasen-portalpoclocal))
   eller en annan lokal databas du själv väljer.
3. Öppna `database/sqlserver-weather-warning-dw-dm-im-poc.sql` i SSMS och
   kör hela skriptet.

Skriptet vägrar köra mot systemdatabaserna `master`, `model`, `msdb` och
`tempdb` (samma skyddsprincip som
[`database/sqlserver-preview-poc.sql`](database/sqlserver-preview-poc.sql)).
Det är återkörbart: det tar bort och återskapar samtliga egna vyer och
tabeller (`DROP VIEW IF EXISTS`/`DROP TABLE IF EXISTS` + `CREATE`) varje
gång det körs, så det är säkert att köra om.

## Verifiera

Skriptets sista del innehåller dokumenterade verifieringsfrågor med
förväntat resultat: radantal per lager, dimensionernas radantal, varje
varnings antal påverkade områden, samt kontroller för dubbletter och för
att DM- och IM-lagren stämmer överens.

## Avgränsning

* Detta är en POC, inte en beslutad produktionsarkitektur.
* SQL-beroendena mellan `demo_dw`, `demo_dm` och `demo_im` är fasta
  SQL-joins/vyer i detta skript — de motsvarar inte full eller automatiskt
  upptäckt lineage, och de utgör ingen portalmetadata (inget "Bygger på"
  eller "Används i").
* Ingen backend- eller frontendkod är kopplad till detta skript.
