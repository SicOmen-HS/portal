# syntax=docker/dockerfile:1
#
# Container-builddefinition för Angular-frontenden (ADR-0007).
#
# Byggkontext: frontend/. Bygg t.ex. från repositoryts rot:
#
#   docker build -t portal-frontend:local frontend
#
# Imagen är miljöoberoende: ingen labbspecifik URL eller annan
# miljöspecifik konfiguration byggs in. Den byggda, versionshanterade
# runtime-config.json (säkra exempelvärden, se
# public/assets/config/README.md) följer med som default, men den
# faktiska, miljöspecifika filen ska ersättas externt vid körning genom
# att montera över /usr/share/nginx/html/assets/config/runtime-config.json
# - se README.md för det fullständiga kontraktet.

# ---- Build-stage -------------------------------------------------------
# Kör Angulars faktiska production-build (ng build). Ingår inte i den
# slutliga imagen.
FROM node:22-alpine AS build
WORKDIR /app

# Kopiera enbart manifest-/lockfiles först så att `npm ci` cachas separat
# från källkodsändringar. Den versionshanterade package-lock.json gör
# bygget reproducerbart.
COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

# ---- Runtime-stage -------------------------------------------------------
# Enbart en liten, produktionstjänlig statisk webbserver - ingen
# Node-runtime, ingen `ng serve`. nginx-unprivileged körs icke-root och
# lyssnar redan som standard på en icke-privilegierad port (8080), vilket
# också ligger i linje med portalens dokumenterade framtida
# OpenShift-riktning (docs/04_Systemarkitektur.md).
FROM nginxinc/nginx-unprivileged:1.27-alpine AS final

COPY nginx.conf /etc/nginx/conf.d/default.conf

# Angular CLI 22:s application-builder publicerar produktionsbygget under
# dist/<projektnamn>/browser/ (projektnamnet "frontend" i angular.json) -
# verifierat lokalt (se handoff).
COPY --from=build /app/dist/frontend/browser /usr/share/nginx/html

EXPOSE 8080
