---
title: Cloudflare Tunnel Setup
category: reference
created: 2026-01-20T19:31:09.527Z
source: devsoloai
---

# Cloudflare Tunnel Setup - Second Brain

## Active Tunnel: solospace

| Property | Value |
|----------|-------|
| **Tunnel ID** | `7c2790e3-0f24-4598-9d99-402452b977de` |
| **Public URL** | https://solospace.codewithsolo.com |
| **Routes to** | http://localhost:5000 (webhook server) |
| **Created** | 2025-12-22 |

## Files Location

All tunnel files in `~/.cloudflared/`:

| File | Purpose |
|------|---------|
| `config.yml` | Main tunnel configuration |
| `7c2790e3-...json` | Tunnel credentials (DO NOT SHARE) |
| `cert.pem` | Cloudflare auth certificate |

## config.yml

```yaml
url: http://localhost:5000
tunnel: 7c2790e3-0f24-4598-9d99-402452b977de
credentials-file: /data/data/com.termux/files/home/.cloudflared/7c2790e3-0f24-4598-9d99-402452b977de.json

ingress:
  - hostname: solospace.codewithsolo.com
    service: http://localhost:5000
  - service: http_status:404
```

## Commands

```bash
# Start tunnel (standalone)
cloudflared tunnel run 7c2790e3-0f24-4598-9d99-402452b977de

# Start full stack (server + tunnel)
brain-start start

# Check status
brain-start status

# Stop everything
brain-start stop

# View tunnel logs
tail -f ~/.local/share/logs/tunnel.log
```

## DNS Setup (Cloudflare Dashboard)

CNAME record required:
- **Name:** `solospace`
- **Target:** `7c2790e3-0f24-4598-9d99-402452b977de.cfargotunnel.com`
- **Proxy:** Enabled (orange cloud)

## Authentication

External requests require Bearer token:
- Token set in `~/.env.supercharge` as `GPT_API_TOKEN`
- Localhost requests bypass auth
- Custom GPT uses this token in Authorization header

## Other Tunnels (inactive)

| Name | ID | Notes |
|------|-----|-------|
| devbox | b2eeb1b8-b398-4b23-ade7-4272d095f98b | Old tunnel |
| solospace-localhost-9620 | bd1313d6-76af-4db4-8d30-8f8a1c671964 | Test |
| solospace-localhost-9621 | c334f101-0a31-4136-9f68-9feca30b45d7 | Test |

