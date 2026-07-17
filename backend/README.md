# Backend

Denna katalog innehåller för närvarande **mer än en avgränsad backend-POC**,
inte en enda sammanhållen backend. Se respektive fil för detaljer:

* [`Portal.Api/README.md`](Portal.Api/README.md) — den .NET-baserade
  backend-POC:n från AB-027 (Angular → .NET Web API → adapter → lokal SQL
  Server-preview). **.NET Web API är portalens dokumenterade ordinarie
  backendriktning** (se [`docs/04_Systemarkitektur.md`](../docs/04_Systemarkitektur.md)).
* [`LAKEHOUSE_POC.md`](LAKEHOUSE_POC.md) — ett separat, tillfälligt tekniskt
  labb (Node.js/TypeScript/Trino) för dataåtkomst mot en lokal
  lakehouse-miljö. Detta labb är **inte** portalens ordinarie backend.

Denna fil innehåller medvetet inga detaljerade körinstruktioner för någondera
POC — se länkarna ovan.
