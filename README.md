# 🔐 Grafana OAuth Proxy Stack

This is a local dev/test stack for integrating Grafana with a protected API using OAuth 2.0.

## 📦 Services

- **mock-oauth-server** – issues OAuth 2.0 tokens
- **mock-dynatrace-api** – returns fake Dynatrace metrics
- **oauth-proxy** – fetches token and proxies requests
- **grafana** – visualizes metrics using JSON API plugin

## 🚀 Run the stack

```bash
docker-compose up --build
