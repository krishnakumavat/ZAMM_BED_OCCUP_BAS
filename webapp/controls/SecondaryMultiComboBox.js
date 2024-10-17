sap.ui.define([
	'sap/m/MultiComboBox'
],function(MultiComboBox){
	return MultiComboBox.extend("ZAMM_BED_OCCUP.controls.SecondaryMultiComboBox",{
		metadata:{
			properties:{
				value:{
					type:"string",
					defaultValue:""
				}	
			},
			renderer:null
		},
		_mapItemToListItem: function(oItem){
			//console.log(oItem);	
			var oListItem, sListItem, sListItemSelected, sAdditionalText;
			var oRenderer = this.getRenderer();
			if (!oItem) {
				return null;
			}
			sAdditionalText = (oItem.getAdditionalText) ? oItem.getAdditionalText() : "";
	
			sListItem = oRenderer.CSS_CLASS_MULTICOMBOBOX + "Item";
			sListItemSelected = (this.isItemSelected(oItem)) ? sListItem + "Selected" : "";
	
			oListItem = new sap.m.StandardListItem({
				type: sap.m.ListType.Active,
				info: sAdditionalText,
				visible: oItem.getEnabled()
			}).addStyleClass(sListItem + " " + sListItemSelected);
	
			oListItem.setTooltip(oItem.getTooltip());
	
			oItem.data(oRenderer.CSS_CLASS_COMBOBOXBASE + "ListItem", oListItem);
			oListItem.setTitle(oItem.getText());
	
			if (sListItemSelected) {
				var oToken = new sap.m.Token({
					key: oItem.getKey()
				});
				oToken.setText(oItem.getText());
				oToken.setTooltip(oItem.getText());
	
				oItem.data(oRenderer.CSS_CLASS_COMBOBOXBASE + "Token", oToken);
				this._oTokenizer.addToken(oToken, true);
			}
	
			this.setSelectable(oItem, oItem.getEnabled());
			oListItem.addStyleClass("myCustomComboBoxClass");
			this._decorateListItem(oListItem);
			return oListItem;
		},
		init:function(){
			MultiComboBox.prototype.init.call(this);
		},
		renderer: function(oRm, oControl) {
			sap.m.MultiComboBoxRenderer.render(oRm, oControl);
		}
	});
});