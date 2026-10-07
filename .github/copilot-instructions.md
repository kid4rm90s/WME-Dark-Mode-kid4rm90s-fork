# WME Dark Mode - AI Coding Instructions

## Project Overview
This is a Tampermonkey userscript that implements dark mode for Waze Map Editor (WME), supporting the editor, beta, chat, discuss, and profile pages. The script injects CSS modifications and provides a theme toggle with auto/dark/light modes synchronized across tabs via `GM_setValue`/`GM_getValue`.

## Architecture & Data Flow

### Theme Management System
- **Storage**: Uses GM storage API (`GM_getValue`, `GM_setValue`, `GM_addValueChangeListener`) for cross-tab sync
- **Keys**: `wz-theme` (current: 'dark'|'light'|'auto'), `wz-previous-theme` (last non-light theme)
- **DOM Attribute**: Sets `[wz-theme="dark"]` on `document.documentElement` for CSS targeting
- **Auto Mode**: Monitors `window.matchMedia('(prefers-color-scheme: dark)')` with event listener cleanup via AbortController

### CSS Injection Strategy
- **Two CSS blocks**: Main `cssModifications` (~1900 lines) for WME/profile, smaller `discussCSSModifications` for Waze Discuss only
- **Injection timing**: Called immediately on script load, before WME initialization
- **CSS variables**: Leverages WME's native dark mode palette (e.g., `--background_default`, `--content_p1`, `--always_dark_surface_default`)
- **Plugin support**: Extensive per-plugin CSS overrides (URO+, WMEPH, WME Toolbox, Closure Helper, etc.)

### UI Toggle Integration
- **Profile toggle**: Injected into `wz-user-box` → `wz-menu-item` as `<wz-toggle-switch>` (simple on/off)
- **Settings toggle**: Injected into `.settings__form` as three `<wz-button>` elements (light/dark/auto)
- **Retry logic**: Polls up to 60 times with 1s intervals (`profileTries`/`settingsTries`) to find dynamically-loaded DOM
- **Observers**: `MutationObserver` on `document.body` for settings panel re-injection

### Shadow DOM Handling
- **Problem**: WME uses shadow roots for tooltips (`WZ-TOOLTIP-CONTENT`) and textareas
- **Solution**: `mainObserver` watches for added nodes, injects styles or modifies attributes
- **Example**: UR textarea inverts colors (`filter: invert(1.0)`) to fix URC-E's peachpuff override

## Critical Conventions

### CSS Targeting Patterns
```css
[wz-theme="dark"] .some-selector {
    background-color: var(--background_default);
    color: var(--content_p1) !important;
}
```
- Always use `[wz-theme="dark"]` prefix for all dark mode styles
- Use `!important` sparingly, primarily for plugin overrides
- Prefer WME's CSS variables over hardcoded colors (exception: `black` for high contrast)

### Plugin-Specific CSS
When adding support for a new WME plugin:
1. Use descriptive comment headers: `/*********** Plugin Name ***********************************************/`
2. Test with FUME plugin (warns if contrast enhancement conflicts)
3. Check for shadow roots requiring JS injection
4. Use `filter: invert(100%)` for light-only icons/images

### Version Updates
Update these in lockstep:
- `@version` in userscript header (line 4)
- `updateMessage` variable (line 152)
- Changelog comment block (lines 25-144)

### Memory Leak Prevention
- Store observer references: `mainObserver`, `chipObserver`, `settingsObserver`
- Store timeout IDs: `profileTimeoutId`, `settingsTimeoutId`
- Cleanup on `beforeunload` event (lines 2060-2067)
- Use `{ signal: themeAbortController.signal }` for media query listener

## Development Workflow

### Testing Changes
1. Install from local file or paste into Tampermonkeys
2. Test across pages: `waze.com/editor`, `waze.com/user/editor/...`, `waze.com/discuss`
3. Verify toggle sync by opening multiple tabs
4. Check FUME warning: Enable FUME contrast → should show WazeWrap alert

### Debugging
- `console.log(\`${scriptName} initialized.\`)` confirms load
- Check `document.documentElement.getAttribute('wz-theme')` in console
- Inspect `#wme-dark-mode-styles` or `#wme-dark-mode-discuss-styles` in `<head>`
- Watch for MutationObserver activity on dynamic elements

### Dependencies
- **WazeWrap**: Required for alerts (`WazeWrap.Alerts.info()`) and update UI
- **WME Utils - Bootstrap**: Provides `bootstrap()` function and `scriptUpdateMonitor`
- **Compatibility**: Avoid SDK where possible (see user's instruction file for deprecated resources)

## Common Tasks

### Adding Support for New Plugin
1. Identify plugin's container/classes (use DevTools → Inspect)
2. Add CSS block after existing plugin sections (~line 1450+)
3. Use format: `[wz-theme="dark"] #plugin-container { ... }`
4. Test with dark/light toggle to verify no light mode bleed

### Fixing Shadow Root Element
1. Add node check in `mainObserver` callback (line 1979)
2. Example pattern:
```javascript
if (node.nodeName === 'CUSTOM-ELEMENT') {
    const shadowRoot = node.parentNode?.shadowRoot;
    if (shadowRoot) {
        const style = document.createElement('style');
        style.textContent = `/* your CSS */`;
        shadowRoot.appendChild(style);
    }
}
```

### Handling Dynamic UI Elements
- Use `MutationObserver` for repeatedly added/removed elements (like settings panel)
- Use timeout polling for one-time additions (like profile toggle)
- Always set max retry limits and cleanup timeouts

## Key Files
- [wme_dark_mode.js](wme_dark_mode.js) - Single-file architecture, ~2077 lines
  - Lines 1-150: Metadata, changelog, initialization
  - Lines 151-500: Theme management functions, UI update logic
  - Lines 501-1900: Main CSS modifications
  - Lines 1900-2077: Observer setup, dynamic element handling, cleanup

## Reference Resources
- WME SDK: https://www.waze.com/editor/sdk/ (production), https://beta.waze.com/editor/sdk/ (beta)
- WazeWrap: https://github.com/WazeDev/WazeWrap/blob/master/WazeWrap.js
- OpenLayers 2 (legacy): https://web.archive.org/web/20200701150732/http://dev.openlayers.org/releases/OpenLayers-2.13.1/doc/apidocs/files/OpenLayers-js.html
