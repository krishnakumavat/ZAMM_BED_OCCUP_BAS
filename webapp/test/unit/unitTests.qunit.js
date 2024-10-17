/* global QUnit */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"ZAMM_BED_OCCUP/test/unit/AllTests"
	], function () {
		QUnit.start();
	});
});
