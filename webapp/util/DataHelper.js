jQuery.sap.require("sap.ca.ui.dialog.factory");
jQuery.sap.declare("ZAMM_BED_OCCUP.util.DataHelper");

ZAMM_BED_OCCUP.util.DataHelper = (function() {
	vendorId = null;
	isAdmin = false;
	return {
		_getWeeksInYear: function(year) {
			let _d = new Date(year, 11, 31);
			return moment(_d).weeksInYear();
		},
		getConstants: function(variable) {
			switch (variable) {
				case "supplier":
					return DataHelper._getVendor() !== "" && DataHelper._getVendor() !== undefined ? DataHelper._getVendor() : "10000335";
					break;
				case "countryCode":
					return "JP";
					break;
				case "language1": //1 Character language
					let _language1 = sap.ui.getCore().getConfiguration().getLanguage().split("-")[0].toUpperCase();
					return _language1.substr(0, 1);
					break;
				case "language2": //1 Character language
					let _language2 = sap.ui.getCore().getConfiguration().getLanguage().split("-")[0].toUpperCase();
					return _language2;
					break;
				case 'dateFormat':
					let _userDateFormat = sap.ui.getCore().getConfiguration().getFormatSettings().getDatePattern("medium");
					return _userDateFormat && _userDateFormat !== undefined && _userDateFormat !== "" ? _userDateFormat.toUpperCase() : 'YYYY.MM.DD';
					break;
				case 'dateFormatDisplay':
					return 'DD/MM dddd';
					break;
				case 'fileLength':
					return sap.ui.getCore().getConfiguration().getLanguage().split("-")[0].toUpperCase().substr(0, 1) === 'J' ? 50 : 100;
					break;
			}
		},
		_getInBetweenDates: function(startDate, endDate) {
			var dates = [];
			var currDate = moment(startDate).startOf('day');
			var lastDate = moment(endDate).startOf('day');
			dates.push({
				'date': currDate.clone().toDate(),
				'dayOfWeek': currDate.clone().toDate().getDay(),
				'sortSequence': currDate.clone().toDate().getDay() === 0 ? 7 : currDate.clone().toDate().getDay(),
				'isShow': currDate.clone().toDate().getDay() > 0 && currDate.clone().toDate().getDay() < 6
			});
			while (currDate.add(1, 'days').diff(lastDate) < 0) {
				//console.log(currDate.toDate());
				dates.push({
					'date': currDate.clone().toDate(),
					'dayOfWeek': currDate.clone().toDate().getDay(),
					'sortSequence': currDate.clone().toDate().getDay() === 0 ? 7 : currDate.clone().toDate().getDay(),
					'isShow': currDate.clone().toDate().getDay() > 0 && currDate.clone().toDate().getDay() < 6
				});
			}
			dates.push({
				'date': lastDate.clone().toDate(),
				'dayOfWeek': lastDate.clone().toDate().getDay(),
				'sortSequence': lastDate.clone().toDate().getDay() === 0 ? 7 : lastDate.clone().toDate().getDay(),
				'isShow': lastDate.clone().toDate().getDay() > 0 && lastDate.clone().toDate().getDay() < 6
			});
			//dates.push(lastDate.clone().toDate());
			return dates;
		},
		cleanUpBlankEntries: function(_data, i18nModel) {
			let that = this;
			_.forEach(_data, function(dataObj, idx) {
				dataObj.serialNo = idx;
				dataObj.isRemove = _.values(dataObj).every(_.isEmpty);
				if (sap.ui.getCore().getConfiguration().getLanguage().split("-")[0].toUpperCase().substr(0, 1) === 'E') {
					if (!_.has(dataObj, i18nModel.getResourceBundle().getText("vdm.lblArticleDescription"))) {
						dataObj.isRemove = true;
					}
				} else {
					if (!_.has(dataObj, i18nModel.getResourceBundle().getText("vdm.lblArticleDescription"))) {
						dataObj.isRemove = true;
					}
				}
			});
			return _.remove(_data, {
				'isRemove': false
			});
		},
		extractExcelDataBackup: function(_file, isMassUpdate) {
			let excelData = {};
			if (_file && window.FileReader) {
				return new Promise(function(fnResolve, fnReject) {
					var reader = new FileReader();
					reader.onload = function(e) {
						var data = e.target.result;
						var workbook = XLSX.read(data, {
							type: 'binary'
						});
						workbook.SheetNames.forEach(function(sheetName) {
							// Here is your object for every sheet in workbook
							if (isMassUpdate) {
								if (sheetName === 'Template') {
									excelData = XLSX.utils.sheet_to_row_object_array(workbook.Sheets[sheetName]);

								}
							} else {
								if (sheetName === 'Template') {
									excelData = XLSX.utils.sheet_to_row_object_array(workbook.Sheets[sheetName]);
								}
							}
						});
						fnResolve(excelData);
					};
					reader.onerror = function(ex) {
						fnReject(ex);
					};
					reader.readAsBinaryString(_file);
				});

			}
		},
		extractExcelData: function(_file, isMassUpdate, i18nModel) {
			let excelData = {};
			let _excelArray = [];
			let _finalArray = [];
			let oBundle = i18nModel.getResourceBundle();
			if (_file && window.FileReader) {
				return new Promise(function(fnResolve, fnReject) {
					var reader = new FileReader();
					reader.onload = function(e) {
						var data = e.target.result;
						var workbook = XLSX.read(data, {
							type: 'binary'
						});
						workbook.SheetNames.forEach(function(sheetName) {
							// Here is your object for every sheet in workbook
							let _weekSpecificKeys = [{
								"key": "sectionCodeWeek",
								'value': 'vdm.lblSection',
								'isi18n': true
							}, {
								"key": "itemCommentWeek",
								'value': 'vdm.lblComment',
								'isi18n': true
							}];
							excelData = XLSX.utils.sheet_to_row_object_array(workbook.Sheets[sheetName]);
							if (_.isArray(excelData) && _excelArray.length > 0) {
								_.forEach(excelData, function(dataRow) {
									_.forEach(_weekSpecificKeys, function(keyPair) {
										if (_.has(dataRow, oBundle.getText(keyPair.value))) {
											dataRow[keyPair.key + sheetName.split(" ")[1]] = dataRow[oBundle.getText(keyPair.value)].toString();
										}
									});
									let _searchKey = oBundle.getText("vdm.lblArticleCode");
									let _searchParam = {};
									_searchParam[_searchKey] = dataRow[_searchKey];
									let _findObj = _.find(_excelArray, _searchParam);
									if (_findObj) {
										let _mergeObj = {};
										_.merge(_findObj, _findObj, dataRow);
									}
								});
							} else {
								_.forEach(excelData, function(dataRow) {
									_.forEach(_weekSpecificKeys, function(keyPair) {
										if (_.has(dataRow, oBundle.getText(keyPair.value))) {
											dataRow[keyPair.key + sheetName.split(" ")[1]] = dataRow[oBundle.getText(keyPair.value)].toString();
										}
									});
								});
							}
							_excelArray = _excelArray.length === 0 ? _.cloneDeep(excelData) : _excelArray;
						});
						console.log("Excel Extract");
						console.log(_excelArray);
						fnResolve(_excelArray);
					};
					reader.onerror = function(ex) {
						fnReject(ex);
					};
					reader.readAsBinaryString(_file);
				});

			}
		},
		_setVendor: function(_vendorId) {
			this.vendorId = _vendorId;
		},
		_getVendor: function() {
			return this.vendorId;
		},
		_setAdmin: function(_isAdmin) {
			this.isAdmin = _isAdmin;
		},
		_getAdmin: function() {
			return this.isAdmin;
		},
		_downloadKeyValueTemplateDownload: function(weekData, i18nModel) {
			let _arr = [];
			let that = this;
			let oBundle = i18nModel.getResourceBundle();
			_arr.push({
				'key': 'articleNoDisplay',
				'value': 'vdm.lblArticleCode',
				'isi18n': true,
				'type': 'S',
				'length': 0
			});
			_arr.push({
				'key': 'oldArticleCode',
				'value': 'vdm.lblOldArticle',
				'isi18n': true,
				'type': 'S',
				'length': 0
			});
			_arr.push({
				'key': 'articleDescription',
				'value': 'vdm.lblArticleDescription',
				'isi18n': true,
				'type': 'S',
				'length': 0
			});
			_arr.push({
				'key': 'orderUnitText',
				'value': 'vdm.lblOrderingUnit',
				'isi18n': true,
				'type': 'S',
				'length': 0
			});
			// _arr.push({
			// 	'key': 'conditionAmount',
			// 	'value': 'vdm.lblOffVendorPrice',
			// 	'isi18n': true,
			// 	'type': 'S',
			// 	'length': 0
			// });
			_arr.push({
				'key': 'sectionCodeDisplay',
				'value': 'vdm.lblSection',
				'isi18n': true,
				'type': 'S',
				'length': 0
			});
			// _arr.push({
			// 	'key': 'orderValue',
			// 	'value': 'vdm.lblValue',
			// 	'isi18n': true,
			// 	'type': 'S',
			// 	'length': 0
			// });
			_arr.push({
				'key': 'itemCommentText',
				'value': 'vdm.lblComment',
				'isi18n': true,
				'type': 'S',
				'length': 0
			});

			_.forEach(weekData, function(_currentWeek) {
				let _visibleDates = _.orderBy(_currentWeek.dates, 'sortSequence', 'asc');
				_.forEach(_visibleDates, function(visibleDate) {
					_arr.push({
						'key': moment(visibleDate.date).format("YYYYMMDD") + "USEDATE",
						'value': moment(visibleDate.date).format(that.getConstants("dateFormat")) + " " + oBundle.getText("vdm.lblUseDate"),
						'isi18n': false,
						'type': 'S',
						'length': 0
					});
					_arr.push({
						'key': moment(visibleDate.date).format("YYYYMMDD") + "QTY",
						'value': moment(visibleDate.date).format(that.getConstants("dateFormat")) + " " + oBundle.getText("vdm.lblQuantity"),
						'isi18n': false,
						'type': 'S',
						'length': 0
					});
				});
			});

			return _arr;
		},
		_getDownloadReportFields: function(_fields, i18nModel) {
			let _arr = [];
			let _itemReportMapping = [{
				"key": "articleCode",
				"sapField": "MATNR",
				"isText": false
			}];
			_.forEach(_fields, function(field, idx) {
				if (field.isi18n) {
					let _backendObj = _.find(_itemReportMapping, {
						"key": field.key
					});
					_arr.push({
						"sortOrder": (idx + 1).toString(),
						"fieldName": _backendObj.sapField,
						"fieldDescription": i18nModel.getResourceBundle().getText(field.value),
						"isText": _backendObj.isText ? 'X' : ''
					});
				} else {
					_arr.push({
						"sortOrder": (idx + 1).toString(),
						"fieldName": field.key,
						"fieldDescription": field.value,
						"isText": ''
					});
				}
			});
		},
		_getBedMaster: function(_startDate,endDate) {
			let that = this;
			let _master = [{
				"id": "F21IUAMC",
				"children": [{
					"id": "2015RAMC",
					"text": "2015RAMC",
					"isOverlap": false,
					"isEquipment": false,
					"isRiskFactor": false,
					"isOccupancy":false,
					"task": [{
						"id": "1234",
						"startTime": moment(_startDate).add(that._generateRandomNumberInRange(1,1), 'days').format("YYYYMMDD090000"), //"20230616090000",
						"endTime": moment(_startDate).add(that._generateRandomNumberInRange(30,30), 'days').format("YYYYMMDD090000")//"20230618090000"
					}],
					"children": [{
						"id": "2015BAMC",
						"text": "2015BAMC",
						"department": "Cardiology",
						"isOverlap": true,
						"isEquipment": true,
						"isRiskFactor": false,
						"isOccupancy":true,
						"subtask": [{
							"id": "Chevron",
							"fillColor": "#696969",
							"title": "John Doe",
							"gender":"Male",
							"department": "Cardiology",
							"titleColor": "#FFFFFF",
							"startTime": moment(_startDate).add(that._generateRandomNumberInRange(1,15), 'days').format("YYYYMMDD090000"),//"20230101100000",
							"endTime": moment(_startDate).add(that._generateRandomNumberInRange(15,30), 'days').format("YYYYMMDD090000")//"20230105170000"
						}, {
							"id": "Chevron2",
							"fillColor": "#FF0000",
							"title": "Jane Doe",
							"gender":"Female",
							"department": "Pediatrics",
							"titleColor": "#000000",
							"startTime": moment(_startDate).add(that._generateRandomNumberInRange(1,15), 'days').format("YYYYMMDD090000"),//"20230610090000",
							"endTime":moment(_startDate).add(that._generateRandomNumberInRange(15,30), 'days').format("YYYYMMDD090000"),//"20230621090000"
						}, {
							"id": "Chevron3",
							"fillColor": "#FF0000",
							"title": "Alvin Stone",
							"gender":"Female",
							"department": "Pulmonology",
							"titleColor": "#000000",
							"startTime": moment(_startDate).add(that._generateRandomNumberInRange(1,15), 'days').format("YYYYMMDD090000"),//"20230610090000",
							"endTime": moment(_startDate).add(that._generateRandomNumberInRange(15,25), 'days').format("YYYYMMDD090000"),//"20230621090000"
						}]
					}, {
						"id": "2016BAMC",
						"text": "2016BAMC",
						"department": "Pediatrics",
						"subtask": [{
							"id": "Chevron",
							"fillColor": "#696969",
							"title": "Mary Heg",
							"gender":"Female",
							"department": "Urology",
							"titleColor": "#FFFFFF",
							"startTime": moment(_startDate).add(that._generateRandomNumberInRange(1,15), 'days').format("YYYYMMDD090000"),//"20230601090000",
							"endTime": moment(_startDate).add(that._generateRandomNumberInRange(20,30), 'days').format("YYYYMMDD090000"),//"20230607090000"
						}, {
							"id": "Chevron2",
							"fillColor": "#FF0000",
							"title": "Kat Kristan",
							"gender":"Female",
							"department": "Urology",
							"titleColor": "#000000",
							"startTime": moment(_startDate).add(that._generateRandomNumberInRange(1,15), 'days').format("YYYYMMDD090000"),//"20230610090000",
							"endTime": moment(_startDate).add(that._generateRandomNumberInRange(15,17), 'days').format("YYYYMMDD090000"),//"20230621090000"
						}, {
							"id": "Chevron3",
							"fillColor": "#FF0000",
							"title": "Christina Brown",
							"gender":"Female",
							"department": "Obstetrics",
							"titleColor": "#000000",
							"startTime": moment(_startDate).add(that._generateRandomNumberInRange(1,15), 'days').format("YYYYMMDD090000"),//"20230610090000",
							"endTime": moment(_startDate).add(that._generateRandomNumberInRange(15,25), 'days').format("YYYYMMDD090000"),//"20230621090000"
						}]
					}]
				}, {
					"id": "2017RAMC",
					"text": "2017RAMC",
					"isOverlap": false,
					"isEquipment": false,
					"isRiskFactor": false,
					"isOccupancy":true,
					"task": [{
						"id": "1234",
						"startTime": "20230616090000",
						"endTime": "20230618090000"
					}],
					"children": [{
						"id": "line2",
						"text": "2017BAMC",
						"department": "Pulmonary",
						"isOverlap": false,
						"isEquipment": true,
						"isRiskFactor": false,
						"isOccupancy":false,
						"subtask": [{
							"id": "Chevron",
							"fillColor": "#696969",
							"title": "Augy Reed",
							"gender":"Female",
							"department": "Pediatrics",
							"titleColor": "#FFFFFF",
							"startTime": moment(_startDate).add(that._generateRandomNumberInRange(1,15), 'days').format("YYYYMMDD090000"),//"20230601090000",
							"endTime": moment(_startDate).add(that._generateRandomNumberInRange(15,30), 'days').format("YYYYMMDD090000"),//"20230607090000"
						}, {
							"id": "Chevron2",
							"fillColor": "#FF0000",
							"title": "James Aniston",
							"gender":"Male",
							"department": "Pediatrics",
							"titleColor": "#000000",
							"startTime": moment(_startDate).add(that._generateRandomNumberInRange(1,15), 'days').format("YYYYMMDD090000"),//"20230610090000",
							"endTime": moment(_startDate).add(that._generateRandomNumberInRange(15,20), 'days').format("YYYYMMDD090000"),//"20230621090000"
						}]
					}]
				}, {
					"id": "2018RAMC",
					"text": "2018RAMC",
					"isOverlap": false,
					"isEquipment": false,
					"isRiskFactor": false,
					"isOccupancy":false,
					"task": [{
						"id": "1234",
						"startTime": moment(_startDate).add(that._generateRandomNumberInRange(1,15), 'days').format("YYYYMMDD090000"),//"20230616090000",
						"endTime": moment(_startDate).add(that._generateRandomNumberInRange(20,30), 'days').format("YYYYMMDD090000"),//"20230618090000"
					}],
					"children": [{
						"id": "2018BAMC",
						"text": "2018BAMC",
						"department": "Pulmonary",
						"isOverlap": false,
						"isEquipment": true,
						"isRiskFactor": false,
						"subtask": [{
							"id": "1958",
							"fillColor": "#696969",
							"title": "Charlie Sheen",
							"gender":"Male",
							"department": "Orthopedic",
							"titleColor": "#FFFFFF",
							"startTime": moment(_startDate).add(that._generateRandomNumberInRange(1,15), 'days').format("YYYYMMDD090000"),//"20230601090000",
							"endTime": moment(_startDate).add(that._generateRandomNumberInRange(15,25), 'days').format("YYYYMMDD090000"),//"20230606090000"
						}, {
							"id": "2029",
							"fillColor": "#FF0000",
							"title": "Sean Cooper",
							"gender":"Male",
							"department": "Gastroenterology",
							"titleColor": "#000000",
							"startTime": moment(_startDate).add(that._generateRandomNumberInRange(1,15), 'days').format("YYYYMMDD090000"),//"20230607090000",
							"endTime": moment(_startDate).add(that._generateRandomNumberInRange(15,25), 'days').format("YYYYMMDD090000"),//"20230610090000"
						}, {
							"id": "1990",
							"fillColor": "#FF0000",
							"title": "Jamie Oliver",
							"gender":"Male",
							"department": "Pulmonology",
							"titleColor": "#000000",
							"startTime": moment(_startDate).add(that._generateRandomNumberInRange(1,15), 'days').format("YYYYMMDD090000"),//"20230611090000",
							"endTime": moment(_startDate).add(that._generateRandomNumberInRange(15,30), 'days').format("YYYYMMDD090000"),//"20230621590000"
						}]
					}, {
						"id": "2019BAMC",
						"text": "2019BAMC",
						"department": "Pulmonary",
						"isOverlap": false,
						"isEquipment": true,
						"isRiskFactor": false,
						"subtask": [{
							"id": "Chevron",
							"fillColor": "#696969",
							"title": "Sana Kapi",
							"gender":"Female",
							"department": "Obstetrics",
							"titleColor": "#FFFFFF",
							"startTime": moment(_startDate).add(that._generateRandomNumberInRange(1,15), 'days').format("YYYYMMDD090000"),//"20230601090000",
							"endTime": moment(_startDate).add(that._generateRandomNumberInRange(15,30), 'days').format("YYYYMMDD090000"),//"20230607090000"
						}, {
							"id": "Chevron2",
							"fillColor": "#FF0000",
							"title": "Justin Red",
							"gender":"Male",
							"department": "Gastroenterology",
							"titleColor": "#000000",
							"startTime": moment(_startDate).add(that._generateRandomNumberInRange(1,11), 'days').format("YYYYMMDD090000"),//"20230610090000",
							"endTime": moment(_startDate).add(that._generateRandomNumberInRange(12,15), 'days').format("YYYYMMDD090000"),//"20230621090000"
						}, {
							"id": "Chevron3",
							"fillColor": "#FF0000",
							"title": "Noel Dsouza",
							"gender":"Male",
							"department": "Hepatology",
							"titleColor": "#000000",
							"startTime": moment(_startDate).add(that._generateRandomNumberInRange(1,10), 'days').format("YYYYMMDD090000"),//"20230610090000",
							"endTime": moment(_startDate).add(that._generateRandomNumberInRange(10,15), 'days').format("YYYYMMDD090000"),//"20230621090000"
						}]
					}]
				}, {
					"id": "VIPR-214",
					"text": "VIPR-214",
					"isOverlap": false,
					"isEquipment": false,
					"isRiskFactor": false,
					"isOccupancy":true,
					"task": [{
						"id": "1234",
						"startTime": moment(_startDate).add(that._generateRandomNumberInRange(1,15), 'days').format("YYYYMMDD090000"),//"20230616090000",
						"endTime": moment(_startDate).add(that._generateRandomNumberInRange(15,15), 'days').format("YYYYMMDD090000"),//"20230618090000"
					}],
					"children": [{
						"id": "VIPB-214",
						"text": "VIPB-214",
						"department": "Pulmonary",
						"isOverlap": false,
						"isEquipment": true,
						"isRiskFactor": false,
						"subtask": [{
							"id": "154",
							"fillColor": "#696969",
							"title": "Niki Mahant",
							"gender":"Female",
							"department": "Cardiology",
							"titleColor": "#FFFFFF",
							"startTime": moment(_startDate).add(that._generateRandomNumberInRange(1,15), 'days').format("YYYYMMDD090000"),//"20230601090000",
							"endTime": moment(_startDate).add(that._generateRandomNumberInRange(15,15), 'days').format("YYYYMMDD090000"),//"20230607090000"
						}, {
							"id": "1767",
							"fillColor": "#FF0000",
							"title": "Dana Monte",
							"gender":"Female",
							"department": "Vascular Surgery",
							"titleColor": "#000000",
							"startTime": moment(_startDate).add(that._generateRandomNumberInRange(1,15), 'days').format("YYYYMMDD090000"),//"20230610090000",
							"endTime": moment(_startDate).add(that._generateRandomNumberInRange(15,15), 'days').format("YYYYMMDD090000"),//"20230621090000"
						}]
					}]
				}]
			}, {
				"id": "F31IUAMC",
				"children": [{
					"id": "3021RAMC",
					"text": "3021RAMC",
					"isOverlap": false,
					"isEquipment": false,
					"isRiskFactor": false,
					"isOccupancy":false,
					"task": [{
						"id": "1234",
						"startTime": "20230616090000",
						"endTime": "20230618090000"
					}],
					"children": [{
						"id": "3021BAMC",
						"text": "3021BAMC",
						"department": "Cardiology",
						"isOverlap": true,
						"isEquipment": true,
						"isRiskFactor": false,
						"subtask": [{
							"id": "2318",
							"fillColor": "#696969",
							"title": "Alison Cook",
							"gender":"Female",
							"department": "Cardiology",
							"titleColor": "#FFFFFF",
							"startTime": "20230101100000",
							"endTime": "20230105170000"
						}, {
							"id": "2418",
							"fillColor": "#FF0000",
							"title": "Tim Harper",
							"gender":"Male",
							"department": "Pediatrics",
							"titleColor": "#000000",
							"startTime": "20230610090000",
							"endTime": "20230621090000"
						}, {
							"id": "676",
							"fillColor": "#FF0000",
							"title": "Colin Peta",
							"gender":"Male",
							"department": "Pulmonology",
							"titleColor": "#000000",
							"startTime": "20230610090000",
							"endTime": "20230621090000"
						}]
					}, {
						"id": "3022BAMC",
						"text": "3022BAMC",
						"department": "Pediatrics",
						"subtask": [{
							"id": "113",
							"fillColor": "#696969",
							"title": "Navya Noose",
							"gender":"Female",
							"department": "Urology",
							"titleColor": "#FFFFFF",
							"startTime": "20230601090000",
							"endTime": "20230607090000"
						}, {
							"id": "1423",
							"fillColor": "#FF0000",
							"title": "Calvin Hummer",
							"gender":"Male",
							"department": "Gastroenterology",
							"titleColor": "#000000",
							"startTime": "20230610090000",
							"endTime": "20230621090000"
						}, {
							"id": "1671",
							"fillColor": "#FF0000",
							"title": "Martina Hugh",
							"gender":"Female",
							"department": "Obstetrics",
							"titleColor": "#000000",
							"startTime": "20230610090000",
							"endTime": "20230621090000"
						}]
					}]
				}, {
					"id": "3023RAMC",
					"text": "3023RAMC",
					"isOverlap": false,
					"isEquipment": false,
					"isRiskFactor": false,
					"isOccupancy":false,
					"task": [{
						"id": "1234",
						"startTime": "20230616090000",
						"endTime": "20230618090000"
					}],
					"children": [{
						"id": "3023BAMC",
						"text": "3023BAMC",
						"department": "Pulmonary",
						"isOverlap": false,
						"isEquipment": true,
						"isRiskFactor": false,
						"subtask": [{
							"id": "889",
							"fillColor": "#696969",
							"title": "Olive Stone",
							"gender":"Female",
							"department": "Pediatrics",
							"titleColor": "#FFFFFF",
							"startTime": "20230601090000",
							"endTime": "20230607090000"
						}, {
							"id": "1860",
							"fillColor": "#FF0000",
							"title": "Nelson Frey",
							"gender":"Male",
							"department": "Pediatrics",
							"titleColor": "#000000",
							"startTime": "20230610090000",
							"endTime": "20230621090000"
						}]
					}]
				}, {
					"id": "3024RAMC",
					"text": "3024RAMC",
					"isOverlap": false,
					"isEquipment": false,
					"isRiskFactor": false,
					"isOccupancy":false,
					"task": [{
						"id": "1234",
						"startTime": "20230616090000",
						"endTime": "20230618090000"
					}],
					"children": [{
						"id": "3024BAMC",
						"text": "3024BAMC",
						"department": "Pulmonary",
						"isOverlap": false,
						"isEquipment": true,
						"isRiskFactor": false,
						"subtask": [{
							"id": "1958",
							"fillColor": "#696969",
							"title": "Jacob Hind",
							"gender":"Male",
							"department": "Orthopedic",
							"titleColor": "#FFFFFF",
							"startTime": "20230601090000",
							"endTime": "20230606090000"
						}, {
							"id": "2029",
							"fillColor": "#FF0000",
							"title": "Aria Larie",
							"gender":"Female",
							"department": "Bariatric Surgery",
							"titleColor": "#000000",
							"startTime": "20230607090000",
							"endTime": "20230610090000"
						}, {
							"id": "1990",
							"fillColor": "#FF0000",
							"title": "Larry Moe",
							"gender":"Female",
							"department": "Pulmonology",
							"titleColor": "#000000",
							"startTime": "20230611090000",
							"endTime": "20230621590000"
						}]
					}, {
						"id": "3025BAMC",
						"text": "3025BAMC",
						"department": "Pulmonary",
						"isOverlap": false,
						"isEquipment": true,
						"isRiskFactor": false,
						"subtask": [{
							"id": "1763",
							"fillColor": "#696969",
							"title": "Alvira Khan",
							"gender":"Female",
							"department": "Obstetrics",
							"titleColor": "#FFFFFF",
							"startTime": "20230601090000",
							"endTime": "20230607090000"
						}, {
							"id": "1764",
							"fillColor": "#FF0000",
							"title": "Jared Drune",
							"gender":"Male",
							"department": "Rheumatology",
							"titleColor": "#000000",
							"startTime": "20230610090000",
							"endTime": "20230621090000"
						}, {
							"id": "2330",
							"fillColor": "#FF0000",
							"title": "Drea Copper",
							"gender":"Female",
							"department": "Hepatology",
							"titleColor": "#000000",
							"startTime": "20230610090000",
							"endTime": "20230621090000"
						}]
					}]
				}, {
					"id": "VIPR-315",
					"text": "VIPR-315",
					"isOverlap": false,
					"isEquipment": false,
					"isRiskFactor": false,
					"isOccupancy":false,
					"task": [{
						"id": "1234",
						"startTime": "20230616090000",
						"endTime": "20230618090000"
					}],
					"children": [{
						"id": "VIPB-315",
						"text": "VIPB-315",
						"department": "Pulmonary",
						"isOverlap": false,
						"isEquipment": true,
						"isRiskFactor": false,
						"subtask": [{
							"id": "154",
							"fillColor": "#696969",
							"title": "Natasha Duke",
							"gender":"Female",
							"department": "Cardiology",
							"titleColor": "#FFFFFF",
							"startTime": "20230601090000",
							"endTime": "20230607090000"
						}, {
							"id": "1767",
							"fillColor": "#FF0000",
							"title": "Dana Monte",
							"gender":"Female",
							"department": "Vascular Surgery",
							"titleColor": "#000000",
							"startTime": "20230610090000",
							"endTime": "20230621090000"
						}]
					}]
				}]
			}]
			return _master;
		},
		_randomPatient: function(_idx) {
			// let _patientNames = [
			// 	"Orion Steffen", "Corrina Chavarria", "Wendy Edmonds", "Kayli Ashworth", "Jaliyah Connell", "Dillion Swope",
			// 	" Maribel Michaels", "Kendall Olsen", "Kurt Sheffield", "Maggie Aponte", "Lela Crist", "Jack Beach", "Cameron Jorgensen",
			// 	" Eve Duvall", "Auston Serrano", "Beverly Boland", "Tyrese Kimble", "Zoie Foy", "Antoine Isaacs", "Francisco Dove",
			// 	" Greta Antonio", "Mykala Chaney", "Rhett Michael", "Valery Grier", "Kiera Reynoso", "Caroline Gale", "Ainsley McCann",
			// 	" Lewis Hurd", "Rigoberto Cosby", "Ray Hobbs", "Kaiden Price", "Irma Pino", "Armani Bland", "Jessie Hedrick",
			// 	" Megan Holloway", "Maiya Cordova", "Orion Pitt", "Sarina Jay", "Kristian Kraus", "Kaelyn Handley", "Reilly Curran",
			// 	" Drew McWilliams", "Jayna Atwell", "Brannon Armendariz", "Rachael Kauffman", "Rosalinda Avery", "Jovan Pina", "Jamil Nieves",
			// 	" Kalia Kohn", "Don Millard", "Flor Epperson", "Casey Lu", "Wendy Duong", "Treasure Merrell", "Darion Kaye",
			// 	" Herman Merchant", "Erick Varney", "Yajaira Levine", "Alexandrea Velasquez", "Bill Justice", "Sydnie Whitfield",
			// 	" Neha Ridenour", "Bridgett Lau", "Carl Chapin", "Laisha Samuel", "Brennan Mahoney", "Claudia Dunham", "Ericka Valentin",
			// 	" Nancy Frias", "Bethanie Bouchard", "Kelley Sands", "Korbin Donald", "Malaysia Calhoun", "Yusuf Ruby", "Kai Reddy",
			// 	" Carly Luke", "Coleton Duff", "Deja Roberson", "Talon Borders", "Elmer Michaud", "Terra Hogue", "Karsyn Creamer",
			// 	" Nadine Wisniewski", "Tavon Rector", "Kyron Cox", "Caleigh Cutler", "Hayden Murphy", "Duncan Pressley", "Elian Cheung",
			// 	" Damaris Keys", "Tyler Holden", "Santana Willoughby", "Alexandra Sosa", "Aurora Cho", "Marlee Zink", "Wyatt Davenport",
			// 	" Demarco Gavin", "Isaiah Schwarz", "Nasir Lumpkin", "Bridgett Quiroz", "Tricia Thiel", "Frank Samson", "Paola Rosa",
			// 	" Raegan Grove", "Jajuan Ennis", "Anai Esquivel", "Alexandra Cruz", "Breann Hope", "Dwight Martins", "Elisabeth Faust",
			// 	" Desirae Abernathy", "Aaron Paul", "Alyson Haase", "Darion Dinh", "Aubrey Barragan", "Sam Stokes", "Maya Dunham",
			// 	" Marquez Pritchard", "Audrey Jones", "Darwin Marino", "Aron Higgs", "Brandt Wooten", "Rebeca Escobedo", "Gunnar Sarmiento",
			// 	" Devyn Cantu", "Simon Powell", "Donnell Corona", "Allysa Wooten", "Alexys Hansen", "Omari Meeker", "Martha Reich",
			// 	" Elias Cochran", "Aryana Moulton", "Annaliese Betancourt", "Mordechai Mayo", "Caden Kitchens", "Alecia Mckenzie",
			// 	" Bennett Rourke", "Kylah Robert", "Axel Hamrick", "Abdullah Winkler", "Kaila Karr", "Cornelius Archer", "Hassan Yost",
			// 	" Tatyanna Wallace", "Adam Salas", "Genaro Moriarty", "Alfonso Carpenter", "Annabella Spalding", "Rayshawn Wynn",
			// 	" Paris Trout", "Alonso Hermann", "Gary Blum", "Tatiana Reynoso", "Dwayne Tsai", "Jaycob Ashley", "Tavion Bartholomew",
			// 	" Kiersten Malcolm", "Bethanie Olivas", "Briley Carter", "Sofia Mojica", "Jovany Bui", "Addison Bales", "Rigoberto Humphrey",
			// 	" Diamond Parnell", "Lazaro Masters", "Simone Forster", "Kierstin Trinidad", "Adamaris Law", "Kent Christianson",
			// 	" Nico Gallardo", "Tyler Ware", "Yajaira Bruns", "Michele Hoke", "Courtney Henderson", "Ashlynn Jarvis", "Margaret Ashton",
			// 	" Sawyer Ireland", "Marcela Burgos", "Jessalyn Hidalgo", "Valery Marks", "Karsyn Godinez", "Mohammed Grigsby",
			// 	" Ari Whitfield", "Yessica Kunz", "Jennah Prather", "Makenzi Dial", "Kerry Bain", "Aidan Devries", "Ryder Mota",
			// 	" Martin Hawkins", "Vicente Crump", "Aiyana Carvalho", "Treyton Griffin", "Heidy Bianco", "Rashad Wilson", "Tristian Glasgow",
			// 	" Porter Stearns", "Christina Downs", "Bruce Diamond
			// ]
		},
		_generateRandomNumberInRange: function(min, max) {
			return (Math.round((Math.random() * (max - min) + min) / 10) * 10).toString();
		},
		_generateBedOccupancyData: function(_bedID) {
			let _obj = {
				"root": {
					"children": []
				}
			};
			_obj["root"]["id"] = _bedID;
			let _rooms = [];
			let _beds = [];
			let _noOfBeds = this._generateRandomNumberInRange(1, 5);
			let _noOfPatients = this._generateRandomNumberInRange(1, 10);
			_.forEach(_noOfBeds, function(bedNo) {

			});
			let _patients = [];

		},
		
		_getDepartmentLegendColors: function(){
			let that = this;
			let _arr = [];
			let _departments = ["Cardiology","Pediatrics","Pulmonology","Urology","Obstetrics",
			"Orthopedic","Gastroenterology","Hepatology","Vascular Surgery","Bariatric Surgery","Rheumatology"];
			_.forEach(_departments,function(department){
				_arr.push({"id":department,"color":that._getColorByDepartment(department).fillColor});
			});
			return _arr;
		},
		_getColorByDepartment: function(_departmentID) {
			let _departmentColor = {};
			switch (_departmentID) {
				case "Cardiology":
					_departmentColor["fillColor"] = "#093145";
					_departmentColor["titleColor"] = "#FFFFFF";
					break;
				case "Pediatrics":
					_departmentColor["fillColor"] = "#1287A8";
					_departmentColor["titleColor"] = "#FFFFFF";
					break;
				case "Pulmonology":
					_departmentColor["fillColor"] = "#829356";
					_departmentColor["titleColor"] = "#000000";
					break;
				case "Urology":
					_departmentColor["fillColor"] = "#c2571A";
					_departmentColor["titleColor"] = "#FFFFFF";
					break;
				case "Obstetrics":
					_departmentColor["fillColor"] = "#9A2617";
					_departmentColor["titleColor"] = "#FFFFFF";
					break;
				case "Orthopedic":
					_departmentColor["fillColor"] = "#D3B53D";
					_departmentColor["titleColor"] = "#000000";
					break;
				case "Gastroenterology":
					_departmentColor["fillColor"] = "#FFAFCC";
					_departmentColor["titleColor"] = "#000000";
					break;
				case "Hepatology":
					_departmentColor["fillColor"] = "#CDB4DB";
					_departmentColor["titleColor"] = "#000000";
					break;
				case "Vascular Surgery":
					_departmentColor["fillColor"] = "#D4A373";
					_departmentColor["titleColor"] = "#000000";
					break;
				case "Bariatric Surgery":
					_departmentColor["fillColor"] = "#E07A5F";
					_departmentColor["titleColor"] = "#FFFFFF";
					break;
				case "Rheumatology":
					_departmentColor["fillColor"] = "#6D6875";
					_departmentColor["titleColor"] = "#FFFFFF";
					break;
			}
			return _departmentColor;
		},
		_calculateDate:function(dateReference,isAdd,value,unit,exportFormat,isDateExport){
			return isAdd ? !isDateExport ? moment(dateReference).add(value,unit).format(exportFormat) : moment(dateReference).add(value,unit)._d
						 : !isDateExport ? moment(dateReference).subtract(value,unit).format(exportFormat) : moment(dateReference).subtract(value,unit)._d;
		},
		_generateRandomDOB:function(age){
			let currentDate = new Date();
			let birthYear = currentDate.getFullYear() - age;
			let birthMonth = Math.floor(Math.random() * 12);
			let maxDaysInMonth = new Date(birthYear, birthMonth + 1, 0).getDate();
			let birthDay = Math.floor(Math.random() * maxDaysInMonth) + 1;
			let randomDOB = new Date(birthYear, birthMonth, birthDay);
			return randomDOB;
		},
		_getBedData: function(bedID) {
			let that = this;
			let _obj = {
				"root": {
					"children": []
				}
			};
			let _startDate = moment(new Date()).startOf('month')._d;//new Date()
			let _endDate = moment(new Date()).endOf('month')._d
			let _bedMaster = this._getBedMaster(_startDate,_endDate);
			if (_.find(_bedMaster, {
					id: bedID
				})) {
				_.forEach(_.find(_bedMaster, {
					id: bedID
				}).children, function(_room) {
					_.forEach(_room.children, function(_bed) {
						_.forEach(_bed.subtask, function(_child) {
							let _gender = that._generateRandomNumberInRange(4, 10) % 2 === 0 ? "Male" : "Female"
							let _departmentColor = that._getColorByDepartment(_child.department);
							_child["title"] = _child["title"] + " (" + that._generateRandomNumberInRange(18, 70) + " yrs) " + _child["gender"];
							_child["fillColor"] = _departmentColor.fillColor;
							_child["titleColor"] = _departmentColor.titleColor;
							//_child["startTime"] = that._calculateDate(new Date(), false, that._generateRandomNumberInRange(0, 15) , 'days', 'YYYYMMDD090000', true);
							//_child["endTime"] = that._calculateDate(new Date(), true, that._generateRandomNumberInRange(15, 30) , 'days', 'YYYYMMDD090000', true);
							
						});

					});
				})

				_obj["root"]["children"] = _.find(_bedMaster, {
					id: bedID
				}).children;
			}
			return _obj;
		}
	};
}());