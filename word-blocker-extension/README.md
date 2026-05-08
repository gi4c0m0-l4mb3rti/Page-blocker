# 🚫 Word Blocker Extension

A browser extension that blocks web pages containing user-defined blacklisted words.

## Features

- ✅ **Custom Blacklist** — Add any words or phrases you want to block
- ✅ **Case-Insensitive** — Matches regardless of capitalization
- ✅ **Toggle On/Off** — Enable/disable the extension instantly
- ✅ **Block Counter** — Track how many pages have been blocked
- ✅ **Allow Once** — Temporarily bypass the block for a specific page
- ✅ **Go Back Button** — Quickly return to the previous page
- ✅ **Dark Theme** — Modern, clean dark UI

## Installation

### Chrome / Edge / Brave (Chromium-based)

1. Download and extract this extension folder
2. Open your browser and go to `chrome://extensions/`
3. Enable **"Developer mode"** (toggle in top-right corner)
4. Click **"Load unpacked"**
5. Select the extracted extension folder
6. The extension icon will appear in your toolbar

### Firefox

1. Download and extract this extension folder
2. Open Firefox and go to `about:debugging`
3. Click **"This Firefox"** → **"Load Temporary Add-on"**
4. Select the `manifest.json` file from the extracted folder

## Usage

1. Click the extension icon in your browser toolbar
2. Enter words/phrases to block (one per line) in the text area
3. Click **"Save Blacklist"**
4. Browse normally — pages containing blacklisted words will be blocked automatically

## File Structure

```
word-blocker-extension/
├── manifest.json      # Extension manifest (Manifest V3)
├── background.js      # Service worker
├── content.js         # Content script (runs on every page)
├── popup.html         # Extension popup UI
├── popup.js           # Popup logic
└── icons/
    ├── icon16.png
    ├── icon48.png
    └── icon128.png
```

## How It Works

1. The **content script** (`content.js`) runs on every webpage you visit
2. It fetches your blacklist from browser storage
3. It scans the page title, meta description, and visible text
4. If any blacklisted word is found, it immediately stops page loading and displays a block screen
5. The block screen offers "Go Back" or "Allow Once" options

## Permissions

- `storage` — Save your blacklist and settings
- `activeTab` — Access current tab for blocking
- `scripting` — Inject blocking content
- `<all_urls>` — Check all websites for blacklisted words

## License

MIT License — Free to use and modify.
