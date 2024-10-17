jQuery.sap.require("sap.ca.ui.dialog.factory");
jQuery.sap.declare("ZAMM_BED_OCCUP.util.UIHelper");
jQuery.sap.require("ZAMM_BED_OCCUP.controls.SecondaryMultiComboBox");

ZAMM_BED_OCCUP.util.UIHelper = (function() {
	var _cntrlrInst = null;
	var _isChangeAction = false;
	return {
		getConstants: function(variable) {
			switch (variable) {
				case "language2": //1 Character language
					let _language2 = sap.ui.getCore().getConfiguration().getLanguage().split("-")[0].toUpperCase();
					return _language2;
					break;
				case 'dateFormat':
					let _userDateFormat = sap.ui.getCore().getConfiguration().getFormatSettings().getDatePattern("medium");
					return _userDateFormat && _userDateFormat !== undefined && _userDateFormat !== "" ? _userDateFormat.toUpperCase() : 'YYYY.MM.DD';
					break;
			}
		},
		_calculateDate:function(dateReference,isAdd,value,unit,exportFormat,isDateExport){
			return isAdd ? !isDateExport ? moment(dateReference).add(value,unit).format(exportFormat) : moment(dateReference).add(value,unit)._d
						 : !isDateExport ? moment(dateReference).subtract(value,unit).format(exportFormat) : moment(dateReference).subtract(value,unit)._d;
		},
		_getWeekNo: function(_weekData, _searchDate) {
			let that = this;
			let _weekNo = 0;
			_.forEach(_weekData, function(week) {
				if (moment(_searchDate, "YYYYMMDD").isBetween(moment(week.startDate, "DD-MM-YYYY"), moment(week.endDate, "DD-MM-YYYY")) || moment(
						_searchDate, "YYYYMMDD").isSame(moment(week.startDate, "DD-MM-YYYY")) || moment(_searchDate, "YYYYMMDD").isSame(moment(week.endDate,
						"DD-MM-YYYY"))) {
					_weekNo = week.weekCode;
				}
			});
			return _weekNo;
		},
		_isFileNameValid: function(fileName) {
			let isValid = true;
			let _fileNameLength = fileName.length;
			let _allowedLength = 100;
			if (this.getConstants("language2") === 'JA') {
				isValid = _fileNameLength <= Math.round(_allowedLength / 2) ? true : false;
			} else {
				isValid = _fileNameLength <= _allowedLength ? true : false;
			}
			return isValid;
		},
		_isFileSpecialCharacters: function(fileName) {
			//return !/[~`!@#$%\^&*+=\-\[\]\\';,/{}|\\":<>\?]/g.test(fileName);	
			return !/[~`!@#$%\^&*+=\[\]\\';,/{}|\\":<>\?]/g.test(fileName);
		},
		setControllerInstance: function(oControllerInst) {
			_cntrlrInst = oControllerInst;
		},
		getControllerInstance: function() {
			return _cntrlrInst;
		},
		setIsChangeAction: function(oStatus) {
			_isChangeAction = oStatus;
		},
		getIsChangeAction: function() {
			return _isChangeAction;
		},
		isJSONString: function(str) {
			try {
				JSON.parse(str);
			} catch (e) {
				return false;
			}
			return true;
		},
		isValidUrl: function(_string) {
			let _urlString;
			try {
				_urlString = new URL(_string);
			} catch (_) {
				return false;
			}
			return _urlString.protocol === "file:";
		},
		getChunks: function(str, size) {
			const numChunks = Math.ceil(str.length / size)
			const chunks = new Array(numChunks)

			for (let i = 0, o = 0; i < numChunks; ++i, o += size) {
				chunks[i] = str.substr(o, size)
			}

			return chunks
		},
		padWithZeros: function(str, length) {
			var my_string = '' + str;
			while (my_string.length < length) {
				my_string = '0' + my_string;
			}
			return my_string;
		},
		getDataInViewType: function(length, isMultiple) {
			switch (length) {
				case 0:
					return 'Input';
					break;
				case 1:
					if (isMultiple) {
						return 'MultiSelect';
						break;
					} else {
						return 'Select';
						break;
					}
					// return 'Select';
					// break;
				case 2:
					if (isMultiple) {
						return 'MultiSelect';
						break;
					} else {
						return 'Select';
						break;
					}
				default:
					if (isMultiple) {
						return 'MultiSelect';
						break;
					} else {
						return 'Select';
						break;
					}
			}
		},
		getRequestType: function(isNewArticle, isPriceUpdate, isImageUpdate) {
			let _requestType = '1';
			if (isNewArticle && !isPriceUpdate && !isImageUpdate) {
				_requestType = '1'; //New Article
			} else if (!isNewArticle && isPriceUpdate && !isImageUpdate) {
				_requestType = '2'; // Price Update
			} else if (!isNewArticle && isPriceUpdate && isImageUpdate) {
				_requestType = '3'; // Image Update
			}
			return _requestType;
		},
		getDataInWhichPanel: function(key) {
			let _key = key.toString().toLowerCase();
			if (_key.indexOf("allergen") !== -1) {
				return "Allergen Details";
			} else if (_key.indexOf("stock") !== -1) {
				return "Stock Information";
			} else if (_key.indexOf("origin") !== -1) {
				return "Origin";
			} else {
				return "Basic Details"
			}
		},
		errorDialog: function(messages) {

			var _errorTxt = "";
			var _firstMsgTxtLine = "";
			var _detailmsg = "";
			var oSettings = "";

			if (typeof messages === "string") {
				oSettings = {
					message: messages,
					type: sap.ca.ui.message.Type.ERROR
				};
			} else if (messages instanceof Array) {

				for (var i = 0; i < messages.length; i++) {
					_errorTxt = "";
					if (typeof messages[i] === "string") {
						_errorTxt = messages[i];
					} else if (typeof messages[i] === "object") {
						_errorTxt = messages[i].value;
					}
					_errorTxt.trim();
					if (_errorTxt !== "") {
						if (i === 0) {
							_firstMsgTxtLine = _errorTxt;
						} else {
							_detailmsg = _detailmsg + _errorTxt + "\n";
						}
					}
				}

				if (_detailmsg == "") { // do not show any details if none are there
					oSettings = {
						message: _firstMsgTxtLine,
						type: sap.ca.ui.message.Type.ERROR
					};
				} else {
					oSettings = {
						message: _firstMsgTxtLine,
						details: _detailmsg,
						type: sap.ca.ui.message.Type.ERROR
					};
				}

			}
			sap.ca.ui.message.showMessageBox(oSettings);
		},
		ignoreKeys: function() {
			return ['toString', 'toLocaleString', 'valueOf', 'hasOwnProperty', 'isPrototypeOf', 'propertyIsEnumerable', 'constructor'];
		},
		_validateKeyCode: function(keyCode) {
			if (keyCode >= 48 && keyCode <= 90) {
				return true;
			} else {
				return false;
			}
		},
		keyValuePairs: function(object) {
			var array = [];
			for (var key in object) {
				if (this.ignoreKeys().indexOf(key) < 0) {
					var value = object[key],
						float = parseFloat(value);

					array.push({
						key: key,
						value: value || ''
					});
				}
			}
			return array;
		},
		_generateVendorFilter: function(vendor, attribute) {
			let _urlParams = "";
			let _arr = [];
			let _vendorArr = vendor.split(",");
			_.forEach(_vendorArr, function(vendorId) {
				_arr.push(attribute + " eq '" + vendorId + "'");
			});
			_urlParams = " and (" + _arr.join(" or ") + ")";
			return _urlParams;

		},
		generateURLMultiSearch: function(collection, array, paramKey, expandEntities, isExpand) {
			let url = collection;
			if (array.length > 0) {
				url += '?$filter=';
				array.forEach(function(filter, index) {
					if (index > 0) {
						url += encodeURIComponent(' or ');
					}
					url += paramKey + encodeURIComponent(" eq '" + array[index]) + "'";
				});
			}
			if (isExpand) {
				url += '&$expand=';
				let _expandedEntities = expandEntities.toString();
				url += _expandedEntities;
			}
			return url;
		},
		generateURL: function(collection, params, filters, isPost, isDateAlso, expandEntities, isExpand, isValue) {
			let url = collection;
			if (!isPost && params) params = this.keyValuePairs(params);
			if (!isPost && filters) filters = this.keyValuePairs(filters);
			if (!isPost && params) {
				url += '(';
				params.forEach(function(param, index) {
					if (index > 0) {
						url += ',';
					}
					if (param.key.indexOf('Time') != -1) {
						if (isDateAlso) {
							url += param.key + "=datetime'" + encodeURIComponent(param.value) + "'";
						} else {
							url += param.key + "='" + encodeURIComponent(param.value) + "'";
						}
					} else {
						url += param.key + "='" + encodeURIComponent(param.value) + "'";
					}
				});
				url += ')';
			}
			if (!isPost && filters) {
				url += '?$filter=';
				filters.forEach(function(filter, index) {
					if (index > 0) {
						url += encodeURIComponent(' and ');
					}
					if (filter.key.indexOf('date') != -1) {
						if (isDateAlso) {
							url += filter.key + encodeURIComponent(" eq datetime'" + filter.value) + "'";
						} else {
							url += filter.key + encodeURIComponent(" eq '" + filter.value) + "'";
						}
					} else {
						url += filter.key + encodeURIComponent(" eq '" + filter.value) + "'";
					}

				});
			}
			if (isExpand) {
				url += '&$expand=';
				let _expandedEntities = expandEntities.toString();
				url += _expandedEntities;
			}
			if (isValue) {
				url += '/$value';
			}
			return url;
		},
		_generateFormElement: function(templateType, templateData, modelKeyName, fieldDescription, isDisplay, isRequired, inputType,
			inputLength) {
			let that = this;
			let _formElement = new sap.ui.layout.form.FormElement({
				label: new sap.m.Label({
					text: fieldDescription,
					design: "Standard",
					width: "100%",
					required: isRequired,
					textAlign: "Begin",
					textDirection: "Inherit",
					visible: true,
					wrapping: true
				}).addStyleClass("blackLabel")
			});
			switch (templateType) {
				case "MultiSelect":
					let multiSelectModel = new sap.ui.model.json.JSONModel();
					multiSelectModel.setData(templateData);
					multiSelectModel.setSizeLimit(templateData.length);
					let _oMultiSelect = new ZAMM_BED_OCCUP.controls.SecondaryMultiComboBox({
						selectedKeys: "{createCatalogItemModel>/" + modelKeyName + "}",
						enabled: "{createCatalogItemModel>/" + modelKeyName + "enabled}",
					});
					var _oMultiItemTemplate = new sap.ui.core.ListItem({
						key: "{code}",
						text: "{description}",
						additionalText: "{code}",
					});

					_oMultiSelect.setModel(multiSelectModel);
					_oMultiSelect.bindAggregation("items", "/", _oMultiItemTemplate);
					_formElement.addField(_oMultiSelect);
					break;
				case "Select":
					//_formElement.addField(oField)
					let model = new sap.ui.model.json.JSONModel();
					//For Non Food Allergens

					_.forEach(templateData, function(_data) {
						_data.isItemEnabled = !_data.isOnlyNonFood;
					});

					model.setData(templateData);
					model.setSizeLimit(templateData.length);

					let _oSelect = new sap.m.Select({
						forceSelection: false,
						//enabled: !isDisplay,
						showSecondaryValues: true,
						//enabled: "{createCatalogItemModel>/isNewArticle}",
						enabled: "{createCatalogItemModel>/" + modelKeyName + "enabled}",
						selectedKey: "{createCatalogItemModel>/" + modelKeyName + "}",
					});
					var _oItemTemplate = new sap.ui.core.ListItem({
						key: "{code}",
						text: "{description}",
						additionalText: "{code}",
						enabled: "{isItemEnabled}" //For Non Food Allergens
					});

					_oSelect.setModel(model);
					_oSelect.bindAggregation("items", "/", _oItemTemplate);
					_oSelect.addStyleClass("customSelectClass");
					_formElement.addField(_oSelect);
					break;
				case "Input":
					let _oInput = new sap.m.Input({
						value: "{createCatalogItemModel>/" + modelKeyName + "}",
						type: inputType,
						//editable: "{createCatalogItemModel>/isNewArticle}",
						editable: "{createCatalogItemModel>/" + modelKeyName + "enabled}",

						//editable: !isDisplay
					});
					inputLength = that.getConstants("language2") === 'JA' ? Math.round(inputLength / 2) : inputLength;
					_oInput.setMaxLength(inputLength);
					if (inputType === 'Number') {
						_oInput.attachBrowserEvent("keypress", function(oEvent) {
							let _charCode = (oEvent.which) ? oEvent.which : oEvent.keyCode;
							if (_charCode != 46 && _charCode > 31 && (_charCode < 48 || _charCode > 57)) {
								oEvent.preventDefault();
							}
						});
					}
					_formElement.addField(_oInput);
					break;
				case "Checkbox":
					let _oCheckBox = new sap.m.CheckBox({
						selected: "{createCatalogItemModel>/" + modelKeyName + "}",
						//editable: !isDisplay
						editable: "{createCatalogItemModel>/isNewArticle}"
					});
					_formElement.addField(_oCheckBox);
					break;
			}
			return _formElement;
		},
		_generateForm: function(numberOfColumns, data, isDisplay) {
			let that = this;
			//console.log(data);
			let _responsiveGridLayout = new sap.ui.layout.form.ResponsiveGridLayout({
				adjustLabelSpan: false,
				columnsL: data.length >= Number(numberOfColumns) ? Number(numberOfColumns) : data.length,
				labelSpanL: numberOfColumns == 3 ? 6 : 3,
				columnsM: 1,
				labelSpanM: 2,
				labelSpanS: 12
			});
			let _form = new sap.ui.layout.form.Form({
				width: "100%",
				editable: true,
				visible: true,
				layout: _responsiveGridLayout
			});
			let _splitArrays = data;
			if (data.length >= Number(numberOfColumns)) {
				_splitArrays = _.chunk(data, Math.ceil(data.length / Number(numberOfColumns)));
			}
			console.log("Split Arrays");
			console.log(_splitArrays);
			if (_splitArrays.length > 1) {
				_.forEach(_splitArrays, function(splitArray) {
					let formContainer = new sap.ui.layout.form.FormContainer({});
					_.forEach(splitArray, function(splitArrayObject) {

						let _formElement = that._generateFormElement(splitArrayObject.type,
							splitArrayObject.dataValues,
							splitArrayObject.attributeKey,
							splitArrayObject.attributeText,
							isDisplay,
							splitArrayObject.isRequired,
							splitArrayObject.inputType,
							splitArrayObject.dataLength);
						formContainer.addFormElement(_formElement);
					});
					_form.addFormContainer(formContainer);
				});
			} else {
				_.forEach(_splitArrays, function(splitArrayObject) {
					let formContainer = new sap.ui.layout.form.FormContainer({});
					let _formElement = that._generateFormElement(splitArrayObject.type,
						splitArrayObject.dataValues,
						splitArrayObject.attributeKey,
						splitArrayObject.attributeText,
						isDisplay,
						splitArrayObject.isRequired,
						splitArrayObject.inputType,
						splitArrayObject.dataLength);
					formContainer.addFormElement(_formElement);
					_form.addFormContainer(formContainer);
				});
			}

			return _form;
		},
		_validateRequestTabWise: function(_dataObj, i18nModel, attributesModel, _tabKey) {

			let _validateMandatoryProps = [{
				"key": "articleType",
				"msg": "lblArticleType",
				"isi18n": true,
				"isCNMandatory": true,
				"tabKey": "GENERAL"
			}, {
				"key": "articleDescription",
				"msg": "lblCompassArticleDescription",
				"isi18n": true,
				"isCNMandatory": true,
				"tabKey": "GENERAL"
			}, {
				"key": "level1Code",
				"msg": "lblL1",
				"isi18n": true,
				"isCNMandatory": true,
				"tabKey": "GENERAL"
			}, {
				"key": "level2Code",
				"msg": "lblL2",
				"isi18n": true,
				"isCNMandatory": true,
				"tabKey": "GENERAL"
			}, {
				"key": "level3Code",
				"msg": "lblL3",
				"isi18n": true,
				"isCNMandatory": true,
				"tabKey": "GENERAL"
			}, {
				"key": "level4Code",
				"msg": "lblL4",
				"isi18n": true,
				"isCNMandatory": true,
				"tabKey": "GENERAL"
			}, {
				"key": "storageCondition",
				"msg": "lblStorageCondition",
				"isCNMandatory": false,
				"isi18n": true,
				"tabKey": "GENERAL"
			}, {
				"key": "baseUOM",
				"msg": "lblBaseUnitOfMeasure",
				"isi18n": true,
				"isCNMandatory": true,
				"tabKey": "GENERAL"
			}, {
				"key": "validFrom",
				"msg": "lblValidFrom",
				"isi18n": true,
				"isCNMandatory": true,
				"tabKey": "PRICING"
			}, {
				"key": "validTo",
				"msg": "lblValidTo",
				"isi18n": true,
				"isCNMandatory": true,
				"tabKey": "PRICING"
			}, {
				"key": "offVendorPrice",
				"msg": "lblOffVendorPrice",
				"isi18n": true,
				"isCNMandatory": true,
				"tabKey": "PRICING"
			}, {
				"key": "taxPercentage",
				"msg": "lblTax",
				"isi18n": true,
				"isCNMandatory": true,
				"tabKey": "PRICING"
			}];

			let _mandatoryAttributes = _dataObj["level2Code"] === 'CF' || _dataObj["level2Code"] === undefined ? _.filter(attributesModel.getData(), {
				'isRequired': true,
				'isVendorVisible': true
			}) : _.filter(attributesModel.getData(), {
				'isRequiredNonFood': true,
				'isVendorVisible': true
			});

			// let _mandatoryAttributes = _.filter(attributesModel.getData(), {
			// 	'isRequired': true,
			// 	'isVendorVisible': true
			// });
			_.forEach(_mandatoryAttributes, function(attribute) {
				_validateMandatoryProps.push({
					"key": attribute["attributeKey"],
					"msg": attribute["attributeText"],
					"isi18n": false,
					"isCNMandatory": attribute["isRequiredNonFood"],
					"tabKey": "ATTRIBUTES"
				});
			});
			let _msg = [];
			// let _validityCheck = _.filter(_validateMandatoryProps, {
			// 	"tabKey": _tabKey
			// });

			let _validityCheck = _dataObj["level2Code"] === 'CF' || _dataObj["level2Code"] === undefined ? _.filter(_validateMandatoryProps, {
				"tabKey": _tabKey,
			}) : _.filter(_validateMandatoryProps, {
				"tabKey": _tabKey,
				"isCNMandatory": true
			});

			_.forEach(_validityCheck, function(mandatoryProps) {
				if (_.has(_dataObj, mandatoryProps.key) && !_.isEmpty(_dataObj[mandatoryProps.key].toString())) {
					//Checking if field is number
					//if (Number(_dataObj[mandatoryProps.key]) !== 'Nan' && Number(_dataObj[mandatoryProps.key]) === 0)
					if (Number(_dataObj[mandatoryProps.key]) !== 'Nan' && Number(_dataObj[mandatoryProps.key]) === 0) {
						if (mandatoryProps.key !== 'offVendorPrice') {
							_msg.push(i18nModel.getResourceBundle().getText("warningZero", i18nModel.getResourceBundle().getText("lblOffVendorPrice")));
						}
					} else {
						//debugger;
					}
				} else {
					if (mandatoryProps.isi18n) {
						_msg.push(i18nModel.getResourceBundle().getText("validationNotBlank", i18nModel.getResourceBundle().getText(mandatoryProps.msg)));
					} else {
						_msg.push(i18nModel.getResourceBundle().getText("validationNotBlank", mandatoryProps.msg));
					}

				}
			});

			let _dataValidationMsg = this._dataValidation(_dataObj, i18nModel);
			_msg = _msg.concat(_dataValidationMsg);
			let _returnObj = {
				isValid: _msg.length === 0,
				message: _msg.join('\r\n')
			}
			return _returnObj;
		},
		_validateRequestPriceUpdate: function(_dataObj, i18nModel, unitOfMeasureModel) {
			let that = this;
			let _validateMandatoryProps = [{
				"key": "articleCode",
				"altKey": "oldArticleCode",
				"msg": "lblArticleCode",
				"isi18n": true,
				"isDate": false,
				"isPrice": false
			}, {
				"key": "validFrom",
				"altKey": "validFrom",
				"msg": "lblValidFrom",
				"isi18n": true,
				"isDate": true,
				"isPrice": false
			}, {
				"key": "validTo",
				"altKey": "validTo",
				"msg": "lblValidTo",
				"isi18n": true,
				"isDate": false,
				"isPrice": false
			}, {
				"key": "offVendorPrice",
				"altKey": "offVendorPrice",
				"msg": "lblOffVendorPrice",
				"isi18n": true,
				"isDate": false,
				"isPrice": true
			}, {
				"key": "taxPercentage",
				"altKey": "taxPercentage",
				"msg": "lblTax",
				"isi18n": true,
				"isDate": false,
				"isPrice": false
			}];
			let _msg = [];
			_.forEach(_validateMandatoryProps, function(mandatoryProps) {
				if (_.has(_dataObj, mandatoryProps.altKey) && !_.isEmpty(_dataObj[mandatoryProps.altKey].toString())) {
					if (mandatoryProps.isPrice) {
						if (!_.isInteger(Number(_dataObj[mandatoryProps.key]))) {
							_msg.push(i18nModel.getResourceBundle().getText("validationIncorrectFormat", i18nModel.getResourceBundle().getText(
								mandatoryProps.msg)));
						}
					}
					if (mandatoryProps.isDate) {
						// if (!moment(_dataObj[mandatoryProps.key], "YYYY.MM.DD", true).isValid()) {
						// 	_msg.push(i18nModel.getResourceBundle().getText("validationFormat", i18nModel.getResourceBundle().getText(mandatoryProps.msg)));
						// }
						if (!moment(_dataObj[mandatoryProps.key], that.getConstants("dateFormat"), true).isValid()) {
							// this.getView().getModel("i18n").getResourceBundle().getText("asnQuantityError", [
							// 	oData.PoNumber,
							// 	oData.PoItem
							// ])
							//_msg.push(i18nModel.getResourceBundle().getText("validationFormat", i18nModel.getResourceBundle().getText(mandatoryProps.msg)));

							_msg.push(i18nModel.getResourceBundle().getText("validationFormat", [i18nModel.getResourceBundle().getText(mandatoryProps.msg),
								that.getConstants('dateFormat')
							]));

						}
					}
				} else {
					if (_.has(_dataObj, mandatoryProps.key) && !_.isEmpty(_dataObj[mandatoryProps.key].toString())) {

					} else {
						if (mandatoryProps.isi18n) {
							_msg.push(i18nModel.getResourceBundle().getText("validationNotBlank", i18nModel.getResourceBundle().getText(mandatoryProps.msg)));
						}
					}

				}
				if (_.has(_dataObj, mandatoryProps.key) && !_.isEmpty(_dataObj[mandatoryProps.key].toString())) {
					if (mandatoryProps.isPrice) {
						if (!_.isInteger(Number(_dataObj[mandatoryProps.key]))) {
							_msg.push(i18nModel.getResourceBundle().getText("validationIncorrectFormat", i18nModel.getResourceBundle().getText(
								mandatoryProps.msg)));
						}
					}
					if (mandatoryProps.isDate) {
						// if (!moment(_dataObj[mandatoryProps.key], "YYYY.MM.DD", true).isValid()) {
						// 	_msg.push(i18nModel.getResourceBundle().getText("validationFormat", i18nModel.getResourceBundle().getText(mandatoryProps.msg)));
						// }

						if (!moment(_dataObj[mandatoryProps.key], that.getConstants("dateFormat"), true).isValid()) {
							//_msg.push(i18nModel.getResourceBundle().getText("validationFormat", i18nModel.getResourceBundle().getText(mandatoryProps.msg)));

							_msg.push(i18nModel.getResourceBundle().getText("validationFormat", [i18nModel.getResourceBundle().getText(mandatoryProps.msg),
								that.getConstants('dateFormat')
							]));
						}
					}
				} else {
					if (_.has(_dataObj, mandatoryProps.altKey) && !_.isEmpty(_dataObj[mandatoryProps.altKey].toString())) {
						if (mandatoryProps.isPrice) {
							if (!_.isInteger(Number(_dataObj[mandatoryProps.key]))) {
								_msg.push(i18nModel.getResourceBundle().getText("validationIncorrectFormat", i18nModel.getResourceBundle().getText(
									mandatoryProps.msg)));
							}
						}
						if (mandatoryProps.isDate) {
							// if (!moment(_dataObj[mandatoryProps.key], "YYYY.MM.DD", true).isValid()) {
							// 	_msg.push(i18nModel.getResourceBundle().getText("validationFormat", i18nModel.getResourceBundle().getText(mandatoryProps.msg)));
							// }
							if (!moment(_dataObj[mandatoryProps.key], that.getConstants("dateFormat"), true).isValid()) {
								//_msg.push(i18nModel.getResourceBundle().getText("validationFormat", i18nModel.getResourceBundle().getText(mandatoryProps.msg)));
								_msg.push(i18nModel.getResourceBundle().getText("validationFormat", [
									i18nModel.getResourceBundle().getText(mandatoryProps.msg),
									that.getConstants('dateFormat')
								]));
							}
						}
					} else {
						if (mandatoryProps.isi18n) {
							_msg.push(i18nModel.getResourceBundle().getText("validationNotBlank", i18nModel.getResourceBundle().getText(mandatoryProps.msg)));
						} else {
							_msg.push(i18nModel.getResourceBundle().getText("validationNotBlank", mandatoryProps.msg));
						}
					}

				}
			});

			//Changes to check the Base UOM
			if (!_.find(unitOfMeasureModel.getData(), {
					'code': _dataObj["baseUOM"]
				})) {
				_msg.push(i18nModel.getResourceBundle().getText("validationMissingUOM", _dataObj["articleCode"]));
			}

			let _dataValidationMsg = this._dataValidation(_dataObj, i18nModel);
			_msg = _msg.concat(_dataValidationMsg);
			_msg = _.uniq(_msg);
			let _returnObj = {
				isValid: _msg.length === 0,
				message: _msg.join('\r\n')
			}

			return _returnObj;
		},
		_validateRequest: function(_dataObj, i18nModel, attributesModel) {
			let that = this;
			let _validateMandatoryProps = [{
				"key": "articleType",
				"msg": "lblArticleType",
				"isCNMandatory": true,
				"isi18n": true,
				"isDate": false,
				"isPrice": false
			}, {
				"key": "articleDescription",
				"msg": "lblCompassArticleDescription",
				"isCNMandatory": true,
				"isi18n": true,
				"isDate": false,
				"isPrice": false
			}, {
				"key": "level1Code",
				"msg": "lblL1",
				"isCNMandatory": true,
				"isi18n": true,
				"isDate": false,
				"isPrice": false
			}, {
				"key": "level2Code",
				"msg": "lblL2",
				"isCNMandatory": true,
				"isi18n": true,
				"isDate": false,
				"isPrice": false
			}, {
				"key": "level3Code",
				"msg": "lblL3",
				"isCNMandatory": true,
				"isi18n": true,
				"isDate": false,
				"isPrice": false
			}, {
				"key": "level4Code",
				"msg": "lblL4",
				"isCNMandatory": true,
				"isi18n": true,
				"isDate": false,
				"isPrice": false
			}, {
				"key": "storageCondition",
				"msg": "lblStorageCondition",
				"isCNMandatory": false,
				"isi18n": true,
				"isDate": false,
				"isPrice": false
			}, {
				"key": "baseUOM",
				"msg": "lblBaseUnitOfMeasure",
				"isCNMandatory": true,
				"isi18n": true,
				"isDate": false,
				"isPrice": false
			}, {
				"key": "validFrom",
				"msg": "lblValidFrom",
				"isCNMandatory": true,
				"isi18n": true,
				"isDate": true,
				"isPrice": false
			}, {
				"key": "validTo",
				"msg": "lblValidTo",
				"isCNMandatory": true,
				"isi18n": true,
				"isDate": true,
				"isPrice": false
			}, {
				"key": "offVendorPrice",
				"msg": "lblOffVendorPrice",
				"isCNMandatory": true,
				"isi18n": true,
				"isDate": false,
				"isPrice": true
			}, {
				"key": "taxPercentage",
				"msg": "lblTax",
				"isCNMandatory": true,
				"isi18n": true,
				"isDate": false,
				"isPrice": false
			}, {
				"key": "contractPrice",
				"msg": "lblContractPrice",
				"isCNMandatory": true,
				"isi18n": true,
				"isDate": false,
				"isPrice": false
			}];

			/*Begin of Changes for Numeric Fields Validation 27.07.2022*/
			let _validateNumericProps = [{
				"key": "minimumQuantity",
				"msg": "lblMinimumOrderQty",
				"isCNMandatory": false,
				"isi18n": true,
				"isDate": false,
				"isPrice": false
			}, {
				"key": "conversionFactor",
				"msg": "lblConversionFactor",
				"isCNMandatory": false,
				"isi18n": true,
				"isDate": false,
				"isPrice": false
			}, {
				"key": "shelfLife",
				"msg": "lblShelfLife",
				"isCNMandatory": false,
				"isi18n": true,
				"isDate": false,
				"isPrice": false
			}];
			/*End Of Changes for Numeric Fields Validation  27.07.2022*/

			let _msg = [];
			if (_dataObj["articleCode"] === "" || _dataObj["articleCode"] === undefined) {
				// let _mandatoryAttributes = _.filter(attributesModel.getData(), {
				// 	'isRequired': true,
				// 	'isVendorVisible': true
				// });

				let _mandatoryAttributes = _dataObj["level2Code"] === 'CF' || _dataObj["level2Code"] === undefined ? _.filter(attributesModel.getData(), {
					'isRequired': true,
					'isVendorVisible': true
				}) : _.filter(attributesModel.getData(), {
					'isRequiredNonFood': true,
					'isVendorVisible': true
				});

				/*Begin of Changes for non mandatory numeric fiels 27.07.2022*/
				let _numericMandatoryAttributes = _dataObj["level2Code"] === 'CF' || _dataObj["level2Code"] === undefined ? _.filter(attributesModel
					.getData(), {
						'isRequired': true,
						'isVendorVisible': true,
						'dataType': 'NUM'
					}) : _.filter(attributesModel.getData(), {
					'isRequiredNonFood': true,
					'isVendorVisible': true,
					'dataType': 'NUM'
				});
				/*End of Changes for non mandatory numeric fiels 27.07.2022*/
				_.forEach(_mandatoryAttributes, function(attribute) {
					_validateMandatoryProps.push({
						"key": attribute["attributeKey"],
						"msg": attribute["attributeText"],
						"isCNMandatory": attribute["isRequiredNonFood"],
						"isi18n": false,
						"isDate": false,
						"isPrice": false
					});
				});

				_validateMandatoryProps = _dataObj["level2Code"] === 'CN' ? _.filter(_validateMandatoryProps, {
					"isCNMandatory": true
				}) : _validateMandatoryProps;

				_.forEach(_validateMandatoryProps, function(mandatoryProps) {
					if (_.has(_dataObj, mandatoryProps.key) && !_.isEmpty(_dataObj[mandatoryProps.key].toString())) {
						if (mandatoryProps.isPrice) {
							if (!_.isInteger(Number(_dataObj[mandatoryProps.key]))) {
								_msg.push(i18nModel.getResourceBundle().getText("validationIncorrectFormat", i18nModel.getResourceBundle().getText(
									mandatoryProps.msg)));
							}
						}
						if (mandatoryProps.isDate) {
							// if (!moment(_dataObj[mandatoryProps.key], "YYYY.MM.DD", true).isValid()) {
							// 	_msg.push(i18nModel.getResourceBundle().getText("validationFormat", i18nModel.getResourceBundle().getText(mandatoryProps.msg)));
							// }

							if (!moment(_dataObj[mandatoryProps.key], that.getConstants("dateFormat"), true).isValid()) {
								//_msg.push(i18nModel.getResourceBundle().getText("validationFormat", i18nModel.getResourceBundle().getText(mandatoryProps.msg)));

								_msg.push(i18nModel.getResourceBundle().getText("validationFormat", [i18nModel.getResourceBundle().getText(mandatoryProps.msg),
									that.getConstants('dateFormat')
								]));
							}
						}
					} else {
						if (mandatoryProps.isi18n) {
							_msg.push(i18nModel.getResourceBundle().getText("validationNotBlank", i18nModel.getResourceBundle().getText(mandatoryProps.msg)));
						} else {
							_msg.push(i18nModel.getResourceBundle().getText("validationNotBlank", mandatoryProps.msg));
						}

					}
				});

				/*Begin of Changes for non mandatory numeric fiels 27.07.2022*/

				_.forEach(_numericMandatoryAttributes, function(attribute) {
					_validateNumericProps.push({
						"key": attribute["attributeKey"],
						"msg": attribute["attributeText"],
						"isCNMandatory": attribute["isRequiredNonFood"],
						"isi18n": false,
						"isDate": false,
						"isPrice": false
					});
				});

				_.forEach(_validateNumericProps, function(numericProps) {
					if (_.has(_dataObj, numericProps.key) && !_.isEmpty(_dataObj[numericProps.key].toString())) {
						if (_.isNaN(Number(_dataObj[numericProps.key]))) {
							if (numericProps.isi18n) {
								_msg.push(i18nModel.getResourceBundle().getText("validationNumericFormat", i18nModel.getResourceBundle().getText(
									numericProps.msg)));
							} else {
								_msg.push(i18nModel.getResourceBundle().getText("validationNumericFormat", numericProps.msg));
							}
						}
					}
				});
				/*End Changes for non mandatory numeric fiels 27.07.2022*/

			} else {

				_validateMandatoryProps = _dataObj["level2Code"] === 'CN' ? _.filter(_validateMandatoryProps, {
					"isCNMandatory": true
				}) : _validateMandatoryProps;

				_.forEach(_validateMandatoryProps, function(mandatoryProps) {
					if (_.has(_dataObj, mandatoryProps.key) && !_.isEmpty(_dataObj[mandatoryProps.key].toString())) {
						if (mandatoryProps.isPrice) {
							if (!_.isInteger(Number(_dataObj[mandatoryProps.key]))) {
								_msg.push(i18nModel.getResourceBundle().getText("validationIncorrectFormat", i18nModel.getResourceBundle().getText(
									mandatoryProps.msg)));
							}
						}

						if (mandatoryProps.isDate) {
							// if (!moment(_dataObj[mandatoryProps.key], "YYYY.MM.DD", true).isValid()) {
							// 	_msg.push(i18nModel.getResourceBundle().getText("validationFormat", i18nModel.getResourceBundle().getText(mandatoryProps.msg)));
							// }

							if (!moment(_dataObj[mandatoryProps.key], that.getConstants("dateFormat"), true).isValid()) {
								//_msg.push(i18nModel.getResourceBundle().getText("validationFormat", i18nModel.getResourceBundle().getText(mandatoryProps.msg)));
								_msg.push(i18nModel.getResourceBundle().getText("validationFormat", [i18nModel.getResourceBundle().getText(mandatoryProps.msg),
									that.getConstants('dateFormat')
								]));
							}
						}
					} else {
						if (mandatoryProps.isi18n) {
							_msg.push(i18nModel.getResourceBundle().getText("validationNotBlank", i18nModel.getResourceBundle().getText(mandatoryProps.msg)));
						} else {
							_msg.push(i18nModel.getResourceBundle().getText("validationNotBlank", mandatoryProps.msg));
						}
					}
				});
			}

			let _dataValidationMsg = this._dataValidation(_dataObj, i18nModel);
			_msg = _msg.concat(_dataValidationMsg);
			let _returnObj = {
				isValid: _msg.length === 0,
				message: _msg.join('\r\n')
			}

			return _returnObj;
		},
		_convertValuesFromExcel: function(key, _object, i18nModel) {
			let that = this;
			let oBundle = i18nModel.getResourceBundle();
			switch (key) {
				case 'articleTypeIndex':
					if (_object[key] === "ZJFS") {
						_object["articleType"] = 'ZJFS';
						_object["articleTypeText"] = oBundle.getText("lblFood");
						_object[key] = 0;
					} else {
						_object["articleType"] = 'ZJNS';
						_object["articleTypeText"] = oBundle.getText("lblNonFood");
						_object[key] = 1;
					}
					break;
				case 'validFrom':
					//_object["clearValidFromDate"] = moment(_object[key], "YYYY.MM.DD")._d;
					_object["clearValidFromDate"] = moment(_object[key], that.getConstants("dateFormat"))._d;
					break;
				case 'validTo':
					//_object["clearValidToDate"] = moment(_object[key], "YYYY.MM.DD")._d;
					_object["clearValidToDate"] = moment(_object[key], that.getConstants("dateFormat"))._d;
					break;
			}
			return _object;
		},
		_validateExcelPriceUpdate: function(data, _headerKeyValues, i18nModel, unitOfMeasureModel) {
			let that = this;
			let _validationDataArray = [];
			let _articleDCObject = {};
			let _data = [];
			if (data.length > 1) {
				_data = data;
			} else {
				if (_.isObject(data[0])) {
					_data.push(data[0]);
				}
			}
			if (_data.length > 0) {
				_.forEach(_data, function(_dataRow) {
					_articleDCObject = {};
					let _keys = Object.keys(_dataRow);
					_.forEach(_keys, function(_key) {
						let _columnKeyObj = _.find(_headerKeyValues, {
							'valueText': _key
						});
						if (_columnKeyObj) {
							_articleDCObject[_columnKeyObj["key"]] = _.isNumber(_dataRow[_key]) ? that.padWithZeros(_dataRow[_key].toString(), 2) :
								_dataRow[_key];
							_articleDCObject = that._convertValuesFromExcel('validFrom', _articleDCObject, i18nModel);
							_articleDCObject = that._convertValuesFromExcel('validTo', _articleDCObject, i18nModel);
						}

					});
					let _isValid = that._validateRequestPriceUpdate(_articleDCObject, i18nModel, unitOfMeasureModel);
					_validationDataArray.push({
						"article": _articleDCObject["articleCode"] !== "" && _articleDCObject["articleCode"] !== undefined ? _articleDCObject[
							"articleCode"] : _articleDCObject["oldArticleCode"],
						"isValid": _isValid.isValid,
						"validMessage": _isValid.message
					});
				});
			}
			let _returnObj = {
				isValid: _.filter(_validationDataArray, {
					isValid: false
				}).length === 0,
				message: JSON.stringify(_.filter(_validationDataArray, {
					isValid: false
				}))
			}
			return _returnObj;
		},
		_validateExcel: function(data, _headerKeyValues, i18nModel, attributesModel, accountGroup, supplierCode, manufacturerVendorModel) {
			let that = this;
			let _validationDataArray = [];
			let _articleDCObject = {};
			let _data = [];
			if (data.length > 1) {
				_data = data;
			} else {
				if (_.isObject(data[0])) {
					_data.push(data[0]);
				}
			}
			if (_data.length > 0) {
				_.forEach(_data, function(_dataRow) {
					_articleDCObject = {};
					let _keys = Object.keys(_dataRow);
					let attributesData = _.filter(attributesModel.getData(), {
						'isVendorVisible': true
					});
					_.forEach(_keys, function(_key) {
						let _columnKeyObj = _.find(_headerKeyValues, {
							'valueText': _key
						});
						if (_columnKeyObj) {
							if (_.find(attributesData, {
									'attributeKey': _columnKeyObj.key
								}) === undefined) {
								_articleDCObject[_columnKeyObj["key"]] = _.isNumber(_dataRow[_key]) ? that.padWithZeros(_dataRow[_key].toString(), 2) :
									_dataRow[_key];
							} else {
								let _dataObj = _.find(attributesData, {
									'attributeKey': _columnKeyObj.key
								});
								let _dataLength = _.find(attributesData, {
									'attributeKey': _columnKeyObj.key
								}).dataLength;
								_articleDCObject[_columnKeyObj["key"]] = _.isNumber(_dataRow[_key]) ? _dataObj.type === 'Select' ? that.padWithZeros(
										_dataRow[
											_key].toString(), _dataObj.dataLength) : _dataObj.dataType === 'NUM' ? _dataRow[_key] : _dataRow[_key].toString() :
									_dataRow[_key].toString();
							}
						}

					});
					_articleDCObject = that._convertValuesFromExcel('articleTypeIndex', _articleDCObject, i18nModel);
					_articleDCObject = that._convertValuesFromExcel('validFrom', _articleDCObject, i18nModel);
					_articleDCObject = that._convertValuesFromExcel('validTo', _articleDCObject, i18nModel);
					console.log("Excel Validation Object");
					console.log(_articleDCObject);

					let _isValid = that._validateRequest(_articleDCObject, i18nModel, attributesModel);

					//Check if Manufacturere code is correct
					if (_.has(_articleDCObject, "manufacturerVendorCode") && _articleDCObject["manufacturerVendorCode"] !== "") {
						let _isManufacturerObject = _.find(manufacturerVendorModel.getData(), {
							'supplierCode': Number(_articleDCObject["manufacturerVendorCode"]).toString()
						});
						if (!_isManufacturerObject) {
							_isValid.isValid = false;
							if (_isValid.message !== "") {
								_isValid.message = _.concat(_isValid.message, i18nModel.getResourceBundle().getText("validationWrongVendor",
									_articleDCObject["manufacturerVendorCode"])).join('\r\n');
							} else {
								_isValid.message = i18nModel.getResourceBundle().getText("validationWrongVendor", _articleDCObject["manufacturerVendorCode"]);
							}
						}
					}
					//Check if correct contract price is selected
					if (_.has(_articleDCObject, "contractPrice") && _articleDCObject["contractPrice"] !== "") {
						if (_articleDCObject["contractPrice"] === '01' && _articleDCObject["orderingUnit"] === "") {
							_isValid.isValid = false;
							if (_isValid.message !== "") {
								_isValid.message = _.concat(_isValid.message, i18nModel.getResourceBundle().getText("validationPriceLevel",
									i18nModel.getResourceBundle().getText("lblContractPrice"))).join('\r\n');
							} else {
								_isValid.message = i18nModel.getResourceBundle().getText("validationPriceLevel", i18nModel.getResourceBundle().getText(
									"lblContractPrice"));
							}
						}
					}

					//check if vendor code is same as manufacturer code
					if (_.has(_articleDCObject, "manufacturerVendorCode") && _articleDCObject["manufacturerVendorCode"] !== "") {
						let _validationFlagVendor = true;
						if (Number(_articleDCObject["manufacturerVendorCode"]).toString() === supplierCode) {
							_validationFlagVendor = false;
						}
						if (!_validationFlagVendor) {
							_isValid.isValid = false;
							if (_isValid.message !== "") {
								_isValid.message = _.concat(_isValid.message, i18nModel.getResourceBundle().getText("validationVendorCode",
									i18nModel.getResourceBundle().getText("lblManufacturerVendorCode"))).join('\r\n');
							} else {
								_isValid.message = i18nModel.getResourceBundle().getText("validationVendorCode", i18nModel.getResourceBundle().getText(
									"lblManufacturerVendorCode"));
							}
						}
					}

					//Check is inventory classification is correct
					if (_.has(_articleDCObject, "INVENTORY_TYPE_CLASSIFICATION") && _articleDCObject["INVENTORY_TYPE_CLASSIFICATION"] !== "") {
						let _allowedIC = [];
						let _validationFlag = true;
						switch (accountGroup) {
							case "Z010":
							case "Z011":
								_allowedIC = ["1"];
								_validationFlag = _allowedIC.indexOf(_articleDCObject["INVENTORY_TYPE_CLASSIFICATION"].toString()) !== -1;
								break;
							case "Z001":
								_allowedIC = ["2", "3", "4", "5"];
								_validationFlag = _allowedIC.indexOf(_articleDCObject["INVENTORY_TYPE_CLASSIFICATION"].toString()) !== -1;
								break;
						}

						if (!_validationFlag) {
							_isValid.isValid = false;
							if (_isValid.message !== "") {
								_isValid.message = _.concat(_isValid.message, i18nModel.getResourceBundle().getText("validationInventoryClassification",
									i18nModel.getResourceBundle()
									.getText("lblInventoryClassification"))).join('\r\n');
							} else {
								_isValid.message = i18nModel.getResourceBundle().getText("validationInventoryClassification", i18nModel.getResourceBundle().getText(
									"lblInventoryClassification"));
							}
						}
					}

					if (accountGroup === 'Z010') {
						if (_.has(_articleDCObject, 'shelfLife') && _articleDCObject["shelfLife"] === "") {
							_isValid.isValid = false;
							if (_isValid.message !== "") {
								_isValid.message = _.concat(_isValid.message, i18nModel.getResourceBundle().getText("validationNotBlank", i18nModel.getResourceBundle()
									.getText("lblShelfLife"))).join('\r\n');
							} else {
								_isValid.message = i18nModel.getResourceBundle().getText("validationNotBlank", i18nModel.getResourceBundle().getText(
									"lblShelfLife"));
							}
						} else if (!_.has(_articleDCObject, 'shelfLife')) {
							_isValid.isValid = false;
							if (_isValid.message !== "") {
								_isValid.message = _.concat(_isValid.message, i18nModel.getResourceBundle().getText("validationNotBlank", i18nModel.getResourceBundle()
									.getText("lblShelfLife"))).join('\r\n');
							} else {
								_isValid.message = i18nModel.getResourceBundle().getText("validationNotBlank", i18nModel.getResourceBundle().getText(
									"lblShelfLife"));
							}
						}
					}
					//Check if attachment id given
					/*if (_.has(_articleDCObject, "attachmentId") && _articleDCObject["attachmentId"] !== "") {

					} else {
						_isValid.isValid = false;
						if (_isValid.message !== "") {
							_isValid.message = _.concat(_isValid.message, i18nModel.getResourceBundle().getText("validationNotBlank", i18nModel.getResourceBundle()
								.getText("lblAttachmentId"))).join('\r\n');
						} else {
							_isValid.message = i18nModel.getResourceBundle().getText("validationNotBlank", i18nModel.getResourceBundle().getText(
								"lblAttachmentId"));
						}
					}*/
					_validationDataArray.push({
						"article": _articleDCObject["articleDescription"],
						"isValid": _isValid.isValid,
						"validMessage": _isValid.message
					});
				});
			}
			console.log(_validationDataArray);

			let _returnObj = {
				isValid: _.filter(_validationDataArray, {
					isValid: false
				}).length === 0,
				message: JSON.stringify(_.filter(_validationDataArray, {
					isValid: false
				}))
			}
			return _returnObj;
		},
		_dataValidation: function(_dataObj, i18nModel) {
			//Check if base unit and UOM are same
			let _msg = [];
			if (_dataObj["orderingUnit"] && _dataObj["baseUOM"] && (_dataObj["orderingUnit"] !== "" && _dataObj["baseUOM"] !== "")) {
				if (_dataObj["orderingUnit"] === _dataObj["baseUOM"]) {
					_msg.push(i18nModel.getResourceBundle().getText("unitsSameValidation"));
				}
				if (_dataObj["conversionFactor"] === "" || _dataObj["conversionFactor"] === undefined) {
					_msg.push(i18nModel.getResourceBundle().getText("validationNotBlank", i18nModel.getResourceBundle().getText("lblConversionFactor")));
				}
			}
			if (_dataObj["conversionFactor"] !== "" && _dataObj["conversionFactor"] !== undefined && Number(_dataObj["conversionFactor"]) > 0) {
				if (!_dataObj["orderingUnit"]) {
					_msg.push(i18nModel.getResourceBundle().getText("validationNotBlank", i18nModel.getResourceBundle().getText("lblOrderingUnit")));
				}
				if (_dataObj["orderingUnit"] && _dataObj["orderingUnit"] === "") {
					_msg.push(i18nModel.getResourceBundle().getText("validationNotBlank", i18nModel.getResourceBundle().getText("lblOrderingUnit")));
				}
			}
			//Check Date Validity
			if (_dataObj["validTo"] && _dataObj["validFrom"] && (_dataObj["validTo"] !== "" && _dataObj["validFrom"] !== "")) {
				if (_dataObj["clearValidToDate"] && _dataObj["clearValidFromDate"] && (_dataObj["clearValidToDate"] !== "" && _dataObj[
						"clearValidFromDate"] !== "")) {
					if (_dataObj["clearValidToDate"] < _dataObj["clearValidFromDate"]) {
						_msg.push(i18nModel.getResourceBundle().getText("dateValidation"));
					}
				} else if (moment(_dataObj['validTo'])._d < moment(_dataObj['validFrom'])._d) {
					_msg.push(i18nModel.getResourceBundle().getText("dateValidation"));
				}

				// if (moment(_dataObj['validTo'])._d < moment(_dataObj['validFrom'])._d) {
				// 	_msg.push(i18nModel.getResourceBundle().getText("dateValidation"));
				// }
			}
			if (_dataObj["contractPrice"] === "1" && _dataObj["orderingUnit"] === undefined) {
				_msg.push(i18nModel.getResourceBundle().getText("orderUnitMandatoryValidation"));
			}

			//Check Shelf Life for Account Group Z010
			if (_dataObj['accountGroup'] === 'Z010' && _dataObj["shelfLife"] === undefined) {
				_msg.push(i18nModel.getResourceBundle().getText("validationNotBlank", i18nModel.getResourceBundle().getText("lblShelfLife")));
			}
			// if (_dataObj["offVendorPrice"] && Number(_dataObj["offVendorPrice"]) === 0){
			// 	_msg.push(i18nModel.getResourceBundle().getText("warningZero"),i18nModel.getResourceBundle().getText("lblOffVendorPrice"));
			// }
			return _msg;
		},
		_createJSONObjectAttachment: function(entitySet, attachment, vendorNo) {
			let obj = {};
			switch (entitySet) {
				case "Generate_attachmentSet":
					obj.Lifnr = vendorNo;
					obj.ZdocType = "";
					obj.ZfileData = attachment.fileData;
					obj.Zftitle = attachment.fileName;
					obj.ZfileName = attachment.fileName;
					obj.ZfileExt = attachment.fileExtension;
					break;
			}
			return obj;
		},
		_createJSONObject: function(entitySet, _headerData, itemData, attributesData, dcData, attachmentData, branchData) {
			let obj = {};
			switch (entitySet) {
				case "deletePO":
					obj.inputVendor = _headerData.inputVendor;
					let _itemData = [];
					_.forEach(itemData, function(item) {
						_itemData.push({
							"purchaseOrder": item.purchaseOrder,
							"item": item.item,
							"deletionQuantity": item.deletionQuantity,
							"deletionReason": item.deletionReason
						});
					});
					obj.lineItem = _itemData;
					obj.errorLog = [];
					break;
			}
			return obj;
		},
		_validatePreviewData: function(data, _weekData, i18nModel) {
			let that = this;
			let _validationDataArray = [];
			let oBundle = i18nModel.getResourceBundle();
			_.forEach(data, function(obj) {
				let _isValid = {
					isValid: true,
					message: ""
				};
				_.forEach(_weekData, function(_currentWeek) {
					let _visibleDates = _.orderBy(_currentWeek.dates, 'dayOfWeek', 'asc');
					_.forEach(_visibleDates, function(visibleDate) {
						if (!_.isEmpty(obj[moment(visibleDate.date).format("YYYYMMDD") + "USEDATE"]) &&
							_.isEmpty(obj[moment(visibleDate.date).format("YYYYMMDD") + "QTY"])) {
							_isValid.isValid = false;
							if (_isValid.message !== "") {
								_isValid.message = _.concat(_isValid.message, i18nModel.getResourceBundle().getText("vdm.validationNotBlankQty", moment(
									visibleDate.date).format(that.getConstants("dateFormat")))).join('\r\n');
							} else {
								_isValid.message = i18nModel.getResourceBundle().getText("vdm.validationNotBlankQty", moment(visibleDate.date).format(that
									.getConstants("dateFormat")));
							}
						}
						if (!_.isEmpty(obj[moment(visibleDate.date).format("YYYYMMDD") + "QTY"]) &&
							Number(obj[moment(visibleDate.date).format("YYYYMMDD") + "QTY"]) === 0) {
							_isValid.isValid = false;
							if (_isValid.message !== "") {
								_isValid.message = _.concat(_isValid.message, i18nModel.getResourceBundle().getText("vdm.validationNotZeroQty", moment(
									visibleDate.date).format(that.getConstants("dateFormat")))).join('\r\n');
							} else {
								_isValid.message = i18nModel.getResourceBundle().getText("vdm.validationNotZeroQty", moment(visibleDate.date).format(that.getConstants(
									"dateFormat")));
							}
						}
						if (!_.isEmpty(obj[moment(visibleDate.date).format("YYYYMMDD") + "QTY"]) &&
							Number(obj[moment(visibleDate.date).format("YYYYMMDD") + "QTY"]) > 0 &&
							obj["sectionCodeWeek" + _currentWeek.weekCode] === "") {
							_isValid.isValid = false;
							if (_isValid.message !== "") {
								_isValid.message = _.concat(_isValid.message, i18nModel.getResourceBundle().getText("vdm.validationSectionCode", moment(
									visibleDate.date).format(that.getConstants("dateFormat")))).join('\r\n');
							} else {
								_isValid.message = i18nModel.getResourceBundle().getText("vdm.validationSectionCode", moment(visibleDate.date).format(that
									.getConstants(
										"dateFormat")));
							}
						}
						if (!window.location.host.split(":")[0] === "localhost") {
							if (!_.isEmpty(obj[moment(visibleDate.date).format("YYYYMMDD") + "QTY"]) &&
								Number(obj[moment(visibleDate.date).format("YYYYMMDD") + "QTY"]) > 0 &&
								!_.isEmpty(obj[moment(visibleDate.date).format("YYYYMMDD") + "USEDATE"])) {
								if (!moment(obj[moment(visibleDate.date).format("YYYYMMDD") + "USEDATE"], that.getConstants("dateFormat"), true).isValid()) {
									_isValid.isValid = false;
									if (_isValid.message !== "") {
										_isValid.message = _.concat(_isValid.message, i18nModel.getResourceBundle().getText("vdm.validationFormatDate", moment(
											visibleDate.date).format(that.getConstants("dateFormat")))).join('\r\n');
									} else {
										_isValid.message = i18nModel.getResourceBundle().getText("vdm.validationFormatDate", moment(visibleDate.date).format(
											that
											.getConstants(
												"dateFormat")));
									}
								}
							}
						}
					});
				});
				_validationDataArray.push({
					"articleCode": obj["articleNoDisplay"],
					"article": obj["articleDescription"],
					"isValid": _isValid.isValid,
					"validMessage": _isValid.message
				});
			});
			let _returnObj = {
				isValid: _.filter(_validationDataArray, {
					isValid: false
				}).length === 0,
				message: JSON.stringify(_.filter(_validationDataArray, {
					isValid: false
				}))
			}
			return _returnObj;
		},
		_validateExcelItem: function(data, _headerKeyValues, i18nModel, _weekData) {
			let that = this;
			let _validationDataArray = [];
			let _articleData = [];
			let _data = [];
			if (data.length > 1) {
				_data = data;
			} else {
				if (_.isObject(data[0])) {
					_data.push(data[0]);
				}
			}
			if (_data.length > 0) {
				_.forEach(_data, function(_dataRow) {
					let _articleObject = {};
					let _keys = Object.keys(_dataRow);
					_.forEach(_keys, function(_key) {
						let _columnKeyObj = _.find(_headerKeyValues, {
							'valueText': _key
						});
						if (_columnKeyObj) {
							_articleObject[_columnKeyObj["key"]] = _.isNumber(_dataRow[_key]) ? _dataRow[_key].toString() : _dataRow[_key];
						} else {
							_articleObject[_key] = _.isNumber(_dataRow[_key]) ? _dataRow[_key].toString() : _dataRow[_key];
						}
					});
					_articleData.push(_articleObject);
				});
			}

			let _returnObj = that._validatePreviewData(_articleData, _weekData, i18nModel);
			_returnObj["data"] = _articleData;
			return _returnObj;
		}
	};
}());