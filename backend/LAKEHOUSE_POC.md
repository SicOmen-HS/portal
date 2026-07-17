# Lakehouse-labb (Node.js/TypeScript/Trino)

## Vad detta är

Detta är ett **tillfälligt tekniskt labb** och en smal **dataåtkomst-POC** —
inte portalens ordinarie backend, och inte en verifiering av metadata eller
lineage. Klassificeringen och den fullständiga bedömningen finns i
[`../docs/analysis/AN-010_klassificera_lakehouse_poc_backendansvar.md`](../docs/analysis/AN-010_klassificera_lakehouse_poc_backendansvar.md).

Portalens dokumenterade ordinarie backendriktning är Angular → .NET Web API
→ integrationsadaptrar. Den avgränsade POC som dokumenteras i
[`Portal.Api/README.md`](Portal.Api/README.md) (AB-027) illustrerar denna
riktning. Detta labb existerar vid sidan av den riktningen, inte i stället
för den.

## Vad labbet faktiskt bevisar

En Node.js HTTP-server kan koppla upp mot Trino och köra en enda, fast
fråga mot en fiktiv Iceberg-testtabell. Det bevisar dataåtkomst till
lakehouse-lagret — det bevisar **inte** metadataåtkomst (frågan är
hårdkodad, inget schema läses dynamiskt) och **inte** lineage eller
relationer mellan datatillgångar.

## Viktig gräns

Frontend får aldrig ansluta direkt till Trino, Lakekeeper, S3 eller interna
databaser. Backend äger dessa integrationer.

## Köra labbet lokalt

```powershell
cd backend
npm install
npm run check
$env:PORT=4000; npm run dev
```

Testa:

```powershell
curl http://localhost:4000/health
curl http://localhost:4000/api/lakehouse/hello
```

Endpointen `GET /api/lakehouse/hello` kör den fasta frågan (verifierad mot
`backend/src/server.ts`):

```sql
SELECT id, name
FROM lakekeeper.labtest.hello_iceberg
ORDER BY id
```

## Trino-anslutning (miljövariabler)

`backend/src/trino.ts` läser följande miljövariabler, med de angivna
värdena som kodens egna, ofarliga lokala standardvärden om inget annat
sätts:

| Miljövariabel | Standardvärde i koden |
| --- | --- |
| `TRINO_HOST` | `localhost` |
| `TRINO_PORT` | `9999` |
| `TRINO_CATALOG` | `lakekeeper` |
| `TRINO_SCHEMA` | `labtest` |
| `TRINO_USER` | `portal_lab` |

Ska labbet köras mot en Trino-instans på en annan värd, sätt miljövariablerna
till din egen miljös värden, t.ex.:

```powershell
$env:TRINO_HOST="<trino-host>"
$env:TRINO_PORT="<trino-port>"
```

## Starta och stoppa den lokala labbmiljön

Den fullständiga lakehouse-stacken (Trino, Lakekeeper, Iceberg, objektlagring)
måste vara igång innan `/api/lakehouse/hello` kan svara. Exakt startskript
beror på var du har satt upp din egen labbmiljö, till exempel:

```text
<path-to-lakehouse-lab>/start-lakehouse-lab.sh
```

Stoppa den efter test för att spara resurser:

```text
<path-to-lakehouse-lab>/stop-lakehouse-lab.sh
```

Se [`../docs/LAB_LAKEHOUSE_PLAN.md`](../docs/LAB_LAKEHOUSE_PLAN.md) och
[`../docs/PORTAL_LAKEHOUSE_INTEGRATION.md`](../docs/PORTAL_LAKEHOUSE_INTEGRATION.md)
för den bredare labbplanen (oförändrade av detta arbete).

## Kända avgränsningar

* Endast en fast, hårdkodad fråga mot en fiktiv testtabell — ingen
  generell SQL-frågemotor, inget stöd för klientstyrda frågor.
* Ingen metadataåtkomst och ingen lineage-verifiering.
* Ingen autentisering eller auktorisering.
* Ingen automatiserad test finns i detta labb.
* Se AN-010 för en fullständig klassificering och rekommenderad uppföljning.
