# 🔐 Grafana OAuth Proxy Stack

This is a local dev/test stack for integrating Grafana with a protected API using OAuth 2.0.

## 📦 Services

- **mock-oauth-server** – issues OAuth 2.0 tokens
- **mock-dynatrace-api** – returns fake Dynatrace metrics
- **oauth-proxy** – fetches token and proxies requests
- **grafana** – visualizes metrics using JSON API plugin

## 🚀 Run the stack - Docker desktop 4.37.2

```bash
docker-compose up --build
```
Grafana: http://localhost:3001  
OAuth Token URL: http://localhost:3000/token  
Dynatrace API: http://localhost:5000/v1/metrics  
Proxy URL: http://localhost:4000/dynatrace/metrics

## 🔐 JSON API in Grafana

- URL: `http://oauth-proxy:4000/dynatrace`
- Query path: `metrics`

FLOW:
```bash
Grafana  -->  OAuth Proxy  -->  Dynatrace API
                   ^
                   |
                   v
             OAuth Provider
```
