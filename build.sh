#!/bin/bash
set -e

# Load configuration
CONFIG_FILE="config.json"

echo "Building browser extensions from common sources..."

# Clean and create directories
rm -rf firefox chrome
mkdir -p firefox chrome

# Function to generate browser-specific files
generate_files() {
    local browser=$1
    local api_name=$2
    local target_dir=$3
    
    echo "Generating $browser files..."
    
    # Copy and process JavaScript files
    sed "s/__BROWSER_API__/$api_name/g" common/content.js > "$target_dir/content.js"
    sed "s/__BROWSER_API__/$api_name/g" common/background.js > "$target_dir/background.js"
    
    echo "  ✓ JavaScript files generated"
}

# Generate Firefox files
generate_files "Firefox" "browser" "firefox"

# Generate Firefox manifest from config
node -e "
const config = require('./config.json');
const manifest = {
  manifest_version: config.manifest.manifest_version,
  name: config.name,
  version: config.version,
  description: config.description,
  author: config.author,
  homepage_url: config.homepage_url,
  browser_specific_settings: {
    gecko: {
      id: config.firefox.id,
      data_collection_permissions: config.firefox.data_collection_permissions
    }
  },
  background: config.manifest.background.firefox,
  content_scripts: config.manifest.content_scripts,
  permissions: config.manifest.permissions,
  host_permissions: config.manifest.host_permissions
};
require('fs').writeFileSync('firefox/manifest.json', JSON.stringify(manifest, null, 2));
"
echo "  ✓ Firefox manifest.json generated"

# Generate Chrome files
generate_files "Chrome" "chrome" "chrome"

# Generate Chrome manifest from config
node -e "
const config = require('./config.json');
const manifest = {
  manifest_version: config.manifest.manifest_version,
  name: config.name,
  version: config.version,
  description: config.description,
  author: config.author,
  homepage_url: config.homepage_url,
  background: config.manifest.background.chrome,
  content_scripts: config.manifest.content_scripts,
  permissions: config.manifest.permissions,
  host_permissions: config.manifest.host_permissions
};
if (config.chrome.update_url) {
  manifest.update_url = config.chrome.update_url;
}
require('fs').writeFileSync('chrome/manifest.json', JSON.stringify(manifest, null, 2));
"
echo "  ✓ Chrome manifest.json generated"

# Generate Firefox AMO metadata
node -e "
const config = require('./config.json');
const amoData = {
  slug: config.firefox.slug,
  summary: {
    'en-GB': config.firefox.amo_summary
  },
  description: {
    'en-GB': config.firefox.amo_description
  },
  categories: config.firefox.categories,
  version: {
    license: config.license,
    approval_notes: config.firefox.approval_notes
  }
};
require('fs').writeFileSync('firefox/amo-metadata.json', JSON.stringify(amoData, null, 2));
"
echo "  ✓ Firefox amo-metadata.json generated"

# Generate Firefox web-ext config
cat > firefox/web-ext-config.mjs << 'EOF'
import path from 'path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.resolve(__dirname, '..', '.env') })

const config = {
  sourceDir: "."
};

if (process.env.API_KEY && process.env.API_SECRET) {
  config.sign = {
    apiKey: process.env.API_KEY,
    apiSecret: process.env.API_SECRET,
    amoMetadata: "amo-metadata.json"
  };
}

export default config;
EOF
echo "  ✓ Firefox web-ext-config.mjs generated"

echo ""
echo "✅ Build complete!"
echo "   Firefox extension: ./firefox/"
echo "   Chrome extension: ./chrome/"
