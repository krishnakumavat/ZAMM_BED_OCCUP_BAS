sap.ui.define([
	'sap/m/Input'
],function(Input){
	return Input.extend("ZAMM_BED_OCCUP.controls.IntegerInputWithIcon",{
		metadata:{
			properties:{
				value:{
					type:"string",
					defaultValue:""
				},
				showIcon:{
					type:"boolean",
					defaultValue: false
				}
			},
			renderer:null
		},
		renderer: function(oRm, oControl) {
			oControl.attachBrowserEvent("keypress", function(oEvent) {
				var _charCode = (oEvent.which) ? oEvent.which : oEvent.keyCode;
				if (_charCode < 48 || _charCode > 57) {
					oEvent.preventDefault();
				}
			});
			oControl._getValueHelpIcon().setSrc("sap-icon://sys-help");
			sap.m.InputRenderer.render(oRm, oControl);
		}
	});
});