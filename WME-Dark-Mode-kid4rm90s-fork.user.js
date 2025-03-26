// ==UserScript==
// @name         WME Dark Mode (kid4rm90s fork)
// @namespace    https://greasyfork.org/en/users/1434751-poland-fun
// @version      0.22.8
// @description  Enable dark mode in WME.
// @author       poland_fun
// @ontributor	 kid4rm90s
// @match         *://*.waze.com/*editor*
// @match         *://*.waze.com/chat*
// @grant        GM.addStyle
// @grant        GM_xmlhttpRequest
// @connect      greasyfork.org
// @require      https://greasyfork.org/scripts/24851-wazewrap/code/WazeWrap.js
// @require      https://update.greasyfork.org/scripts/509664/WME%20Utils%20-%20Bootstrap.js
// @license      MIT
// @downloadURL https://update.greasyfork.org/scripts/529939/WME%20Dark%20Mode%20%28kid4rm90s%20fork%29.user.js
// @updateURL https://update.greasyfork.org/scripts/529939/WME%20Dark%20Mode%20%28kid4rm90s%20fork%29.meta.js
// ==/UserScript==

/* global W */
/* global WazeWrap */

/* TODO */
/* When you click buttons, they still go white */
(function main() {
  "use strict";
  const updateMessage = 'Fixes for below scripts/enhancements:<br>Minor bug fixes.<br>update for opendata script, Closer helper minor fix';
  const scriptName = GM_info.script.name;
  const scriptVersion = GM_info.script.version;
  const downloadUrl = 'https://greasyfork.org/scripts/529939-wme-dark-mode-kid4rm90s-fork/code/WME%20Dark%20Mode%20%28kid4rm90s%20fork%29.user.js';
  let wmeSDK;

if (window.top === window.self) {
    // We are not in an iframe
	const darkCSSBase =  `
    /* Dark mode palette found in the chat code */
    :host,:root {
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
    `	
    const cssModifications = `
    #waze-logo {
    filter: invert(100%);
    }

    /* 'Show dismissed alerts again after' button */
    .alert-settings .alert-settings-period-label {
    color: var(--content_p1);;
    }

    body{
    background-color: var(--background_default);
    color: var(--content_p1);
    }

    /* Background of all panes which pop in on left */
    .tab-content {
    background: var(--background_default);
    }

    /* 'Map layers' pane */
    .layer-switcher .menu {
    background: var(--background_default);
    }
    h1,h2,h3,h4,h5,h6,.h1,.h2,.h3,.h4,.h5,.h6 {
    color: var(--content_p1) !important;
    }
    .label-text {
    color: var(--content_p1) !important;
    }

    /* Background of 'Add new Event' Under Events */
    .mteListViewFooter--u_CxF {
    background: var(--background_default);
    }

    /* Footer background */
    .wz-map-ol-footer {
    background-color: var(--background_default);
    }

    /* Links in footer */
    a.wz-map-black-link {
    color: var(--content_p1);
    }
    a {
    color: var(--content_p1);
    }

    /* Lat/Long in footer*/
    .wz-map-ol-control-span-mouse-position {
    color: var(--content_p1);
    }

    /* Map imagery attribution */
    .wz-map-ol-control-attribution {
    color: var(--content_p1);
    }

    /* Background of script list/buttons */
    #sidebar .nav-tabs {
    background: var(--background_default);
    }

    /* Background of active script button */
    #sidebar .nav-tabs li.active a {
    background: var(--always_dark_surface_default);
    }

    /* Script button text */
    #sidebar .nav-tabs li a {
    color: var(--content_p1);
    }

    /* Background of 'Update results when map moves' in Solve pane */
    .issues-tracker-wrapper .issues-tracker-footer  {
    background: var(--background_default);
    }

    /* Route Speeds Plugin */
    #sidepanel-routespeeds {
    color: var(--content_p1) !important;
    }
    #routespeeds-passes-label {
    color: var(--content_p1) !important;
    }
    .waze-btn.waze-btn-blue {
    color: white !important;
    }

	
    /* Textboxes/Dropdowns/Input Feilds */
    input[type=text] {
    color: black !important; /* for to use with house numbering*/
    }
	input[type=email],input[type=number],input[type=password],select,button,textarea,.form-control {
    //color: var(--content_p2) !important;
	color: white !important;
    }

    /* TTS Playback dialog */
    .tts-playback .tippy-box[data-theme=tts-playback-tooltip] {
    background: var(--background_default);
    box-shadow: rgb(213, 215, 219) 0px 0px 0px 1px
    }

    a:hover, a:visited {
    color: var(--content_p1);
    }
	
	/*user editor environment panel*/
	#environmentSelect {
    background-color: var(--background_default) !important;
    }
	.leaflet-control-layers-expanded {
	background-color: var(--background_default) !important;
	color: var(--content_p1);
	}	
	
    /* UR section headers */
    .problem-edit .section .title {
    background-color: var(--always_dark_inactive);
    color: var(--content_p1);
    border-bottom: 1px solid var(--always_dark_surface_default);
    border-top: 1px solid var(--always_dark_surface_default);
    }
    .issue-panel-header .sub-title-and-actions {
    color: var(--content_p2);
    }
    .conversation-view .comment-list {
    border: 1px solid var(--always_dark_surface_default);
    }

    /* 'Search This Area' box */
    .container--wzXTu {
    background: var(--background_default);
    }

    /* 'Filter Map issues' pane */
    #filter-panel-region {
    background: var(--background_default);
    }

    /* PL box */
    [class^="container"]::after {
    background: var(--always_dark_surface_default);
    height: 2px;
    }

    /* Changelog */
    [class^="changesLogContainer"] {
    background: var(--background_default);
    }

    /* Online editors */
    .online-editors-bubble {
    --wz-button-background-color: var(--always_dark_surface_default);
    --wz-button-border: var(--always_dark_surface_default);
    }
    .online-editors-bubble:hover {
    --wz-button-background-color: var(--always_dark_inactive);
    --wz-button-border: var(--always_dark_surface_default);
    }

    /* Entry Point Buttons */
    .navigation-point-actions > wz-button {
    --wz-button-background-color: var(--always_dark_surface_default);
    --wz-button-border: var(--always_dark_surface_default);
    }

    /* WME Switch Uturns */
    .disallow-connections, .allow-connections {
    --wz-button-background-color: var(--always_dark_surface_default);
    }

    /* PL box */
    [class^="bordered"] * {
    background-color: var(--background_default);
    }

    /* Turn Restrictions */
    .restriction-editing-region .restriction-editing-section .restriction-editing-container {
    background-color: var(--always_dark_surface_default);
    }
    .form-control {
    background: var(--always_dark_surface_default);
    }
    .timeframe-hours-controls {
    --background_variant: var(--always_dark_inactive);
    }
    .restriction-editing-region .timeframe-editing-region .timeframe-section-dates .datepicker {
    color: black !important;
    }
    .restrictions-summary .restrictions-table tr {
    background: var(--always_dark_surface_default) !important;
    }
    .restrictions-summary .restrictions-table th {
    background: var(--always_dark_inactive) !important;
    }

    /* Turn Instructions */
    .turn-instructions-panel .exit-signs,.turn-instructions-panel .turn-instructions,.turn-instructions-panel .towards-instructions {
    background: var(--always_dark_surface_default);
    }
    .turn-instructions-panel .exit-sign-item,.turn-instructions-panel .turn-instruction-item {
    background: var(--always_dark_surface_default);
    border: 1px dashed var(--always_dark_inactive);
    }

    .wz-tooltip-content-holder {
    background-color: var(--background_default);
    }

    /* Date Range Pickers */
    .daterangepicker {
    background-color: var(--background_default) !important;
    border: 1px solid black;
    }
    .daterangepicker .calendar-table {
    background-color: var(--background_default);
    }
    .daterangepicker td.off {
    background-color: var(--background_default);
    color: var(--content_p1);
    }
    .daterangepicker td.active {
    background-color: #357ebd !important;
    }
    .daterangepicker .available {
    background-color: var(--always_dark_surface_default);
    }
    .daterangepicker td.today {
    background-color: var(--always_dark_surface_default);
    border: 2px solid var(--safe);
    }
    .daterangepicker .calendar-table .next span, .daterangepicker .calendar-table .prev span {
    border: solid var(--content_p1);
    border-width: 0 2px 2px 0;
    }

    /* House Numbers */
    .house-number-marker {
    background: var(--background_default);
    }
    .house-numbers-layer .house-number .content .input-wrapper {
    background-color: #07ff00 !important; /* Bright Green */
    }
/******* UR Comment - Enhancement *****************************/
    #urceDiv {
    background-color: var(--background_default) !important;
    box-shadow: 5px 5px 10px black !important;
    }
    .urceDivCloseButton {
    background-color: var(--surface_default) !important;
    box-shadow: 5px 5px 10px black !important;
    }

    /* Button text color */
    .btn.btn-default {
    color: var(--content_p1);
	background-color: var(--always_dark_surface_default) !important;
    }

    /* URC-E Plugin */
    #sidepanel-urc-e #panel-urce-comments .URCE-openLink {
    color: var(--content_p3) !important;
    }
    .URCE-span {
    color: var(--content_p1);
    }
    .urceToolsButton {
    background-color: var(--always_dark_surface_default) !important;
    }
    #zoomOutLink1, #zoomOutLink2, #zoomOutLink3 {
    color: var(--content_p1) !important;
    }

    /* Grey screen when your save has errors */
    #map-viewport-overlay {
    background-color: var(--background_default);
    }
    /* default background is not super noticble here, so we do black */
    #sidebar .overlay.editingDisabled {
    background-color: black;
    }

    /* Notification pane */
   .notifications-empty-container .centered-content .text {
   color: var(--content_p1);
   }
   .notification-content-container .notification-content-text-container .body {
   color: var(--content_p1) !important;
   }
   
   /* City Names */
    .city-name-marker, #edit-panel .city-feature-editor .feature-editor-header {
    background-color: var(--background_default);
    }
    .city-name-marker:hover, .city-name-marker.selected {
    color: black;
    }

    /* WMEPH Plugin */
    /* These are gray icons. We can either make a white border per icon
       or put a white boarder around all of them */
    #WMEPH_services {
    background-color: white;
    }
    /*
    .serv-valet {
    filter: invert(100%);
    }
    .serv-wifi {
    filter: invert(100%);
    }
    .serv-restrooms {
    filter: invert(100%);
    }
    .serv-credit {
    filter: invert(100%);
    }
    .serv-reservations {
    filter: invert(100%);
    }
    .serv-outdoor {
    filter: invert(100%);
    }
    .serv-ac {
    filter: invert(100%);
    }
    .serv-parking {
    filter: invert(100%);
    }
    .serv-curbside {
    filter: invert(100%);
    }
    .serv-wheelchair {
    filter: invert(100%);
    }
    .serv-247 {
    filter: invert(100%);
    }
    */
    #WMEPH_banner .banner-row.gray {
    color: var(--content_p1) !important;
    background-color: var(--surface_default) !important;
    }
    #wmeph-hours-list {
    color: var(--content_p1) !important;
    background-color: var(--background_default) !important;
    }
    #WMEPH_banner .wmeph-btn {
    background-color: var(--background_default) !important;
    }
    .lock-edit-view > wz-label {
    background-color: var(--background_default)
    }

    /* Click Saver */
    .cs-group-label {
    color: var(--content_p1) !important;
    }

    /* Turn, Segment Closures */
    .edit-closure {
    background: var(--background_default) !important;
    }
    .closure-node-item {
    background-color: var(--background_default)!important;
    }
    .closure-item .dates {
    color: var(--content_p1) !important;
    }

    [class^="welcome_popup_container"] {
    background-color: var(--background_default);
    }
    [class^="welcome_popup_image"] {
    filter: invert(87%);
    }
	
    /* Previous Build dialog */
    #map-message-container .snapshot-message .snapshot-mode-message {
    background: var(--background_default) !important;
    }

    /* Script update message */
    #WWSU-Container, .WWSU-script-item, #WWSU-script-update-info {
    background-color: var(--background_default) !important;
    }

    /* WME Toolbox Extension */
    .tb-tabContainer {
    background-color: var(--background_default) !important;
    }
    .tb-tab-tab {
    background-color: var(--background_default) !important
    }
    .tb-tab-tab > img {
    filter: invert(100%);
    }
    .tb-feature-label-image {
    filter: invert(87%);
    }
    .ToolboxMeasurementTool {
    background-color: var(--background_default) !important;
    }
    #Country, #State, #City, #Street {
    color: var(--content_p1) !important;
    }
    .ui-dialog-buttonset > button {
    background-color: var(--background_default) !important;
    color: var(--content_p1) !important;
    }
    /* .ui-widget-content.newversionpanel, .ui-widget-content.ui-dialog-buttonpane, .WMETB_NewVersionPanel.ui-widget-content { */
    .ui-widget-content, .ui-state-default, .ui-widget-content .ui-state-default, .ui-widget-header .ui-state-default {
		color: var(--content_p1) !important;
	background: rgba(0, 0, 0, 0.50) !important;
	}
	.ui-widget-content a {
	color: white !important;
	}
	.ui-widget-header, #WMETB_NewVersionPanel {
	color: var(--content_p1) !important;
	background: var(--background_default) !important;
	}
	.ui-button.ui-widget.ui-state-default.ui-corner-all.ui-button-icon-only.ui-dialog-titlebar-close {
	background-color: var(--background_default) !important;
	color: var(--content_p1) !important;
	border: 1px solid var(--always_dark_inactive) !important;
	}
    .ui-widget-overlay {
    background: black !important
    }

    /* Editor info -------------------------------------- */
    #header {
    background-color: var(--background_default);
    }
    #header .user-headline .header-info {
    background-color: var(--always_dark_surface_default);
    }
    #recent-edits .recent-edits-list .recent-edits-list-header {
    background-color: var(--background_default);
    }
    #recent-edits .recent-edits-list .recent-edits-list-items .transaction-header {
    background-color: var(--always_dark_surface_default);
    }
    #recent-edits .recent-edits-list .recent-edits-list-items .transaction-header.active, #recent-edits .recent-edits-list .recent-edits-list-items .transaction-header:hover {
    background-color: var(--always_dark_background_default);
    }
    #recent-edits .recent-edits-list .recent-edits-list-items .transaction-content {
    background-color: var(--always_black);
    }
    .type-icon {
    filter: invert(100%);
    }
   .map .leaflet-tile-pane {
   filter: grayscale(100%) brightness(0.8) contrast(160%) invert(77%)
   }
   #recent-edits .recent-edits-map-polygon {
   fill: white;
   }

   /* Practice Mode intro text */
   .sandbox .links a {
   color: var(--content_p1);
   }
   .sandbox .welcome-container {
    background-color: var(--background_default);
   }

/******* Road Selector Plugin ******************************************/
   .table-striped>tbody>tr:nth-of-type(odd) {
   background-color: var(--always_dark_surface_default);
   }
   .table-hover>tbody>tr:hover {
   background-color: var(--always_dark_inactive);
   }
   #outRSExpr {
   color: var(--content_p2);
   }
   #RSoperations > button, #RSselection > button, #btnRSSave {
   color: white !important;
   }
   #inRSSaveName {
   color: var(--content_p1) !important;
    }
   tbody input[type="text"], tbody input[type="number"] {
   color: var(--content_p1) !important;
    }

   /* UR-MP Tracking Plugin */
   .popup-pannel-trigger-class-FilterUR,
   .popup-pannel-contents-closed-class-FilterUR,
   .popup-pannel-contents-open-class-FilterUR,
   .popup-pannel-trigger-class-FilterMP,
   .popup-pannel-contents-closed-class-FilterM,
   .popup-pannel-contents-open-class-FilterMP,
   .popup-pannel-trigger-class-FilterMC,
   .popup-pannel-contents-closed-class-FilterMC,
   .popup-pannel-contents-open-class-FilterMC,
   .popup-pannel-trigger-class-FilterPUR,
   .popup-pannel-contents-closed-class-FilterPUR,
   .popup-pannel-contents-open-class-FilterPUR
   {
   color: black !important;
   }
   .urt-table {
   color: var(--content_p1);
   }
   .urt-table thead, .urt-table thead a, .urt-table thead a:hover {
   color: black !important;
   }
   .urt-bg-highlighted, .urt-bg-highlighted a, .urt-bg-highlighted a:hover {
   color: black !important;
   }
   .urt-bg-ifollow {
   color: var(--content_p1);
   background-color: var(--always_dark_inactive) !important;
   }
   .urt-bg-selected, .urt-bg-selected a, .urt-bg-selected a:hover {
   color: black !important;
   }
   .urt-bg-newcomments {
   color: black !important;
   }
   #urt-a-export > img {
   filter: invert(100%);
   }
   #urt-a-export-csv > img {
   filter: invert(100%);
   }
   #urt-progressBarInfo {
   color: black !important;
   }

   /* WME Advanced Closures - Plugin */
   .wmeac-closuredialog, .wmeac-closuredialog h1, #wmeac-csv-closures-log:before, #wmeac-csv-closures-preview:before {
    background-color: var(--background_default) !important;
   }
   .wmeac-closuredialog,
   .wmeac-tab-pane,
   .wmeac-nav-tabs>li>a,
   .wmeac-nav-tabs>li:not(.active)>a,
   #wmeac-csv-closures-preview,
   #wmeac-csv-closures-log {
   border: 1px solid black !important;
   }
   .wmeac-nav-tabs>li:not(.active)>a {
   background-color: var(--always_dark_inactive) !important;
   }
   .wmeac-closuredialog button {
   background-color: var(--always_dark_inactive) !important;
   }

   /* URO+ Plugin */
   .uroAlerts * {
    background-color: var(--background_default) !important;
   }
   #_tabURs, #_tabMPs, #_tabMCs, #_tabRTCs, #_tabRAs, #_tabPlaces, #_tabMisc, #uroDiv{
   background-color: var(--background_default) !important;
   }
   #uroCommentCount > div {
   color: black !important;
   filter: invert(1);
   }
   #uroDiv {
   box-shadow: 5px 5px 10px black !important;
   }

   /* DOT Advisories Plugin */
   #gmPopupContainer {
   background-color: var(--background_default) !important;
   }

   /* Waze Edit Count Monitor Plugin*/
   .secondary-toolbar .toolbar-button {
   background-color: var(--background_default) !important;
   }
   #wecm-count {
   color: var(--content_p1) !important;
   }

    /* External Provider buttons */
	.external-provider-action {
	--wz-button-background-color: var(--always_dark_surface_default);
	}
	
	/*Place alternative name delete icon*/
	.aliases .alias-item-actions {
	--wz-button-background-color: var(--always_dark_surface_default);
	}

	/*Lanes and road width*/
	.direction-lanes .lane-instruction .drawing .letter-circle {
	background-color: var(--background_default) !important;
	}	
	
	
	/*WME Segment city tool*/
	#wmesct-container .ts-control, .ts-control input, .ts-dropdown {
	color: var(--content_p1) !important;
	}
	#wmesct-container .ts-dropdown {
	background-color: var(--background_default) !important;
	}
    .wmesct-clear-cities-button, .waze-btn.waze-btn-green {
	background-color: var(--always_dark_surface_default) !important;
	}
	#wmesct-container .ts-dropdown .option.active {
	background-color: black !important;
	}
	
	/*WME FUME*/
	.yslider-stops, .olButton, .olControlPanZoomBar, .slider {
	background-color: var(--background_default) !important;
	}
    /* I am not 100% positive this was the FUME update box */
    #abAlerts {
    box-shadow: black 5px 5px 10px !important;
    border-color: black !important;
    }
    #abAlerts, #abAlerts #header, #abAlerts #content {
    background-color: var(--background_default) !important;
    }
    /* For some reason background variant does not work at
    this point. Hardcode color for now. */
    #abAlertTickBtn {
    background-color: #3c4043 !important;
    }
	
	/*RA Util window*/
	#RAUtilWindow, #SSUtilWindow {
	background-color: var(--background_default) !important;
	}
	#rotationAmount, #shiftAmount {
	color: white !important;
    }
	
/******E50 Geometry information Script ********************************************/
    .e50 fieldset legend, .e50 li a:hover {
    background-color: var(--always_dark_surface_default) !important;
    }
    .wme-ui-panel-container, .wme-ui-close-panel, .e50 li a.noaddress, .e50 .wme-ui-body  {
    background-color: var(--background_default) !important;
    }
    .wme-ui-close-panel:after {
    filter: invert(1.0);
    }
    legend {
    color: var(--content_p1) !important;
     }
    .controls-container.e50 input {
    color: var(--content_p2) !important;
    }
	
/**********************Address Point Helper*****************************/
	.waze-btn.waze-btn-white {
	background-color: var(--background_default) !important;
	}

	#edit-panel .control-label, .edit-panel .control-label {
	color: var(--content_p1) !important;
    }

    /* WME OpenData Plugin */
    #oslDragBar {
    background-color: var(--background_default) !important;
    box-shadow: black 5px 5px 10px !important;
    }
    #oslWindow {
    box-shadow: black 5px 5px 10px !important;
    border: 1px solid black !important
    }
    #oslOSLDiv {
    background-color: var(--always_dark_surface_default) !important;
    }
    #oslSelect {
    background-color: var(--background_default) !important;
    }
    #oslSegGeoUIDiv {
    background-color: var(--background_default) !important;
    }
    #oslGazTagsDiv {
    background-color: var(--always_dark_surface_default) !important;
    }
    #oslNCDiv {
    background-color: var(--background_default) !important;
    }
    #oslMLCDiv {
    background-color: var(--always_dark_surface_default) !important;
    }	
	
/**********************WME Geometries************************************/
	.geometries-cb-label {
    color: var(--content_p1) !important;
    }
	
/***********************WME Route Checker*******************************/
	#routeTest > p > b {
    color: white !important;
}	
/*Show routes between these 2 segments*/
	a#goroutes {color: var(--content_p1) !important;} 
	
	#routeTest a.step:hover {
    background-color: var(--always_dark_surface_default) !important;
	}
	
	#routeTest p.route {
    background-color: var(--background_default) !important;
    }
/*for generated road segments name via route checker*/
    a.step span {
    color: white !important;
    }

/*Route step by step direction*/	
	#routeTest a.step {
    color: var(--content_p1) !important;
    }
	
/******************* WME Validator *************************************/
	c2821834349 > input:disabled + label, .c2821834349 > input:disabled + label {
	color: var(--content_p1) !important;
	}
	.c3584528711 > span, .c2952996808, .c2821834349 > input:checked + label {
    background-color: var(--background_default) !important;
    }
	.c3336571891 > span {
    background-color: var(--always_dark_surface_default) !important;
    }
	.c2821834349 > label {
    background-color: var(--always_dark_surface_default) !important;
    }
	.c3210313671 > button:disabled {
	background-color: var(--always_dark_surface_default) !important;
	}
	
/***** Re-lock Segments & POI***********************************************/	
	.tg .tg-header {
	background-color: var(--always_dark_surface_default) !important;
	}
	
/***** WME Locksmith *****************************************************/ 
    .ls-Wrapper {
	background-color: var(--background_default) !important;
	}

	.ls-Options-Dropdown-Menu {
	background-color: var(--always_dark_surface_default) !important;
	}
	
	.ls-Options-Dropdown-Menu li:hover, .ls-Options-Menu:hover  {
	background-color: var(--always_dark_inactive) !important;
    border: var(--always_dark_surface_default) !important;
    }
 
    .ls-Button {
	background-color: var(--always_dark_surface_default) !important;
	}
	
	label.ls-Attr-Label {
    color: black;
    }
	a#lsConnectionStatus {
    background-color: var(--always_dark_inactive) !important;
	}
	
/**** Wide Area Lens ******************************************************/	
    .btn.btn-primary {
	background-color: var(--always_dark_surface_default) !important;
	}

/**** Closure helper ******************************************************/
    .wmech_closurebutton.wmech_presetdeletebutton {
	background-color: var(--always_dark_surface_default) !important;
	}
	.wmech_closurebutton.wmech_presetsavebutton {
	background-color: var(--background_default) !important;
    }
	.wmech-alert {
	background-color: var(--always_dark_surface_default) !important;
    }
	.nav-tabs>li>a:hover {
	background-color: var(--always_dark_inactive) !important;
	}
	#wmech_mteradiosdiv {
	background-color: var(--always_dark_surface_default) !important;
    }
    div[id^="wmech_presetrow"] input[type="text"], #wmech-settings-boxes input, #wmech-settings-boxes #wmech_settingcustomcs {
    color: var(--content_p2) !important;
    }
	#uroAlerts, #content {
	background-color: var(--background_default) !important;
    }

/****** Place Interface Enhancement PIE **************************************/
    #divPlaceFilter #piePlaceFilter, #divPlaceNamesFontCustomization input {
    color: var(--content_p1) !important;
    }

/****** Open Other Maps OOM **************************************/
    fieldset #txtOOMLanguage, #txtOOMMyMapLink {
    color: var(--content_p2) !important;
    }
   	`
    const UR_text_area = `
    .wz-textarea .wz-textarea-inner-container textarea {
    background-color: white;
    color: black !important;
    filter: invert(1.0);
    border-color: white !important;
    }
    `
    GM.addStyle (darkCSSBase);
    GM.addStyle (cssModifications);


    const observer = new MutationObserver((mutationsList, observer) => {
        for (let mutation of mutationsList) {
            if (mutation.type === 'childList') {
                // Check if added nodes contain a custom element
                mutation.addedNodes.forEach(node => {
                    // Waze tooltips (editing disabled messages) are dynamically
                    // added blocks with shadow roots
                    // We must use JS to modify it as it is being created
                    if (node.nodeName === 'WZ-TOOLTIP-CONTENT') {
                        // Modify the style attribute if it contains a specific string
                        if (node.hasAttribute('style')) {
                            let style = node.getAttribute('style');

                            // Change the background color
                            if (style.includes('wz-tooltip-content-background-color')) {
                                style = style.replace(/wz-tooltip-content-background-color:[^;]*;/,
                                                      'wz-tooltip-content-background-color: #202124;');
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
                });
            }
        }
    });

    // Configure the observer to watch for child nodes being added to the body (or any other element)
    const config = { childList: true, subtree: true };

    // Start observing the document or a specific container
    observer.observe(document.body, config);
}
else {
    //We are in an iframe whcih will be the chat
    GM.addStyle ( `
    :root[wz-theme=light],:root[wz-theme=light] :host {
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
    `);
}
    function sandboxBootstrap() {
        if (WazeWrap?.Ready) {
            WazeWrap.Interface.ShowScriptUpdate(scriptName, scriptVersion, updateMessage);
        } else {
            setTimeout(sandboxBootstrap, 250);
        }
    }
    // Start the "sandboxed" code.
    sandboxBootstrap();
	wmeSDK = bootstrap({ scriptUpdateMonitor: { downloadUrl } });
	
    console.log(`${scriptName} initialized.`); 
	
	
})();
