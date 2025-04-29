// ==UserScript==
// @name         WME Dark Mode (kid4rm90s fork)
// @namespace    https://greasyfork.org/en/users/1434751-poland-fun
// @version      1.04.1
// @description  Enable dark mode in WME.
// @author       poland_fun
// @contributor	 kid4rm90s and luan_tavares_127
// @match        *://*.waze.com/*editor*
// @match        *://*.waze.com/chat*
// @match        *://*.waze.com/discuss*
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_addValueChangeListener
// @grant        GM_xmlhttpRequest
// @connect      greasyfork.org
// @require      https://greasyfork.org/scripts/24851-wazewrap/code/WazeWrap.js
// @require      https://update.greasyfork.org/scripts/509664/WME%20Utils%20-%20Bootstrap.js
// @license      MIT
// @downloadURL https://update.greasyfork.org/scripts/529939/WME%20Dark%20Mode%20%28kid4rm90s%20fork%29.user.js
// @updateURL https://update.greasyfork.org/scripts/529939/WME%20Dark%20Mode%20%28kid4rm90s%20fork%29.meta.js
// ==/UserScript==

/*
Change log

Version
0.1 - Initial Release
0.2 - Fixed some scripts that used custom CSS
0.3 - Fixed welcome screen, turn/segment closures
0.4 - Fixed house number backgrounds
0.5 - First pass at fixing WMEPH look.
      Fixed URC pop-up overlay.
0.6 - Made chat dark.
      Fixed go to link, and delete buttons for google links, entrances
0.7 - Undid go to link, and delete buttons for google links, entrances - Broke other stuff
      Preliminary pass on darkening of WME Toolbox, and Editor info
0.8 - Fixed some practice mode intro text
      Fixed Turn restriction table. Some buttons are still broken.
0.9 - Fixed -
        - Advanced Closures
        - Road Selector
        - UR-MP Trakcer
        - Editing is disabled tooltips
        - Intro gif
0.10 - Fixed -
        - WMPEH Green Lock background behind Lock text
        - URO+ tabs + comment hover + comment count
        - Empty Notification text
        - Made some text in the toolbox property editor easier to read
0.11 - Fixed -
        - Invert URO+ comment count bubbles to preserve color variations.
0.12 - Fixed -
        - Non-empty notification entries.
0.13 - Fixed -
        - Non-empty notification entries. Maybe? Can't test
        - Date range picker for RTCs.
        - Script update screen.
0.14 - Fixed -
        - DOT Advisories plugin DOT message pop-ups.
0.15 - Fixed -
        - Waze Edit Count Monitor plugin.
0.16 - Fixed -
        - Script updateed screen.
        - Toolbox updated screen.
        - Toolbox prop editor now looks correct, but is not transparent
        - URC-E append mode peachpuff is now blue and usable.
       Fixed indentation of all CSS.
0.17 - Fixed -
        - FUME zoom bar
        - FUME turn hover disable not turning red
        - Previous build pop-up
0.18 - Fixed -
        - Added one more css block for wmesct
        - Added some transperency back to WME Toolbox due to bigger windows
        - Added a couple of plugin CSS blocks
        - Fixed city names on the city layer
0.19 - Fixed -
        - Closure date range
        - External provider links
0.20 - Fixed -
        - FUME? update box? I think it was FUME, but I forgot to read it.
0.21 - Fixed -
        - E50 Plugin
        - Allow/Disallow All turns
0.22 - Fixed -
        - Fixed WMEOpenData Plugin
0.23 - Fixed -
        - Fixes for user editor panel envoronment selection
		- wme geometries
		- route checker-
		- validator
		- relock segmetns
		- locksmith
		- WAL
		- Closure helper
	 - Now script is able to show changelog and monitor the updateversion.
0.24 - Fixed
		- Place delete icon fix
		- Lanes and road width color fix
		- Route checker minor fix
		- closure helper fix
		- EVCS icon partial fix
		- WME Wazebar fix
		
0.24.1 - Fixed
		- WME Wazebar fix for waze discusss
		
0.25 - Added ability to toggle dark/light mode in both Prod and Beta. Currently under Waze Settings.
       Fixed
		- UR/MP list being dark
        - Added a Wazebar target

0.25.1 - Minor fix for sdk initialized
1.00 - Structural improvements to code.
       Enhanced ability to change dark/light mode. Made it sync across tabs/chat/profile/beta.
       Added a warning message to warn about FUME contrast enhancements being enabled.
1.01 - Removed the match for Waze Discuss. Did this to change the Waze Bar
1.02 - Added an auto theme mode which syncs with the system
       Fixed -
        - Profile toggle sometimes going to the wrong menu
        - No edit colors on profile page
1.03 - Added support for WME Edit Profile Enhancement
       Fixed -
        - Various other bugs
1.04 - Added support for WME Edit Profile Enhancement
       Fixed -
        - Various other bugs
		- Waze discuss welcome font fix	
	
*/

/* global W */
/* global WazeWrap */

/* TODO */
/* When you click buttons, they still go white */

