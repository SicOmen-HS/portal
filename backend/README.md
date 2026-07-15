# Portal backend POC

Minimal backend proof of concept for portal-to-lakehouse integration.

Current endpoint:

    GET /api/lakehouse/hello

Current behavior:

    Returns fixed JSON matching the verified lab Iceberg table.

Important boundary:

    The frontend must not connect directly to Trino, Lakekeeper, S3 or internal databases.
    The backend owns those integrations.

Run locally:

    cd backend
    npm install
    npm run check
    PORT=4000 npm run dev

Test:

    curl http://localhost:4000/health
    curl http://localhost:4000/api/lakehouse/hello

## Lakehouse integration status

The endpoint below has been verified against the local lab lakehouse:

    GET /api/lakehouse/hello

It reads from Trino using a fixed query against:

    lakekeeper.labtest.hello_iceberg

The lakehouse stack must be running first:

    /srv/lab/scripts/start-lakehouse-lab.sh

Stop it after testing to save RAM:

    /srv/lab/scripts/stop-lakehouse-lab.sh
