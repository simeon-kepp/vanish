# VANISH

Open-source digital footprint remediation engine.

**Find where your personal information exists. Remove what can be removed. Verify that it disappeared. Detect when it comes back.**

Local-first. No subscription. Your data stays on your machine.

## What VANISH does

VANISH is not another privacy scanner. It is a **digital footprint remediation pipeline**:

1. **Discover** - Scan your browser fingerprint and discover where your identity data exists across data brokers, search engines, and breach databases
2. **Classify** - Every finding gets a state: FOUND -> CONFIRMED -> REMOVABLE -> REMOVAL_REQUESTED -> REMOVED -> VERIFIED
3. **Remediate** - Generate GDPR Article 17 erasure requests, CCPA deletion requests, and account deletion requests
4. **Verify** - Don't trust the confirmation email. Verify removals actually happened
5. **Monitor** - Detect reappearance of removed data

## Architecture

```
VANISH PWA          Browser Extension          Local CLI
+-----------------+    +--------------+         +----------+
| Dashboard       |<---| API control  |         | Deep     |
| Analysis        |    | Tracker      |         | control  |
| Config          |    | Blocking     |         | Profiles |
| Verification    |    | Signal       |         | Launch   |
| Monitoring      |    | Normalization|         |          |
+-----------------+    +--------------+         +----------+
```

## Quick Start

```bash
# Clone the repo
git clone https://github.com/rfi-irfos/vanish.git
cd vanish

# Serve locally
python3 -m http.server 8080
# Open http://localhost:8080
```

## PWA Installation

VANISH is a Progressive Web App. Install it from your browser:

1. Open http://localhost:8080
2. Click Install VANISH, or Add to Home Screen on mobile

All data is stored locally. **Nothing is sent to any server.**

## Features

- **Fingerprint Auditor** - Analyzes Canvas, WebGL, Audio, Fonts, WebRTC, Screen, Headers
- **Distinctiveness Score** - Measures browser uniqueness vs general population
- **Identity Graph** - Links all identifiers across categories
- **Data Broker Registry** - Built-in database of 7+ brokers with removal endpoints
- **Remediation Pipeline** - Classify, generate requests, track status
- **Verification Engine** - Post-removal verification
- **Local-First** - All identity data stays on your machine

## What VANISH does NOT do

- Cannot remove data from the internet directly
- Cannot make your IP address disappear
- Cannot delete data you voluntarily shared
- Cannot remove public court or property records
- Cannot guarantee permanent erasure

## Browser Extension (Coming)

Runtime fingerprint protection: signal normalization, tracker blocking, WebRTC leak prevention, per-site policy engine.

## License

MIT. See [LICENSE](LICENSE).
