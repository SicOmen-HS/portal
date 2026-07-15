# Portal lakehouse frontend coordination

## Status

Backend POC exists for lakehouse data access:

    GET /api/lakehouse/hello

The endpoint reads from Trino using a fixed safe query.

## Coordination decision

Do not add frontend routes or UI components for lakehouse integration until the frontend approach has been coordinated with the colleague currently working on the portal solution.

## Reason

The portal frontend is actively being developed in parallel.

Avoid unnecessary merge conflicts and avoid introducing lab-only UI in the main application before agreeing on placement and design.

## Proposed next discussion

Agree on:

    whether the lab view should exist in the frontend repo
    where it should be placed
    whether it should be hidden behind config/feature flag
    how frontend should call backend APIs
    naming and route conventions
