# AWS Tab Closer

Automatically closes tabs opened by AWS CLI login and AWS VPN. Available for **Firefox** and **Chrome**.

Forked from [AWS-VPN-Tab-Closer](https://github.com/thecodewarrior/AWS-VPN-Tab-Closer).

## Install

### Firefox

Download from [releases](../../releases). (awaiting approval on firefox add on store)

### Chrome

Download from [Chrome Web Store](https://chromewebstore.google.com/detail/aws-tab-closer/dehbffgnongnpnnondbigcffchedgmnl?authuser=0&hl=en-GB) or [releases](../../releases).

## How it works

When you run `aws sso login` or connect to AWS VPN, a local browser tab opens. This extension detects the success page and closes it automatically.

**Detected URLs:**

- `http://127.0.0.1:*/oauth/callback*` (AWS CLI)
- `http://127.0.0.1:35001/*` (AWS VPN)

## Development

### Prerequisites

- Node.js v22+
- Yarn v4.12.0+

### Quick Start

```bash
# Install dependencies
yarn install

# Build browser-specific files from templates
yarn build

# Test Firefox
yarn test:firefox

# Test Chrome
yarn test:chrome

# Lint
yarn lint

# Package for release
yarn package

# Sign for firefox with
yarn build
source .env && yarn sign:firefox

```

### Project Structure

- **`config.json`** — Metadata, version, and permissions for both browsers
- **`common/`** — Browser-agnostic source code (templates)
- **`build.sh`** — Generates Firefox/Chrome manifests and code from templates
- **`firefox/` & `chrome/`** — Auto-generated; don't edit directly

### Making Changes

1. Edit `common/*.js` (source code) or `config.json` (metadata/version)
2. Run `yarn build` to regenerate browser-specific files
3. Test with `yarn test:firefox` or `yarn test:chrome`
4. Commit and create a GitHub release to trigger automated builds

### Releasing

1. Update `version` in `config.json`
2. Commit: `git commit -am "Release v1.2.0"`
3. Tag: `git tag v1.2.0 && git push origin v1.2.0`
4. Workflow auto-builds and uploads signed Firefox XPI + Chrome ZIP to release assets

To publish to stores manually:

- **Firefox:** Upload release XPI to [AMO](https://addons.mozilla.org/developers)
- **Chrome:** Upload release ZIP to [Web Store](https://chrome.google.com/webstore/devconsole)

## Privacy

No data collection. The extension only reads local page content to detect AWS success messages.

## License

MIT
