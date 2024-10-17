jQuery.sap.require("sap.ca.ui.dialog.factory");
jQuery.sap.declare("ZAMM_BED_OCCUP.util.Formatter");

ZAMM_BED_OCCUP.util.Formatter = (function() {
	return {
		_generateRandomKey: function(length) {
			var randomChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
			var result = '';
			for (var i = 0; i < length; i++) {
				result += randomChars.charAt(Math.floor(Math.random() * randomChars.length));
			}
			return result;
		},
		formatCurrency: function(value, currency) {
			var oCurrency = new sap.ui.model.type.Currency({
				showMeasure: false,
				preserveDecimal:true
			});
			return oCurrency.formatValue([value,currency], "string");
		}
	};
}());