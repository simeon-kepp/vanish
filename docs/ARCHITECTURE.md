# VANISH Architecture

## Overview

VANISH is a digital footprint remediation engine with a modular architecture designed for extensibility and local-first privacy.

## Core Modules

### IdentityGraph (`js/modules/identity-graph.js`)
Builds a correlation graph from user-provided identifiers (name, alias, email, username, phone, domain, address). Each node is linked to others by relationship type (alias_of, contact_of, handles, owned, resided_at).

### FingerprintScanner (`js/modules/fingerprint-scanner.js`)
Analyzes browser fingerprint signals in real-time:
- Canvas fingerprint
- WebGL renderer/vendor
- AudioContext behavior
- Installed fonts
- WebRTC local IPs
- Screen resolution, color depth, pixel ratio
- User-Agent, language, platform
- Hardware concurrency, device memory

Outputs a **Distinctiveness Score** (0-100) indicating how unique the browser is relative to the general population.

### Remediator (`js/modules/remediator.js`)
Manages the full remediation pipeline:
- Broker registry (7+ data brokers)
- Target classification (FOUND → CONFIRMED → REMOVABLE → REMOVAL_REQUESTED → REMOVED → VERIFIED)
- Removal request generation with approval modes
- Verification engine for post-removal confirmation
- Re-appearance monitoring

## Data Flow

```
User Input (Identity Form)
    │
    ▼
IdentityGraph.buildFromForm()
    │
    ├──► Nodes created (name, alias, email, username, phone, domain, address)
    ├──► Links created (alias_of, contact_of, handles, owned, resided_at)
    │
    ▼
FingerprintScanner.scan()
    │
    ├──► Canvas fingerprint
    ├──► WebGL renderer
    ├──► Audio fingerprint
    ├──► Font detection
    ├──► WebRTC IPs
    │
    ▼
Distinctiveness Score
    │
    ▼
Remediator.classifyTargets()
    │
    ├──► BROKER_DELETE (for broker-listed records)
    ├──► SOCIAL_SEARCH (for usernames)
    ├──► BREACH_CHECK (for emails)
    ├──► DEINDEX_CHECK (for old domains)
    │
    ▼
Remediation Pipeline
    │
    ▼
Verification & Monitoring
```

## Storage

- **LocalStorage**: Identity graph state (`vanish_state` key)
- **IndexedDB** (future): Full remediation history, verification logs
- **No server**: All processing happens client-side

## Future Extensions

### Browser Extension
- Runtime signal normalization
- Tracker blocking
- Client-hint minimization
- Per-site policy engine

### Local CLI
- Deep system-level fingerprint control
- Browser profile generation
- Automated scan scheduling

### GitHub Pages Deployment
- Static hosting with PWA manifest
- Offline-first via service worker
- Community broker registry (JSON-based)
