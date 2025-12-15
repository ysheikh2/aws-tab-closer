# AWS Tab Closer

A browser extension to automatically close tabs opened by AWS CLI login and AWS VPN. Available for **Firefox** and **Chrome**.

Forked from [AWS-VPN-Tab-Closer](https://github.com/thecodewarrior/AWS-VPN-Tab-Closer).

## Features

This extension automatically closes two types of AWS authentication tabs:

1. **AWS CLI Login** - When you run `aws sso login`, the OAuth callback tab closes automatically after successful authentication
2. **AWS VPN** - When you connect to AWS VPN, the authentication confirmation tab closes automatically

## How it works

### AWS CLI Login

When you authenticate with AWS CLI (e.g., `aws sso login`), a browser tab opens showing the OAuth callback page with a "Request approved" message. This extension detects that page and automatically closes it after authentication completes.

The extension watches for tabs with URLs matching:
- `http://127.0.0.1:*/oauth/callback*` 
- `http://localhost:*/oauth/callback*`

### AWS VPN

Every time you connect to AWS VPN, a new tab will open in your browser at `http://127.0.0.1:35001/`. This extension will detect it and close it automatically when it is fully loaded.

## Installation

### Firefox

1. Download or clone this repository
2. Run `./build.sh` to generate the browser-specific files
3. Open Firefox and navigate to `about:debugging`
4. Click "This Firefox" and then "Load Temporary Add-on"
5. Navigate to the `firefox` folder and select `manifest.json`

**Or install from Firefox Add-ons:** *(coming soon)*

### Chrome

1. Download or clone this repository
2. Run `./build.sh` to generate the browser-specific files
3. Open Chrome and navigate to `chrome://extensions/`
4. Enable "Developer mode" in the top right
5. Click "Load unpacked"
6. Select the `chrome` folder

**Or install from Chrome Web Store:** *(coming soon)*

## Development

### Prerequisites

- Node.js (v16 or higher)
- Yarn package manager (v4.12.0)
- Bash shell (for build script)

### Project Structure

```
.
├── config.json           # Central configuration (metadata, version, etc.)
├── common/               # Generic source files (templates)
│   ├── background.js     # Template for background script
│   └── content.js        # Template for content script
├── build.sh              # Auto-generation script
├── firefox/              # Generated Firefox extension (run build.sh)
├── chrome/               # Generated Chrome extension (run build.sh)
└── dist/                 # Packaged extensions (after npm run package)
```

**Important:** The `firefox/` and `chrome/` directories are **auto-generated** from the `common/` templates. Do not edit them directly! All changes should be made in:
- `config.json` for metadata (name, version, description, etc.)
- `common/*.js` for source code

### Building

Generate browser-specific files from templates:

```bash
./build.sh
```

This will:
1. Read metadata from `config.json`
2. Generate browser-specific manifests
3. Process template files (replace `__BROWSER_API__` with `browser` or `chrome`)
4. Create Firefox-specific files (amo-metadata.json, web-ext-config.mjs)

### Linting

```bash
# Lint both browsers
yarn lint

# Lint Firefox only
yarn lint:firefox

# Lint Chrome only
yarn lint:chrome
```

### Testing

```bash
# Test Firefox (opens browser with extension loaded)
yarn test:firefox

# Test Chrome (shows manual testing instructions)
yarn test:chrome

# Test Chrome (automated validation)
yarn test:chrome:auto
```

The automated Chrome test validates:
- Manifest structure and validity
- Required files presence
- JavaScript syntax
- Browser API usage

For full functional testing, manually test AWS CLI and VPN flows.

### Packaging

Create distributable packages for both browsers:

```bash
# Package both browsers
yarn package

# Package Firefox only
yarn build:firefox

# Package Chrome only
yarn build:chrome
```

Output:
- **Firefox**: `dist/firefox/aws_tab_closer-{version}.zip`
- **Chrome**: `dist/chrome/aws-tab-closer-{version}.zip`

### Publishing

#### Firefox Add-ons (AMO)

1. Set environment variables in `.env`:
   ```
   API_KEY=your_amo_api_key
   API_SECRET=your_amo_api_secret
   ```

2. Sign and publish:
   ```bash
   # Unlisted (for self-distribution)
   yarn sign:firefox
   
   # Listed (public on AMO)
   yarn publish:firefox
   ```

#### Chrome Web Store

1. Visit [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)
2. Upload `dist/chrome/aws-tab-closer-{version}.zip`
3. Fill in store listing details
4. Submit for review

### Making Changes

1. **Update metadata** (name, version, description): Edit `config.json`
2. **Update source code**: Edit files in `common/`
3. **Rebuild**: Run `./build.sh`
4. **Test**: Run `yarn lint` and `yarn test:firefox`
5. **Package**: Run `yarn package`

### Cleaning

Remove all generated files:

```bash
yarn clean
```

## Scripts Reference

| Script | Description |
|--------|-------------|
| `yarn build` | Generate browser-specific files from templates |
| `yarn clean` | Remove all generated files (firefox/, chrome/, dist/) |
| `yarn lint` | Lint both Firefox and Chrome extensions |
| `yarn lint:firefox` | Lint Firefox extension with web-ext |
| `yarn lint:chrome` | Lint Chrome extension with ESLint |
| `yarn test:firefox` | Test Firefox extension in browser |
| `yarn test:chrome` | Show manual testing instructions |
| `yarn test:chrome:auto` | Run automated Chrome extension validation |
| `yarn build:firefox` | Package Firefox extension (.zip) |
| `yarn build:chrome` | Package Chrome extension (.zip) |
| `yarn package` | Build and package both browsers |
| `yarn sign:firefox` | Sign Firefox extension (unlisted) |
| `yarn publish:firefox` | Publish Firefox extension to AMO |

## Configuration

All extension metadata is centralized in `config.json`:

```json
{
  "name": "AWS Tab Closer",
  "version": "1.1.1",
  "description": "Automatically closes tabs opened by AWS CLI login and AWS VPN",
  "author": "ysheikh2",
  "homepage_url": "https://github.com/ysheikh2/AWS-Tab-Closer",
  "license": "MIT",
  "manifest": {
    "manifest_version": 3,
    "permissions": [],
    "host_permissions": [],
    "background": {
      "firefox": {
        "scripts": ["background.js"],
        "persistent": false,
        "type": "module"
      },
      "chrome": {
        "service_worker": "background.js",
        "type": "module"
      }
    },
    "content_scripts": [...]
  },
  "firefox": {
    "id": "{...}",
    "slug": "aws-tab-closer",
    "amo_summary": "...",
    "amo_description": "...",
    "data_collection_permissions": {...}
  },
  "chrome": {
    "update_url": "..."
  }
}
```

**Key improvements:**
- `manifest` section contains the complete manifest structure
- Browser-specific variations (e.g., `background.firefox` vs `background.chrome`)
- All build logic reads from this config, not hardcoded in `build.sh`

To update:
- **Version**: Change `version` field and run `./build.sh`
- **Manifest structure**: Edit `manifest` section
- **Browser-specific settings**: Edit `firefox` or `chrome` sections

## Usage

Simply use AWS CLI login (`aws sso login`) or connect to AWS VPN, and the tabs will automatically close after successful authentication.

## License

MIT

## Contributing

1. Fork the repository
2. Make your changes in `common/` or `config.json`
3. Run `./build.sh` to regenerate browser files
4. Test with `yarn lint` and `yarn test:firefox`
5. Submit a pull request

## Troubleshooting

**Q: The firefox/ or chrome/ folders are missing**  
A: Run `./build.sh` to generate them from the templates in `common/`

**Q: My changes in firefox/ or chrome/ were lost**  
A: These folders are auto-generated. Make changes in `common/` instead, then run `./build.sh`

**Q: Linting fails for Firefox with "apiKey" error**  
A: This is normal if you don't have AMO API keys set. The extension still works fine.

**Q: How do I change the extension name or version?**  
A: Edit `config.json`, then run `./build.sh` to regenerate all browser-specific files.
