# VANISH

Open-source digital footprint remediation engine.

**Find it. Remove it. Verify it. Keep it gone.**

Local-first. No subscription. Your data stays on your machine.

## Try It Live

[![Install VANISH](https://img.shields.io/badge/Install-VANISH_PWA-informational?style=for-the-badge)](https://simeon-kepp.github.io/vanish)

**[Open VANISH →](https://simeon-kepp.github.io/vanish)**

## What VANISH does

Not another privacy dashboard. A **digital footprint remediation pipeline**:

1. **Discover** — Scan your browser fingerprint (Canvas, WebGL, Audio, Fonts, WebRTC)
2. **Classify** — Every finding gets a state: FOUND → CONFIRMED → REMOVABLE → REMOVED → VERIFIED
3. **Remediate** — Generate GDPR Art. 17 erasure requests, CCPA deletion requests
4. **Verify** — Confirm removals actually happened
5. **Monitor** — Detect reappearance of removed data

## Architecture

```
VANISH PWA          Browser Extension          Local CLI
+-----------------+    +--------------+         +----------+
| Dashboard       |<---| API control  |         | Deep     |
| Identity        |    | Tracker      |         | control  |
| Scan            |    | Blocking     |         | Profiles |
| Remediation     |    | Signal       |         | Launch   |
| Verify          |    | Normalization|         |          |
+-----------------+    +--------------+         +----------+
```

## Quick Start

```bash
git clone https://github.com/simeon-kepp/vanish.git
cd vanish
python3 -m http.server 8080
# Open http://localhost:8080
```

## Features

- **Fingerprint Auditor** — Canvas, WebGL, Audio, Fonts, WebRTC analysis
- **Distinctiveness Score** — Measures browser uniqueness (0-100)
- **Identity Graph** — Links all your identifiers across categories
- **Data Broker Registry** — Built-in database with removal endpoints
- **Remediation Pipeline** — Classify, generate requests, track status
- **Verification Engine** — Post-removal confirmation
- **Local-First** — All data stays on your machine

## What VANISH does NOT do

- Cannot remove data from the internet directly
- Cannot make your IP disappear
- Cannot delete voluntarily shared social media data
- Cannot remove public court/property records
- Cannot guarantee permanent erasure

## Browser Extension (Coming)

Runtime fingerprint protection: signal normalization, tracker blocking, WebRTC leak prevention.

## License

MIT. See [LICENSE](LICENSE).

Built by RFI-IRFOS. [rfi-irfos.com](https://rfi-irfos.com)
