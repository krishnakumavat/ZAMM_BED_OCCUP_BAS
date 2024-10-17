sap.ui.define([
	'sap/m/Input'
],function(Input){
	return Input.extend("ZAMM_BED_OCCUP.controls.IntegerInput",{
		metadata:{
			properties:{
				value:{
					type:"string",
					defaultValue:""
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
			sap.m.InputRenderer.render(oRm, oControl);
		}
	});
});