(function main() {
  "use strict";
  const updateMessage = 'Added \'Support for WME Edit Profile Enhancement\'<br>Fixed<br>- Various other bugs.<br>';
  const scriptName = GM_info.script.name;
  const scriptVersion = GM_info.script.version;
  const downloadUrl = 'https://greasyfork.org/scripts/529939-wme-dark-mode-kid4rm90s-fork/code/WME%20Dark%20Mode%20%28kid4rm90s%20fork%29.user.js';
	let   profileTries   = 0;
	let   settingsTries  = 0;
    // Currently it is 60 retries (seconds) since we can only add this after a user is
    // logged in. Change this in the future to be smarter. The quick check is lightweight
    // so it should not bog anything down.
    let   maxUIRetries   = 60;

    var lightButton;
    var darkButton;
    var autoButton;

    var darkModeSwitch;	

    function updateUI() {
        const theme = getPreferredTheme();
        let currAuto = window.matchMedia('(prefers-color-scheme: dark)').matches ? "Dark" : "Light";

        // Let's make sure that the buttons were made.
        // Since they are made together, we just check that
        // one is not null
        if (lightButton) {
            lightButton.value = theme == 'light' ? "true" : "false";
            darkButton.value  = theme == 'dark'  ? "true" : "false";
            autoButton.value  = theme == 'auto'  ? "true" : "false";

            lightButton.color = theme == 'light' ? "primary" : "secondary";
            darkButton.color  = theme == 'dark'  ? "primary" : "secondary";
            autoButton.color  = theme == 'auto'  ? "primary" : "secondary";

            autoButton.textContent  = `Auto (${currAuto})`;
        }

        if (darkModeSwitch) {
            // We want the toggle to toggle either dark or auto
            // on or off. So if we are light themed, the text depends
            // on the last theme.

            // If last theme is dark, the toggle turns "Dark Theme" on/off
            // If last theme is auto, the toggle turns "Auto Theme" on/off

            if (theme == "auto" ||
                (theme == "light" && getPreviousTheme() == "auto")) {
                darkModeSwitch.textContent = `Auto Theme (${currAuto})`;
            } else {
                darkModeSwitch.textContent = "Dark Theme";
            }

            if (theme == "auto") {
                // Auto always counts as true so that turning it 'off' will
                // always go to light.
                darkModeSwitch.checked = true;
            } else {
                darkModeSwitch.checked = theme == "dark" ? true : false;
            }
        }
    }

	function getPreviousTheme() {
        return GM_getValue('wz-previous-theme', 'dark');
	}

	function getPreferredTheme() {
        return GM_getValue('wz-theme', 'dark');
	}

    function setPreferredTheme(theme) {
        // We need to keep track of our last theme to use it in
        // the text for the toggle located under the profile box
        const currTheme = getPreferredTheme();

        // Since we now keep track of the last theme, we only want
        // to update the theme if it is different
        if (theme != currTheme) {
            GM_setValue('wz-previous-theme', currTheme);
            GM_setValue('wz-theme', theme);
        }
    }

    GM_addValueChangeListener("wz-theme", function(key, oldValue, newValue, remote) {
        updateUI();
        setTheme();
    });

    // Detect changes in the system theme.
    // We always need to update the UI to change the text in ()s - Auto Mode ([mode])
    // Calling setTheme even if there is no need to change is fine
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', event => {
        updateUI();
        setTheme();
    });	

    // We are not in an iframe
    const cssModifications = `
			/* Dark mode palette found in the chat code */
			[wz-theme="dark"] {
				--alarming: #ff8f8f;
				--alarming_variant: #ff8f8f;
				--always_white: #fff;
				--always_black: #000;
				--always_dark: #202124;
				--always_dark_background_default: #202124;
				--always_dark_background_variant: #000;
				--always_dark_content_default: #e8eaed;
				--always_dark_content_p1: #d5d7db;
				--always_dark_content_p2: #b7babf;
				--always_dark_inactive: #55595e;
				--always_dark_surface_default: #3c4043;
				--background_default: #202124;
				--background_modal: rgba(32,33,36,0.6);
				--background_table_overlay: rgba(144,149,156,0.6);
				--background_variant: #000;
				--brand_carpool: #1ee592;
				--brand_waze: #3cf;
				--cautious: #fce354;
				--cautious_variant: #ffc400;
				--content_default: #e8eaed;
				--content_p1: #d5d7db;
				--content_p2: #b7babf;
				--content_p3: #90959c;
				--disabled_text: #72767d;
				--hairline: #55595e;
				--hairline_strong: #72767d;
				--handle: #d5d7db;
				--hint_text: #90959c;
				--ink_elevation: #e8eaed;
				--ink_on_primary: #fff;
				--ink_on_primary_focused: hsla(0,0%,100%,0.12);
				--ink_on_primary_hovered: hsla(0,0%,100%,0.04);
				--ink_on_primary_pressed: hsla(0,0%,100%,0.1);
				--leading_icon: #72767d;
				--on_primary: #202124;
				--primary: #3cf;
				--primary_variant: #3cf;
				--promotion_variant: #c088ff;
				--report_chat: #1ee592;
				--report_closure: #feb87f;
				--report_crash: #d5d7db;
				--report_gas: #1bab50;
				--report_hazard: #ffc400;
				--report_jam: #ff5252;
				--report_place: #c088ff;
				--report_police: #1ab3ff;
				--safe: #1ee592;
				--safe_variant: #1ee592;
				--separator_default: #3c4043;
				--shadow_default: #000;
				--surface_alt: #18427c;
				--surface_default: #3c4043;
				--surface_variant: #3c4043;
				--surface_variant_blue: #1a3950;
				--surface_variant_green: #1f432f;
				--surface_variant_yellow: #4d421d;
				--surface_variant_orange: #4c342c;
				--surface_variant_red: #46292c;
				--surface_variant_purple: #3d285b;
				background-color: var(--background_default);
				color: var(--content_default);
				color-scheme: dark
			}	

			[wz-theme="dark"] #waze-logo {
				filter: invert(100%);
			}

			/* 'Show dismissed alerts again after' button */
			[wz-theme="dark"] .alert-settings .alert-settings-period-label {
				color: var(--content_p1);
				;
			}				

			[wz-theme="dark"] body {
				background-color: var(--background_default);
				color: var(--content_p1);
			}

			/* Background of all panes which pop in on left */
			[wz-theme="dark"] .tab-content {
				background: var(--background_default);
			}

			/* 'Map layers' pane */
			[wz-theme="dark"] .layer-switcher .menu {
				background: var(--background_default);
			}

			[wz-theme="dark"] h1,
			[wz-theme="dark"] h2,
			[wz-theme="dark"] h3,
			[wz-theme="dark"] h4,
			[wz-theme="dark"] h5,
			[wz-theme="dark"] h6,
			[wz-theme="dark"] .h1,
			[wz-theme="dark"] .h2,
			[wz-theme="dark"] .h3,
			[wz-theme="dark"] .h4,
			[wz-theme="dark"] .h5,
			[wz-theme="dark"] .h6 {
				color: var(--content_p1) !important;
			}
				
			[wz-theme="dark"] .label-text {
				color: var(--content_p1) !important;
			}

			/* Background of 'Add new Event' Under Events */
			[wz-theme="dark"] .mteListViewFooter--u_CxF {
				background: var(--background_default);
			}

			/* Footer background */
			[wz-theme="dark"] .wz-map-ol-footer {
				background-color: var(--background_default);
			}

			/* Links in footer */
			[wz-theme="dark"] a.wz-map-black-link {
				color: var(--content_p1);
			}

			[wz-theme="dark"] a {
				color: var(--content_p1);
			}

			/* Lat/Long in footer*/
			[wz-theme="dark"] .wz-map-ol-control-span-mouse-position {
				color: var(--content_p1);
			}

			/* Map imagery attribution */
			[wz-theme="dark"] .wz-map-ol-control-attribution {
				color: var(--content_p1);
			}

			/* Background of script list/buttons */
			[wz-theme="dark"] #sidebar .nav-tabs {
				background: var(--background_default);
			}

			/* Background of active script button */
			[wz-theme="dark"] #sidebar .nav-tabs li.active a {
				background: var(--always_dark_surface_default);
			}

			[wz-theme="dark"] .nav>li>a:hover {
				background: var(--always_dark_inactive);
			}

			/* Script button text */
			[wz-theme="dark"] #sidebar .nav-tabs li a {
				color: var(--content_p1);
			}

			/* Background of 'Update results when map moves' in Solve pane */
			[wz-theme="dark"] .issues-tracker-wrapper .issues-tracker-footer {
				background: var(--background_default);
			}

			/* Route Speeds Plugin */
			[wz-theme="dark"] #sidepanel-routespeeds {
				color: var(--content_p1) !important;
			}

			[wz-theme="dark"] #routespeeds-passes-label {
				color: var(--content_p1) !important;
			}

			[wz-theme="dark"] .waze-btn.waze-btn-blue {
				color: white !important;
			}
			
    /* Textboxes/Dropdowns/Input Feilds */
			[wz-theme="dark"] input[type=text] {
		color: black !important; /* for to use with house numbering*/
    }
			[wz-theme="dark"] input[type=email],
			[wz-theme="dark"] input[type=number],
			[wz-theme="dark"] input[type=password],
			[wz-theme="dark"] select,
			[wz-theme="dark"] button,
			[wz-theme="dark"] textarea,
			[wz-theme="dark"] .form-control {
				//color: var(--content_p2) !important;
		color: white !important;	
			}

			/* TTS Playback dialog */
			[wz-theme="dark"] .tts-playback .tippy-box[data-theme=tts-playback-tooltip] {
				background: var(--background_default);
				box-shadow: rgb(213, 215, 219) 0px 0px 0px 1px
			}

			[wz-theme="dark"] a:hover,
			[wz-theme="dark"] a:visited {
				color: var(--content_p1);
			}

			/*user editor environment panel*/
			[wz-theme="dark"] #environmentSelect {
				background-color: var(--background_default) !important;
			}

			[wz-theme="dark"] .leaflet-control-layers-expanded {
				background-color: var(--background_default) !important;
				color: var(--content_p1);
			}

			/* UR section headers */
			[wz-theme="dark"] .problem-edit .section .title {
				background-color: var(--always_dark_inactive);
				color: var(--content_p1);
				border-bottom: 1px solid var(--always_dark_surface_default);
				border-top: 1px solid var(--always_dark_surface_default);
			}

			[wz-theme="dark"] .issue-panel-header .sub-title-and-actions {
				color: var(--content_p2);
			}

			[wz-theme="dark"] .conversation-view .comment-list {
				border: 1px solid var(--always_dark_surface_default);
			}

			/* 'Search This Area' box */
			[wz-theme="dark"] .container--wzXTu {
				background: var(--background_default);
			}

			/* 'Filter Map issues' pane */
			[wz-theme="dark"] #filter-panel-region {
				background: var(--background_default);
			}

			/* PL box */
			[wz-theme="dark"] [class^="container"]::after {
				background: var(--always_dark_surface_default);
				height: 2px;
			}

			/* Changelog */
			[wz-theme="dark"] [class^="changesLogContainer"] {
				background: var(--background_default);
			}

			/* Online editors */
			[wz-theme="dark"] .online-editors-bubble {
				--wz-button-background-color: var(--always_dark_surface_default);
				--wz-button-border: var(--always_dark_surface_default);
			}

			[wz-theme="dark"] .online-editors-bubble:hover {
				--wz-button-background-color: var(--always_dark_inactive);
				--wz-button-border: var(--always_dark_surface_default);
			}

			/* Entry Point Buttons */
			[wz-theme="dark"] .navigation-point-actions>wz-button {
				--wz-button-background-color: var(--always_dark_surface_default);
				--wz-button-border: var(--always_dark_surface_default);
			}

	/* WME Switch Uturns */
			[wz-theme="dark"] .disallow-connections,
			[wz-theme="dark"] .allow-connections {
				--wz-button-background-color: var(--always_dark_surface_default);
			}

    /* PL box */
			[wz-theme="dark"] [class^="bordered"] * {
				background-color: var(--background_default);
			}

    /* Turn Restrictions */
			[wz-theme="dark"] .restriction-editing-region .restriction-editing-section .restriction-editing-container {
				background-color: var(--always_dark_surface_default);
			}

			[wz-theme="dark"] .form-control {
				background: var(--always_dark_surface_default);
			}

			[wz-theme="dark"] .timeframe-hours-controls {
				--background_variant: var(--always_dark_inactive);
			}

			[wz-theme="dark"] .restriction-editing-region .timeframe-editing-region .timeframe-section-dates .datepicker {
				color: black !important;
			}

			[wz-theme="dark"] .restrictions-summary .restrictions-table tr {
				background: var(--always_dark_surface_default) !important;
			}

			[wz-theme="dark"] .restrictions-summary .restrictions-table th {
				background: var(--always_dark_inactive) !important;
			}
			
    /* Turn Instructions */
			[wz-theme="dark"] .turn-instructions-panel .exit-signs,
			[wz-theme="dark"] .turn-instructions-panel .turn-instructions,
			[wz-theme="dark"] .turn-instructions-panel .towards-instructions {
				background: var(--always_dark_surface_default);
			}

			[wz-theme="dark"] .turn-instructions-panel .exit-sign-item,
			[wz-theme="dark"] .turn-instructions-panel .turn-instruction-item {
				background: var(--always_dark_surface_default);
				border: 1px dashed var(--always_dark_inactive);
			}

			[wz-theme="dark"] .wz-tooltip-content-holder {
				background-color: var(--background_default);
			}

    /* Date Range Pickers */
			[wz-theme="dark"] .daterangepicker {
				background-color: var(--background_default) !important;
				border: 1px solid black;
			}
			
			[wz-theme="dark"] .daterangepicker .calendar-table {
				background-color: var(--background_default);
			}

			[wz-theme="dark"] .daterangepicker td.off {
				background-color: var(--background_default);
				color: var(--content_p1);
			}

			[wz-theme="dark"] .daterangepicker td.active {
				background-color: #357ebd !important;
			}

			[wz-theme="dark"] .daterangepicker .available {
				background-color: var(--always_dark_surface_default);
			}

			[wz-theme="dark"] .daterangepicker td.today {
				background-color: var(--always_dark_surface_default);
				border: 2px solid var(--safe);
			}

			[wz-theme="dark"] .daterangepicker .calendar-table .next span,
			[wz-theme="dark"] .daterangepicker .calendar-table .prev span {
				border: solid var(--content_p1);
				border-width: 0 2px 2px 0;
			}
			
    /* House Numbers */
			[wz-theme="dark"] .house-number-marker {
				background: var(--background_default);
			}

			[wz-theme="dark"] .house-numbers-layer .house-number .content .input-wrapper {
				background-color: #07ff00 !important; /* Bright Green */
			}

/******* UR Comment - Enhancement *****************************/
			[wz-theme="dark"] #urceDiv {
				background-color: var(--background_default) !important;
				box-shadow: 5px 5px 10px black !important;
			}
			
			[wz-theme="dark"] .urceDivCloseButton {
				background-color: var(--surface_default) !important;
				box-shadow: 5px 5px 10px black !important;
			}

    /* Button text color */
			[wz-theme="dark"] .btn.btn-default {
				color: var(--content_p1);
				background-color: var(--always_dark_surface_default) !important;
			}

	/* URC-E Plugin */
			[wz-theme="dark"] #sidepanel-urc-e #panel-urce-comments .URCE-openLink {
				color: var(--content_p3) !important;
			}

			[wz-theme="dark"] .URCE-span {
				color: var(--content_p1);
			}

			[wz-theme="dark"] .urceToolsButton {
				background-color: var(--always_dark_surface_default) !important;
			}

			[wz-theme="dark"] #zoomOutLink1,
			[wz-theme="dark"] #zoomOutLink2,
			[wz-theme="dark"] #zoomOutLink3 {
				color: var(--content_p1) !important;
			}

    /* Grey screen when your save has errors */
			[wz-theme="dark"] #map-viewport-overlay {
				background-color: var(--background_default);
			}

    /* default background is not super noticble here, so we do black */
			[wz-theme="dark"] #sidebar .overlay.editingDisabled {
				background-color: black;
			}

    /* Notification pane */
			[wz-theme="dark"] .notifications-empty-container .centered-content .text {
				color: var(--content_p1);
			}

			[wz-theme="dark"] .notification-content-container .notification-content-text-container .body {
				color: var(--content_p1) !important;
			}
   
   /* City Names */
			[wz-theme="dark"] .city-name-marker,
			[wz-theme="dark"] #edit-panel .city-feature-editor .feature-editor-header {
				background-color: var(--background_default);
			}

			[wz-theme="dark"] .city-name-marker:hover,
			[wz-theme="dark"] .city-name-marker.selected {
				color: black;
			}

	/* WMEPH Plugin */
			/* These are gray icons. We can either make a white border per icon or put a white boarder around all of them */
			[wz-theme="dark"] #WMEPH_services {
				background-color: white;
			}

			/*
			[wz-theme="dark"] .serv-valet {
				filter: invert(100%);
			}

			[wz-theme="dark"] .serv-wifi {
				filter: invert(100%);
			}

			[wz-theme="dark"] .serv-restrooms {
				filter: invert(100%);
			}

			[wz-theme="dark"] .serv-credit {
				filter: invert(100%);
			}

			[wz-theme="dark"] .serv-reservations {
				filter: invert(100%);
			}

			[wz-theme="dark"] .serv-outdoor {
				filter: invert(100%);
			}

			[wz-theme="dark"] .serv-ac {
				filter: invert(100%);
			}

			[wz-theme="dark"] .serv-parking {
				filter: invert(100%);
			}

			[wz-theme="dark"] .serv-curbside {
				filter: invert(100%);
			}

			[wz-theme="dark"] .serv-wheelchair {
				filter: invert(100%);
			}

			[wz-theme="dark"] .serv-247 {
				filter: invert(100%);
			}
			*/

			[wz-theme="dark"] #WMEPH_banner .banner-row.gray {
				color: var(--content_p1) !important;
				background-color: var(--surface_default) !important;
			}

			[wz-theme="dark"] #wmeph-hours-list {
				color: var(--content_p1) !important;
				background-color: var(--background_default) !important;
			}

			[wz-theme="dark"] #WMEPH_banner .wmeph-btn {
				background-color: var(--background_default) !important;
			}

			[wz-theme="dark"] .lock-edit-view>wz-label {
				background-color: var(--background_default)
			}
			
    /* Click Saver */
			[wz-theme="dark"] .cs-group-label {
				color: var(--content_p1) !important;
			}

    /* Turn, Segment Closures */
			[wz-theme="dark"] .edit-closure {
				background: var(--background_default) !important;
			}
			
			[wz-theme="dark"] .closure-node-item {
				background-color: var(--background_default) !important;
			}

			[wz-theme="dark"] .closure-item .dates {
				color: var(--content_p1) !important;
			}

			[wz-theme="dark"] [class^="welcome_popup_container"] {
				background-color: var(--background_default);
			}

			[wz-theme="dark"] [class^="welcome_popup_image"] {
				filter: invert(87%);
			}
			
    /* Previous Build dialog */
			[wz-theme="dark"] #map-message-container .snapshot-message .snapshot-mode-message {
				background: var(--background_default) !important;
			}
			
    /* Script update message */
			[wz-theme="dark"] #WWSU-Container,
			[wz-theme="dark"] .WWSU-script-item,
			[wz-theme="dark"] #WWSU-script-update-info {
				background-color: var(--background_default) !important;
			}

    /* WME Toolbox Extension */
			[wz-theme="dark"] .tb-tabContainer {
				background-color: var(--background_default) !important;
			}

			[wz-theme="dark"] .tb-tab-tab {
				background-color: var(--background_default) !important
			}

			[wz-theme="dark"] .tb-tab-tab>img {
				filter: invert(100%);
			}

			[wz-theme="dark"] .tb-feature-label-image {
				filter: invert(87%);
			}

			[wz-theme="dark"] .ToolboxMeasurementTool {
				background-color: var(--background_default) !important;
			}

			[wz-theme="dark"] #Country,
			[wz-theme="dark"] #State,
			[wz-theme="dark"] #City,
			[wz-theme="dark"] #Street {
				color: var(--content_p1) !important;
			}

			[wz-theme="dark"] .ui-dialog-buttonset>button {
				background-color: var(--background_default) !important;
				color: var(--content_p1) !important;
			}
			
    /* .ui-widget-content.newversionpanel, .ui-widget-content.ui-dialog-buttonpane, .WMETB_NewVersionPanel.ui-widget-content { */
			[wz-theme="dark"] .ui-widget-content,
			[wz-theme="dark"] .ui-state-default,
			[wz-theme="dark"] .ui-widget-content .ui-state-default,
			[wz-theme="dark"] .ui-widget-header .ui-state-default {
				color: var(--content_p1) !important;
	background: rgba(0, 0, 0, 0.50) !important; /* overrided */
	        } 

			[wz-theme="dark"] .ui-widget-content a {
				color: var(--content_p1) !important;
			}

			[wz-theme="dark"] .ui-widget-header,
			[wz-theme="dark"] #WMETB_NewVersionPanel {
				color: var(--content_p1) !important;
				background: var(--background_default) !important;
			}

			[wz-theme="dark"] .ui-button.ui-widget.ui-state-default.ui-corner-all.ui-button-icon-only.ui-dialog-titlebar-close {
				background-color: var(--background_default) !important;
				color: var(--content_p1) !important;
				border: 1px solid var(--always_dark_inactive) !important;
			}

			[wz-theme="dark"] .ui-widget-overlay {
				background: black !important
			}

    /* Editor info -------------------------------------- */
			[wz-theme="dark"] #header {
				background-color: var(--background_default);
			}

			[wz-theme="dark"] #header .user-headline .header-info {
				background-color: var(--always_dark_surface_default);
			}

			[wz-theme="dark"] #recent-edits .recent-edits-list .recent-edits-list-header {
				background-color: var(--background_default);
			}

			[wz-theme="dark"] #recent-edits .recent-edits-list .recent-edits-list-items .transaction-header {
				background-color: var(--always_dark_surface_default);
			}

			[wz-theme="dark"] #recent-edits .recent-edits-list .recent-edits-list-items .transaction-header.active,
			[wz-theme="dark"] #recent-edits .recent-edits-list .recent-edits-list-items .transaction-header:hover {
				background-color: var(--always_dark_background_default);
			}

			[wz-theme="dark"] #recent-edits .recent-edits-list .recent-edits-list-items .transaction-content {
				background-color: var(--always_black);
			}

			[wz-theme="dark"] .type-icon {
				filter: invert(100%);
			}

			[wz-theme="dark"] .map .leaflet-tile-pane {
				filter: grayscale(100%) brightness(0.8) contrast(160%) invert(77%)
			}

			[wz-theme="dark"] #recent-edits .recent-edits-map-polygon {
				fill: white;
			}

   /* Practice Mode intro text */
			[wz-theme="dark"] .sandbox .links a {
				color: var(--content_p1);
			}

			[wz-theme="dark"] .sandbox .welcome-container {
				background-color: var(--background_default);
			}

    /************* UR List ********************************/
			[wz-theme="dark"] .list-item-card-title {
				color: var(--content_p1) !important;
			}

			[wz-theme="dark"] .list-item-card wz-caption {
				color: var(--content_p2) !important;
			}

/******* Road Selector Plugin ******************************************/
			[wz-theme="dark"] .table-striped>tbody>tr:nth-of-type(odd) {
				background-color: var(--always_dark_surface_default);
			}

			[wz-theme="dark"] .table-hover>tbody>tr:hover {
				background-color: var(--always_dark_inactive);
			}

			[wz-theme="dark"] #outRSExpr {
				color: var(--content_p2);
			}

			[wz-theme="dark"] #RSoperations>button,
			[wz-theme="dark"] #RSselection>button,
			[wz-theme="dark"] #btnRSSave {
				color: white !important;
			}

   [wz-theme="dark"] #inRSSaveName,
   [wz-theme="dark"] tbody input[type="text"], 
   [wz-theme="dark"] tbody input[type="number"] {
   color: var(--content_p1) !important; /* font color overrided */
    } 

   /* UR-MP Tracking Plugin */
			[wz-theme="dark"] .popup-pannel-trigger-class-FilterUR,
			[wz-theme="dark"] .popup-pannel-contents-closed-class-FilterUR,
			[wz-theme="dark"] .popup-pannel-contents-open-class-FilterUR,
			[wz-theme="dark"] .popup-pannel-trigger-class-FilterMP,
			[wz-theme="dark"] .popup-pannel-contents-closed-class-FilterM,
			[wz-theme="dark"] .popup-pannel-contents-open-class-FilterMP,
			[wz-theme="dark"] .popup-pannel-trigger-class-FilterMC,
			[wz-theme="dark"] .popup-pannel-contents-closed-class-FilterMC,
			[wz-theme="dark"] .popup-pannel-contents-open-class-FilterMC,
			[wz-theme="dark"] .popup-pannel-trigger-class-FilterPUR,
			[wz-theme="dark"] .popup-pannel-contents-closed-class-FilterPUR,
			[wz-theme="dark"] .popup-pannel-contents-open-class-FilterPUR {
				color: black !important;
			}

			[wz-theme="dark"] .urt-table {
				color: var(--content_p1);
			}

			[wz-theme="dark"] .urt-table thead,
			[wz-theme="dark"] .urt-table thead a,
			[wz-theme="dark"] .urt-table thead a:hover {
				color: black !important;
			}

			[wz-theme="dark"] .urt-bg-highlighted,
			[wz-theme="dark"] .urt-bg-highlighted a,
			[wz-theme="dark"] .urt-bg-highlighted a:hover {
				color: black !important;
			}

			[wz-theme="dark"] .urt-bg-ifollow {
				color: var(--content_p1);
				background-color: var(--always_dark_inactive) !important;
			}

			[wz-theme="dark"] .urt-bg-selected,
			[wz-theme="dark"] .urt-bg-selected a,
			[wz-theme="dark"] .urt-bg-selected a:hover {
				color: black !important;
			}

			[wz-theme="dark"] .urt-bg-newcomments {
				color: black !important;
			}

			[wz-theme="dark"] #urt-a-export>img {
				filter: invert(100%);
			}

			[wz-theme="dark"] #urt-a-export-csv>img {
				filter: invert(100%);
			}

			[wz-theme="dark"] #urt-progressBarInfo {
				color: black !important;
			}

	/* WME Advanced Closures - Plugin */
			[wz-theme="dark"] .wmeac-closuredialog,
			[wz-theme="dark"] .wmeac-closuredialog h1,
			[wz-theme="dark"] #wmeac-csv-closures-log:before,
			[wz-theme="dark"] #wmeac-csv-closures-preview:before {
				background-color: var(--background_default) !important;
			}

			[wz-theme="dark"] .wmeac-closuredialog,
			[wz-theme="dark"] .wmeac-tab-pane,
			[wz-theme="dark"] .wmeac-nav-tabs>li>a,
			[wz-theme="dark"] .wmeac-nav-tabs>li:not(.active)>a,
			[wz-theme="dark"] #wmeac-csv-closures-preview,
			[wz-theme="dark"] #wmeac-csv-closures-log {
				border: 1px solid black !important;
			}

			[wz-theme="dark"] .wmeac-nav-tabs>li:not(.active)>a {
				background-color: var(--always_dark_inactive) !important;
			}

			[wz-theme="dark"] .wmeac-closuredialog button {
				background-color: var(--always_dark_inactive) !important;
			}

	/* URO+ Plugin */
			[wz-theme="dark"] .uroAlerts * {
				background-color: var(--background_default) !important;
			}

			[wz-theme="dark"] #_tabURs,
			[wz-theme="dark"] #_tabMPs,
			[wz-theme="dark"] #_tabMCs,
			[wz-theme="dark"] #_tabRTCs,
			[wz-theme="dark"] #_tabRAs,
			[wz-theme="dark"] #_tabPlaces,
			[wz-theme="dark"] #_tabMisc,
			[wz-theme="dark"] #uroDiv {
				background-color: var(--background_default) !important;
			}
			
			[wz-theme="dark"] #uroCommentCount>div {
				color: black !important;
				filter: invert(1);
			}

			[wz-theme="dark"] #uroDiv {
				box-shadow: 5px 5px 10px black !important;
			}

   /* DOT Advisories Plugin */
			[wz-theme="dark"] #gmPopupContainer {
				background-color: var(--background_default) !important;
			}
			
   /* Waze Edit Count Monitor Plugin*/
			[wz-theme="dark"] .secondary-toolbar .toolbar-button {
				background-color: var(--background_default) !important;
			}
			
			[wz-theme="dark"] #wecm-count {
				color: var(--content_p1) !important;
			}

    /* External Provider buttons */
			[wz-theme="dark"] .external-provider-action {
				--wz-button-background-color: var(--always_dark_surface_default);
			}
				
	/*Place alternative name delete icon*/
			[wz-theme="dark"] .aliases .alias-item-actions {
				--wz-button-background-color: var(--always_dark_surface_default);
			}

	/*Lanes and road width*/
			[wz-theme="dark"] .direction-lanes .lane-instruction .drawing .letter-circle {
				background-color: var(--background_default) !important;
			}
	
	/*WME Segment city tool*/
			[wz-theme="dark"] #wmesct-container .ts-control,
			[wz-theme="dark"] .ts-control input,
			[wz-theme="dark"] .ts-dropdown {
				color: var(--content_p1) !important;
			}
			
			[wz-theme="dark"] #wmesct-container .ts-dropdown {
				background-color: var(--background_default) !important;
			}

			[wz-theme="dark"] .wmesct-clear-cities-button,
			[wz-theme="dark"] .waze-btn.waze-btn-green {
				background-color: var(--always_dark_surface_default) !important;
			}

			[wz-theme="dark"] #wmesct-container .ts-dropdown .option.active {
				background-color: black !important;
			}
			
	/*********** WME FUME *************************************/
	[wz-theme="dark"] .yslider-stops,
	[wz-theme="dark"] .olButton,
	[wz-theme="dark"] .olControlPanZoomBar,
	[wz-theme="dark"] .slider {
	background-color: var(--background_default) !important;
	}
	
    /* I am not 100% positive this was the FUME update box */
			[wz-theme="dark"] #abAlerts {
				box-shadow: black 5px 5px 10px !important;
				border-color: black !important;
			}
			
			[wz-theme="dark"] #abAlerts,
			[wz-theme="dark"] #abAlerts #header,
			[wz-theme="dark"] #abAlerts #content {
				background-color: var(--background_default) !important;
			}
			
    /* For some reason background variant does not work at this point. Hardcode color for now. */
			[wz-theme="dark"] #abAlertTickBtn {
				background-color: #3c4043 !important;
			}
	
	/*RA Util window*/
			[wz-theme="dark"] #RAUtilWindow,
			[wz-theme="dark"] #SSUtilWindow {
				background-color: var(--background_default) !important;
			}

			[wz-theme="dark"] #rotationAmount,
			[wz-theme="dark"] #shiftAmount {
				color: white !important;
			}
			
/******E50 Geometry information Script ********************************************/
			[wz-theme="dark"] .e50 fieldset legend,
			[wz-theme="dark"] .e50 li a:hover,
			[wz-theme="dark"] .e50 li a.noaddress:hover {
				background-color: var(--always_dark_surface_default) !important;
			}
			
			[wz-theme="dark"] .wme-ui-panel-container,
			[wz-theme="dark"] .wme-ui-close-panel,
			[wz-theme="dark"] .e50 li a.noaddress,
			[wz-theme="dark"] .e50 .wme-ui-body {
				background-color: var(--background_default) !important;
			}

			[wz-theme="dark"] .wme-ui-close-panel:after {
				filter: invert(1.0);
			}

			[wz-theme="dark"] legend {
				color: var(--content_p1) !important;
			}
			
    [wz-theme="dark"] .controls-container.e50 input {
    color: var(--content_p2) !important;  /*color overrided*/
    }
	
/**********************Address Point Helper*****************************/
			[wz-theme="dark"] .waze-btn.waze-btn-white {
				background-color: var(--background_default) !important;
			}

			[wz-theme="dark"] #edit-panel .control-label,
			[wz-theme="dark"] .edit-panel .control-label {
				color: var(--content_p1) !important;
			}

			/* WME OpenData Plugin */
			[wz-theme="dark"] #oslDragBar {
				background-color: var(--background_default) !important;
				box-shadow: black 5px 5px 10px !important;
			}

			[wz-theme="dark"] #oslWindow {
				box-shadow: black 5px 5px 10px !important;
				border: 1px solid black !important
			}

			[wz-theme="dark"] #oslOSLDiv {
				background-color: var(--always_dark_surface_default) !important;
			}

			[wz-theme="dark"] #oslSelect {
				background-color: var(--background_default) !important;
			}

			[wz-theme="dark"] #oslSegGeoUIDiv {
				background-color: var(--background_default) !important;
			}

			[wz-theme="dark"] #oslGazTagsDiv {
				background-color: var(--always_dark_surface_default) !important;
			}

			[wz-theme="dark"] #oslNCDiv {
				background-color: var(--background_default) !important;
			}

			[wz-theme="dark"] #oslMLCDiv {
				background-color: var(--always_dark_surface_default) !important;
			}
			
/**********************WME Geometries************************************/
			[wz-theme="dark"] .geometries-cb-label {
				color: var(--content_p1) !important;
			}
	
/***********************WME Route Checker*******************************/
			[wz-theme="dark"] #routeTest>p>b {
				color: white !important;
			}
			
/*Show routes between these 2 segments*/
			[wz-theme="dark"] a#goroutes {
				color: var(--content_p1) !important;
			}
			
			[wz-theme="dark"] #routeTest a.step:hover {
				background-color: var(--always_dark_surface_default) !important;
			}

			[wz-theme="dark"] #routeTest p.route {
				background-color: var(--background_default) !important;
			}

			/*for generated road segments name via route checker*/
			[wz-theme="dark"] a.step span {
				color: white !important;
			}

			/*Route step by step direction*/
			[wz-theme="dark"] #routeTest a.step {
				color: var(--content_p1) !important;
			}
	
/******************* WME Validator *************************************/
			[wz-theme="dark"] c2821834349>input:disabled+label,
			[wz-theme="dark"] .c2821834349>input:disabled+label {
				color: var(--content_p1) !important;
			}

			[wz-theme="dark"] .c3584528711>span,
			[wz-theme="dark"] .c2952996808,
			[wz-theme="dark"] .c2821834349>input:checked+label {
				background-color: var(--background_default) !important;
			}

			[wz-theme="dark"] .c3336571891>span {
				background-color: var(--always_dark_surface_default) !important;
			}

			[wz-theme="dark"] .c2821834349>label {
				background-color: var(--always_dark_surface_default) !important;
			}

			[wz-theme="dark"] .c3210313671>button:disabled {
				background-color: var(--always_dark_surface_default) !important;
			}
			
/***** Re-lock Segments & POI***********************************************/	
			[wz-theme="dark"] .tg .tg-header {
				background-color: var(--always_dark_surface_default) !important;
			}
	
/***** WME Locksmith *****************************************************/ 
			[wz-theme="dark"] .ls-Wrapper {
				background-color: var(--background_default) !important;
			}

			[wz-theme="dark"] .ls-Options-Dropdown-Menu {
				background-color: var(--always_dark_surface_default) !important;
			}

			[wz-theme="dark"] .ls-Options-Dropdown-Menu li:hover,
			[wz-theme="dark"] .ls-Options-Menu:hover {
				background-color: var(--always_dark_inactive) !important;
				border: var(--always_dark_surface_default) !important;
			}

			[wz-theme="dark"] .ls-Button {
				background-color: var(--always_dark_surface_default) !important;
			}

			[wz-theme="dark"] label.ls-Attr-Label {
				color: black;
			}

			[wz-theme="dark"] a#lsConnectionStatus {
				background-color: var(--always_dark_inactive) !important;
			}

/**** Wide Area Lens ******************************************************/	
			[wz-theme="dark"] .btn.btn-primary {
				background-color: var(--always_dark_surface_default) !important;
			}

/**** Closure helper ******************************************************/
    [wz-theme="dark"] .wmech_closurebutton.wmech_presetdeletebutton,
	[wz-theme="dark"] button#wmechButton1.wmech_closurebutton {
	background-color: var(--always_dark_surface_default) !important;
	}
	
			[wz-theme="dark"] .wmech_closurebutton.wmech_presetsavebutton {
				background-color: var(--background_default) !important;
			}

			[wz-theme="dark"] .wmech-alert {
				background-color: var(--always_dark_surface_default) !important;
			}

			[wz-theme="dark"] .nav-tabs>li>a:hover {
				background-color: var(--always_dark_inactive) !important;
			}

			[wz-theme="dark"] #wmech_mteradiosdiv {
				background-color: var(--always_dark_surface_default) !important;
			}
			
			[wz-theme="dark"] div[id^="wmech_presetrow"] input[type="text"],
			[wz-theme="dark"] #wmech-settings-boxes input,
			[wz-theme="dark"] #wmech-settings-boxes #wmech_settingcustomcs {
				color: var(--content_p2) !important;
			}
			
			[wz-theme="dark"] #uroAlerts,
			[wz-theme="dark"] #content {
				background-color: var(--background_default) !important;
			}

/****** Place Interface Enhancement PIE **************************************/
    [wz-theme="dark"] #divPlaceFilter #piePlaceFilter,
	[wz-theme="dark"] #divPlaceNamesFontCustomization input {
    color: var(--content_p1) !important; /* overrided */
    } 

/****** Open Other Maps OOM **************************************/
    [wz-theme="dark"] fieldset #txtOOMLanguage,
	[wz-theme="dark"] #txtOOMMyMapLink {
    color: var(--content_p2) !important; /* Overrided */
    } 

/*********** EVCS Icons *************************************************/  
			[wz-theme="dark"] wz-image-chip img {
				filter: invert(100%);
			}
	
/*********** WME Wazebar ***********************************************/
			[wz-theme="dark"] #WazeBarSettings,
			[wz-theme="dark"] .flex-column,
			[wz-theme="dark"] #Wazebar {
				background-color: var(--background_default) !important;
				color: var(--content_p2) !important;
			}
			
			[wz-theme="dark"] #WazeBarAddCustomLink {
				background-color: var(--always_dark_surface_default) !important;
				/*its add button*/
			}
			
			[wz-theme="dark"] #WazeBarSettings label,
			[wz-theme="dark"] .WazeBarText {
				color: var(--content_p2) !important;
			}

			[wz-theme="dark"] #WazeBarSettings input[type='number'],
			[wz-theme="dark"] #WazeBarSettings input[type='text'],
			[wz-theme="dark"] #WazeBarSettings textarea,
			[wz-theme="dark"] #colorPickerForumFont,
			[wz-theme="dark"] #colorPickerWikiFont {
				background-color: var(--background_default) !important;
				border: 1px solid var(--always_dark_surface_default) !important;
			}
			
			[wz-theme="dark"] .styled-select,
			[wz-theme="dark"] .state-header {
				background: var(--always_dark_inactive) !important;
			}

			[wz-theme="dark"] #WazeBarFavorites {
				background: var(--always_dark_inactive) !important;
			}

			[wz-theme="dark"] .favorite-item,
			[wz-theme="dark"] .favorite-item a {
				background: var(--always_dark_surface_default) !important;
				color: var(--content_p2) !important;
			}

			[wz-theme="dark"] #WazeBarFavoritesAddContainer input {
				background-color: var(--background_default) !important;
			}

			[wz-theme="dark"] #WazeBarAddFavorite {
				background-color: var(--always_dark_surface_default) !important;
				/*its add button*/
				border: 2px solid var(--always_dark_inactive) !important;
			}

			[wz-theme="dark"] #WazeBarAddFavorite:hover {
				color: var(--content_p1) !important;
				background-color: var(--background_default) !important;
				border-color: var(--always_dark_surface_default) !important;
			}

			[wz-theme="dark"] #WazeBarAddCustomLink:hover {
				color: var(--content_p1) !important;
				background-color: var(--always_dark_inactive) !important;
				border-color: var(--always_dark_surface_default) !important;
			}

			[wz-theme="dark"] .favorite-item i,
			[wz-theme="dark"] .custom-item i {
				color: var(--content_p1) !important;
				/*red close icon*/
			}

			[wz-theme="dark"] .custom-item,
			[wz-theme="dark"] .custom-item a {
				background: var(--always_dark_inactive) !important;
				color: var(--content_p2) !important;
			}

            [wz-theme="dark"] #editing-activity .mercury-bg {
                opacity: .03;
            }

            [wz-theme="dark"] .wz-chat-header-btn {
                filter: invert(1);
            }

            [wz-theme="dark"] .wz-chat-header-btn .icon:hover {
                /* This is being inverted for the chat bubble. We want black,
                   so we say white */
                background-color: white !important;
            }
			
/************************ Waze Editor Profile Enhancement *****************************************/			
			[wz-theme="dark"] .nav-tabs>li.active>a {
			background-color: var(--always_dark_inactive) !important;
			color: var(--content_p1) !important;
			}
			
			[wz-theme="dark"] .s-button.s-button--mercury {
				background-color: var(--always_dark_surface_default);
				}
				
			[wz-theme="dark"] #wpeWKT {
				background-color: var(--background_default) !important;
				box-shadow: var(--always_dark_inactive) 5px 5px 10px 4px !important;				
				}
				
			[wz-theme="dark"] #recent-edits .recent-edits-list .recent-edits-load-more {
				background-color: var(--background_default) !important;
			}

			[wz-theme="dark"] .modal-content {
				background-color: var(--background_default) !important; /*find more mentee dialogue box*/
				border: 1px solid #999 !important;
			}
			
/************************* Waze Discuss Header *****************************************************/			
			[wz-theme="dark"] .category-title-header .category-title-name h1 {
				color: #434343 !important;
			}
`;

    // This CSS block cannot be part of the 'theme' because the base pallete
    // does not exist inside the element we are modifying it, and it seems
    // overkil to add it for one element.
    const UR_text_area = `
			.wz-textarea .wz-textarea-inner-container textarea {
				background-color: white;
				color: black !important;
				filter: invert(1.0);
				border-color: white !important;
			}`;

    function setTheme() {
        const theme = getPreferredTheme();

        if (theme == 'auto') {
            // If the theme is auto, look up the system theme
            document.documentElement.setAttribute('wz-theme', (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'));
        } else {
            document.documentElement.setAttribute('wz-theme', theme);
        }
    }

    function changeToLight() {
        setPreferredTheme('light');
    }
    function changeToDark() {
        setPreferredTheme('dark');
    }
    function changeToAuto() {
        setPreferredTheme('auto');
    }

    // The toggle toggles between light and the last theme ('dark' or 'auto')
    // Since this only runs when the toggle is clicked, when being turned 'on',
    // the current theme will always be light, which will make the last theme
    // always dark or auto.
    function toggleTheme(event) {
        let theme = "light";

        if (event.target.checked) {
            if (getPreviousTheme() == "auto") {
                theme = "auto";
            } else {
                theme = "dark";
            }
        }		 

        setPreferredTheme(theme);

        // The local storage listener will do the actual theme change.
        // We do not need to call setTheme(...) ecplicitly here.
    }

    // Function to inject styles into the page
    function injectStyle() {
        let styleElement = document.createElement('style');
        styleElement.innerHTML = cssModifications;
        document.head.appendChild(styleElement);
    }

    function addProfileToggle() {
        let userBox = document.querySelector('wz-user-box');
        let wzMenuItem = userBox?.querySelector('wz-menu-item');

        if (!wzMenuItem) {
            if(profileTries <= maxUIRetries) {
                profileTries++;
                setTimeout(() => addProfileToggle(), 1000);
            } else {
                console.log('wz-user-box not found.');
            }
            return;
        }

        let darkModeMenuItem  = document.createElement('wz-menu-item');

        darkModeMenuItem.style     = 'pointer-events: none; border-bottom: 1px solid var(--separator_default, #e8eaed);';
        darkModeMenuItem.innerHTML = `<wz-toggle-switch style="pointer-events: all;" checked="true" tabindex="0" name="wmeDarkMode" id="wme-dark-mode_switch">Dark Mode<input type="checkbox" name="wmeDarkMode" value="" style="display: none; visibility: hidden;"></wz-toggle-switch>`;

        userBox.insertBefore(darkModeMenuItem, wzMenuItem);

        darkModeSwitch = document.getElementById('wme-dark-mode_switch');
        darkModeSwitch.addEventListener('change', toggleTheme);

        // We technically call updateUI() twice since it is called per toggle option,
        // but repeatedly calling this function is harmless.
        updateUI();
    }

    function addSettingsToggle() {
        let settingsDiv = document.querySelector('.settings');

        if (!settingsDiv && settingsTries <= maxUIRetries) {
            setTimeout(() => addSettingsToggle(), 1000);
            settingsTries++;
            return;
        }

        if (!settingsDiv) {
            console.log('Settings div with class "settings" not found.');
            settingsTries = 0;
            return;
        }

        const formDiv = settingsDiv.querySelector('.settings__form');

        if (formDiv) {
            const newDiv = document.createElement('div');
            newDiv.classList.add('settings__form-group', 'dark-mode');

            const modeSelectionHTML = `
                <div class="theme-select">
                    <wz-label class="themes-select__label" html-for="">
                        Color Theme
                    </wz-label>
                    <wz-button id="button_light_theme" color="primary" size="sm" value="">
                        Light
                    </wz-button>
                    <wz-button id="button_dark_theme" color="secondary" size="sm" value="">
                        Dark
                    </wz-button>
                    <wz-button id="button_auto_theme" color="secondary" size="sm" value="">
                        Auto (Dark)
                    </wz-button>
                </div>
                `;

            newDiv.innerHTML = modeSelectionHTML;

            formDiv.appendChild(newDiv);

            // Get the wz-button by its ID
            lightButton = document.getElementById('button_light_theme');
            darkButton  = document.getElementById('button_dark_theme');
            autoButton  = document.getElementById('button_auto_theme');

            lightButton.addEventListener('click', changeToLight);
            darkButton.addEventListener('click', changeToDark);
            autoButton.addEventListener('click', changeToAuto);

            // We technically call updateUI() twice since it is called per toggle option,
            // but repeatedly calling this function is harmless.
            updateUI();
        } else {
            console.log('Form div with class "settings__form" not found.');
        }
    }
		   
    function addThemeToggleButtons() {
        addProfileToggle();
        addSettingsToggle();
    }

    function FUMECheck() {
        let FUMEuiContrast = document.getElementById('_inpUIContrast');

        if (FUMEuiContrast && FUMEuiContrast.options[FUMEuiContrast.selectedIndex].text != "None") {
            const fumeWarningMessage = `FUME UI Enhancements detected with contrast enhancements set to ` +
                                        `${FUMEuiContrast.options[FUMEuiContrast.selectedIndex].text}. Please ` +
                                        `set 'contrast enhancement' to 'none' to make WME Dark Mode work correctly.`;
            // Use a long timeout to make sure the user acknowledges this message
            // since it does break the plugin if not fixed.
            WazeWrap.Alerts.info('Dark Mode - FUME UI Contrast Warning', fumeWarningMessage, false, false, 60000);
        }
    } 
	
    // We might not have the buttons loaded at this point.
    // Inject the styles directly. The code that creates the
    // Buttons will recall the correct change function which
    // will highlight the correct button.

    // We do not need to inject the style for the chat or the
    // login screen. These two are in iframes and implement
    // dark mode already. We pick it up for free with the
    // switching mechanism.

    const chatRegex = new RegExp(".*://.*\.waze.com/chat.*");
    const loginRegex = new RegExp(".*://.*\.waze\.com/.*signin.*");

    if (!chatRegex.test(window.location.href) && !loginRegex.test(window.location.href)) {
        injectStyle();
    }
    setTheme();

    let initCalled = false;
    async function init() {
        if (!initCalled) {
            initCalled = true;
            addThemeToggleButtons();
            setTimeout(() => FUMECheck(), 10000);

            /* Bootstrap does not exist on the profile page */
            const profileRegex = new RegExp(".*://.*\.waze\.com/.*user.*");
            if (!profileRegex.test(window.location.href)) {
                await bootstrap({ scriptUpdateMonitor: { downloadUrl } });
            }
        }
    }

    if (W?.userscripts?.state.isInitialized) {
        init();
    } else {
        document.addEventListener('wme-initialized',
                                  init(), {
                                    once: true,
                                  });
        // Sometimes we load in without W, and we will never get a wme-initialized
        // callback. In that case, we setup a timeout to call init anyway in a second.
        // This currently impacts the profile page.
        setTimeout(() => init(), 2000);
    }
	
    const observer = new MutationObserver((mutationsList, observer) => {
        for (let mutation of mutationsList) {
            if (mutation.type === 'childList') {
                // Check if added nodes contain a custom element
                mutation.addedNodes.forEach(node => {
                    if(getPreferredTheme() == 'dark') {
                        // Waze tooltips (editing disabled messages) are dynamically
                        // added blocks with shadow roots
                        // We must use JS to modify it as it is being created
                        if (node.nodeName === 'WZ-TOOLTIP-CONTENT') {
                            // Modify the style attribute if it contains a specific string
                            if (node.hasAttribute('style')) {
                                let style = node.getAttribute('style');

                                // Change the background color
                                if (style.includes('wz-tooltip-content-background-color')) {
                                    style = style.replace(/wz-tooltip-content-background-color:[^;]*;/, 'wz-tooltip-content-background-color: #202124;');
                                }
								
                                // Change the box shadow to be a white outline
                                if (style.includes('wz-tooltip-content-box-shadow')) {
                                    style = style.replace(/wz-tooltip-content-box-shadow:[^;]*;/,
                                                          'wz-tooltip-content-box-shadow: rgb(213, 215, 219) 0px 0px 0px 1px;');
                                }

                                // Update the style attribute with the modified string
                                node.setAttribute('style', style);
                            }
                        }

                        // UR Request text area is in a shadow root that is hard to target
                        // It is properly set-up to use the correct root color variables.
                        // Unfortunately, URC-E overrides the background color to
                        // peachpuff if append mode is on. We can fix it by using CSS to
                        // make it white and invert it so it looks correct. But we need
                        // to do it this way because of the shadow root.
                        if (node.nodeName === 'TEXTAREA') {
                            // Get the parent of the target node
                            const shadowRoot = node.parentNode.shadowRoot;

                            if (shadowRoot) {
                                const style = document.createElement('style');
                                style.textContent = UR_text_area;
                                // Append the <style> element to the parent node
                                shadowRoot.appendChild(style);
                            }
                        }
                    }
                });
            }
        }
    });

    // Start observing the document or a specific container
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

    function sandboxBootstrap() {
        if (WazeWrap?.Ready) {
            bootstrap({
                scriptUpdateMonitor: {downloadUrl}
            });
            WazeWrap.Interface.ShowScriptUpdate(scriptName, scriptVersion, updateMessage);
        } else {
            setTimeout(sandboxBootstrap, 250);
        }
    }
	
    // Start the "sandboxed" code.
    sandboxBootstrap();
	
    console.log(`${scriptName} initialized.`); 	
})();
