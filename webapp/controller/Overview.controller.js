sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/resource/ResourceModel",
	"sap/m/MessageBox",
	'sap/ui/model/Filter',
	"sap/ui/model/FilterOperator",
	"sap/ui/model/FilterType",
	"ZAMM_BED_OCCUP/libs/lodash",
	"ZAMM_BED_OCCUP/libs/moment",
	"ZAMM_BED_OCCUP/util/DataHelper",
	"ZAMM_BED_OCCUP/util/UIHelper",
	"ZAMM_BED_OCCUP/util/Formatter",
	"sap/gantt/misc/Format",
	"sap/ui/core/Fragment"
], function (Controller, JSONModel, ResourceModel, MessageBox, Filter, FilterOperator,
	FilterType, lodash, momentjs, DataHelper, UIHelper, Formatter, Format, Fragment) {
	"use strict";
	var oController;
	return Controller.extend("ZAMM_BED_OCCUP.controller.Overview", {
		hideBusyIndicator: function () {
			sap.ui.core.BusyIndicator.hide();
		},
		showBusyIndicator: function () {
			sap.ui.core.BusyIndicator.show();
			sap.ui.core.BusyIndicator.show(0);
		},
		createLocalModel: function (modelName, data) {
			let model = new JSONModel();
			model.setData(data);
			model.setSizeLimit(data.length);
			this.getView().setModel(model, modelName);
		},
		_extractPatientInfo: function (title) {
			let _text = title;
			let _regex = /(\w+ \w+) \((\d+) yrs\) (\w+)/;
			let match = _text.match(_regex);
			if (match) {
				return {
					"patientName": match[1],
					"age": match[2],
					"gender": match[3]
				}
			} else {
				console.log("No match found.");
			}
		},
		_getPatientDetailsFragment: function (patientDetailsModel) {
			var that = this;
			if (!this._patientDetailsFragment) {
				this._patientDetailsFragment = sap.ui.xmlfragment("Patient Details", "ZAMM_BED_OCCUP.view.fragments.patientDetails", this);
			}
			//this._patientDetailsFragment.setModel(that.getOwnerComponent().getModel("i18n"), "i18n");
			this._patientDetailsFragment.setModel(patientDetailsModel, "patientDetailsModel");
			return this._patientDetailsFragment;
		},
		_getCreateNewRecordFragment: function () {
			var that = this;
			if (!this._createNewRecordFragment) {
				this._createNewRecordFragment = sap.ui.xmlfragment("Create Record", "ZAMM_BED_OCCUP.view.fragments.createNewRecord", this);
			}
			return this._createNewRecordFragment;
		},
		_getPatientDetailPopover: function (_patientName, oShape, oEvent) {
			//this.iPopoverOffsetX = oEvent.getParameter("popoverOffsetX");
			var oPosition = oShape.$().offset();
			var iLeft = Number(oPosition.left);
			this.iPopoverOffsetX = Math.round(oPosition.left);
			this.leftPosition = window.innerWidth - this.iPopoverOffsetX > 0 ? window.innerWidth - this.iPopoverOffsetX : 10;
			//var iTop = oPosition.top + oPosition.height;

			if (!this._oPopover) {
				Fragment.load({
					name: "ZAMM_BED_OCCUP.view.fragments.patientDetails",
					type: "XML"
				}).then(function (oPopover) {
					this._oPopover = oPopover;
					this._oPopover.setModel(new JSONModel(), "popover");
					this.getView().addDependent(this._oPopover);
					this._oPopover.getModel("popover").setData({
						RequirementID: "", //oShape.getShapeId(),
						SourceLocation: _patientName,
						DestinationLocation: "Shanghai",
						DepartureDate: "", //oShape.getTime(),
						ArrivalDate: "", //oShape.getEndTime()
					});
					this._oPopover.setOffsetX(this.leftPosition).openBy(oShape);
					//this._oPopover.openBy(oEvent.getSource());
				}.bind(this));

			} else {
				//this._oPopover.openBy(oEvent.getSource());
				this._oPopover.setOffsetX(this.leftPosition).openBy(oShape);
			}
		},
		_generateFloors: function () {
			let _arr = [];
			_arr.push({
				'id': 'F21IUAMC',
				'text': '2nd Floor-Zone C-IP'
			});
			_arr.push({
				'id': 'F22IUAMC',
				'text': '2nd Floor Nursing area 2'
			});
			_arr.push({
				'id': 'F23IUAMC',
				'text': '2nd Floor Nursing area 3'
			});
			_arr.push({
				'id': 'F24IUAMC',
				'text': '2nd Floor Nursing area 4'
			});
			_arr.push({
				'id': 'F2DAGAMC',
				'text': '2nd Floor Dialysis'
			});
			_arr.push({
				'id': 'F2DTUAMC',
				'text': '2nd Floor Dialysis'
			});
			_arr.push({
				'id': 'F31IUAMC',
				'text': '3rd Floor-Zone C-IP'
			});
			_arr.push({
				'id': 'F32IUAMC',
				'text': '3rd Floor Nurs Area 2'
			});
			_arr.push({
				'id': 'F33IUAMC',
				'text': '3rd Floor Nurs Area 3'
			});
			_arr.push({
				'id': 'F3CIUAMC',
				'text': '3rd Floor CCU'
			});
			_arr.push({
				'id': 'F3IAGAMC',
				'text': 'Infusion Bay Area'
			});
			_arr.push({
				'id': 'F3ITUAMC',
				'text': 'Infusion Bay Treatment Unit'
			});
			_arr.push({
				'id': 'F41IUAMC',
				'text': '4th Floor Nurs Area 1'
			});
			_arr.push({
				'id': 'F42IUAMC',
				'text': '4th Floor Nurs Area 2'
			});
			_arr.push({
				'id': 'F4JIUAMC',
				'text': '4th Floor Junior Area'
			});
			_arr.push({
				'id': 'F4VIUAMC',
				'text': '4th Floor VIP Area'
			});
			_arr.push({
				'id': 'F51IUAMC',
				'text': '5th Floor Nurs Area 1'
			});
			_arr.push({
				'id': 'F52IUAMC',
				'text': '5th Floor Nurs Area 2'
			});
			_arr.push({
				'id': 'F5JIUAMC',
				'text': '5th Floor Junior Area'
			});
			_arr.push({
				'id': 'F5VIUAMC',
				'text': '5th Floor VIP Area'
			});
			_arr.push({
				'id': 'F61IUAMC',
				'text': '6th Floor Nurs Area 1'
			});
			return _arr;
		},
		getConstants: function (variable) {
			switch (variable) {
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
				case 'chartStartTime':
					break;
				case 'chartEndTime':
					break;
			}
		},
		_handleEscape: function (oEvent) {
			oEvent.reject();
		},
		/*Default Methods*/
		onInit: function () {
			let that = this;

			oController = this;
			moment.updateLocale('en', {
				week: {
					dow: 1, // Monday is the first day of the week.
				}
			});
		},
		onBeforeRendering: function () {

		},
		onAfterRendering: function () {
			let that = this;
			that._initModels();
		},
		onExit: function () {

		},
		fnTimeConverter: function (sTimestamp) {
			return Format.abapTimestampToDate(sTimestamp);
		},
		_initModels: function () {
			sap.ui.core.BusyIndicator.show();
			let that = this;
			that.Occup_PatDetails();
		},
		Occup_PatDetails: function () {
			let that = this;
			let _arr = [];
			let par1 = [];
			let par2 = [];
			let afilter = [];
			var targetArray = [];
			var targetArray1 = [];
			var targetArray2 = [];
			var targetArray3 = [];

			let viewModel = new JSONModel();
			//viewModel.setProperty("/axisStartTime", moment(new Date()).format("YYYYMMDD000000"));
			//viewModel.setProperty("/axisEndTime", UIHelper._calculateDate(new Date(), true, '31', 'days', 'YYYYMMDD000000', true));

			var oModel1 = this.getOwnerComponent().getModel();
			var oModelFlr_Data = new sap.ui.model.odata.ODataModel(oModel1.sServiceUrl, true);
			oModelFlr_Data.setUseBatch(false);
			var promise = new Promise(function (resolve, reject) {

				var sPathGUID = "/Occupany_rooms_bedsSet";
				oModelFlr_Data.read(sPathGUID, {
					urlParameters: {
						"sap=client": "110"
					},

					success: function (oData1, oResponse) {
						sap.ui.core.BusyIndicator.hide();


						viewModel.setProperty("/totalAxisStart", moment().startOf('year').format("YYYYMMDD000000"));
						viewModel.setProperty("/totalAxisEnd", moment().endOf('year').format("YYYYMMDD000000"));
						viewModel.setProperty("/axisStartTime", moment().startOf('month').format("YYYYMMDD000000"));
						viewModel.setProperty("/axisEndTime", moment().endOf('month').format("YYYYMMDD000000"));
						//viewModel.setProperty("/axisStartTime", "20230601000000");
						//viewModel.setProperty("/axisEndTime", "20230630000000");
						viewModel.setProperty("/floorKey", oData1.results[0].Ishid);
						viewModel.setProperty("/floorKeyText", oData1.results[0].Orgpfkb)
						that.getView().setModel(viewModel, "viewModel");
						targetArray1.push(oData1.results);






						let legendModel = new JSONModel();
						legendModel.setData(DataHelper._getDepartmentLegendColors());
						that.getView().setModel(legendModel, "legendModel");

						let patientDetailsModel = new JSONModel();
						that.getView().setModel(patientDetailsModel, "patientDetailsModel");
						var aFloortemp = []
						var aFloorArray = []
						oData1.results.forEach(function (floor) {
							aFloortemp.push(floor.Ishid);

						})
						var aFloortemp1 = _.uniq(aFloortemp, false);
						aFloortemp1.forEach(function (unqfloor) {
							aFloorArray.push({
								'id': unqfloor,
								'text': unqfloor
							});
						})
						that.createLocalModel("floorModel", aFloorArray);
						oData1.results.forEach(function (res) {
							if (res.Falnr) {
								par1.push(res.Falnr);
							}
							if (res.Patnr) {
								par2.push(res.Patnr);
							}

						});
						if (par2.length > 0) {
							par2.forEach(function (pat) {
								afilter.push(new Filter('Patnr', FilterOperator.EQ, pat));
							});
						}
						oModelFlr_Data.read("/patientRiskFactorsSet", {

							urlParameters: {
								"sap-client": "110"
							},
							filters: afilter,
							success: function (oData1, oResponse) {
								//var targetArray3 = [];
								oData1.results.forEach(function (res) {
									if (res.Patnr && par2.includes(res.Patnr)) {

										targetArray3.push(res);
									}
								});
								if ((targetArray.length !== 0) && (targetArray1.length !== 0) && (targetArray2.length !== 0) && (targetArray3.length !== 0)) {
									that.mergeArraysById(targetArray, targetArray1, targetArray2, targetArray3);
								}

							},


						});
						oModelFlr_Data.read("/patientAllergySet", {

							urlParameters: {
								"sap-client": "110"
							},
							filters: afilter,
							success: function (oData1, oResponse) {
								//	var targetArray2 = [];
								oData1.results.forEach(function (res) {
									if (res.Patnr && par2.includes(res.Patnr)) {

										targetArray2.push(res);
									}
								});
								if ((targetArray.length !== 0) && (targetArray1.length !== 0) && (targetArray2.length !== 0) && (targetArray3.length !== 0)) {
									that.mergeArraysById(targetArray, targetArray1, targetArray2, targetArray3);
								}

							},


						});
						oModelFlr_Data.read("/patientDetailsSet", {

							urlParameters: {
								"sap-client": "110"
							},
							success: function (oData1, oResponse) {

								oData1.results.forEach(function (res) {
									if (res.Falnr && par1.includes(res.Falnr)) {

										targetArray.push(res);
									}
								});
								if ((targetArray.length !== 0) && (targetArray1.length !== 0) && (targetArray2.length !== 0) && (targetArray3.length !== 0)) {
									that.mergeArraysById(targetArray, targetArray1, targetArray2, targetArray3);
								}


							},


						});




					},
					error: function (oErr) {
						reject(oErr);
					}

				});

			});
		},
		mergeArraysById: function (targetArray1, targetArray, targetArray2, targetArray3) {
			let that = this;
			const mergedArray = [];

			targetArray[0].forEach(item1 => {
				const id = item1.Falnr;
				const id1 = item1.Patnr;
				const matchItem1 = targetArray[0];
				const matchingItem = targetArray1.find(item => item.Falnr === id);
				const matchingItem2 = targetArray2.find(item => item.Patnr === id1);
				const matchingItem3 = targetArray3.find(item => item.Patnr === id1);

				if (matchingItem || matchingItem2 || matchingItem3 || matchItem1) {
					mergedArray.push({
						...item1,
						...matchingItem,
						...matchingItem2,
						...matchingItem3
					});
				}
			});
			let treeData = that.FloorStruct(mergedArray);
			let treeTableModel = new sap.ui.model.json.JSONModel();
			treeTableModel.setData(treeData[0]);
			that.getView().setModel(treeTableModel, "treeTableModel");
			that.getView().setModel(treeTableModel);


		},
		FloorStruct: function (data) {

			let treeData = {};



			let tree = [];


			let floors = {};
			data.forEach(item => {
				if (!floors[item.Ishid]) {
					floors[item.Ishid] = [];
				}
				floors[item.Ishid].push(item);
			});


			Object.keys(floors).forEach(Ishid => {
				let floorNode = {
					root: {
						children: []
					}

				};


				let rooms = {};
				floors[Ishid].forEach(item => {
					if (!rooms[item.Ishid_Rm]) {
						rooms[item.Ishid_Rm] = [];
					}
					rooms[item.Ishid_Rm].push(item);
				});


				Object.keys(rooms).forEach(Ishid_Rm => {
					let roomNode = {
						id: Ishid_Rm,
						children: []
					};

					rooms[Ishid_Rm].forEach(item => {
						let bedNode = {
							id: item.Ishid_Bd
						};
						roomNode.children.push(bedNode);
					});

					floorNode.root.children.push(roomNode);
				});

				tree.push(floorNode);
			});

			return tree;





		},
		//Screen Interactions
		_onFloorSelect: function (oEvent) {
			let that = this;
			let _selectedItem = oEvent.getParameter("selectedItem");
			let _data = oEvent.getSource().getSelectedItem().getBindingContext("floorModel").getObject();
			that.getView().getModel("viewModel").setProperty("/floorKeyText", _data.text);

			let _treeData = DataHelper._getBedData(_data.id);
			that.getView().getModel("treeTableModel").setData(_treeData);

		},
		_onShapeHover: function (oEvent) {
			// let that = this;
			// var oShape = oEvent.getParameter("shape");
			// console.log(oShape.getTitle());
			// var oPosition = oEvent.getSource().$().offset();
			// this._getPatientDetailPopover(oShape.getTitle(), oShape, oEvent);	
		},
		_onShapeDrop: function (oEvent) {
			let that = this;
			var oDraggedShapeDates = oEvent.getParameter("draggedShapeDates"),
				oModel = this.getView().getModel(),
				sShapeId = oEvent.getParameter("lastDraggedShapeUid"),
				oShapeInfo = sap.gantt.misc.Utility.parseUid(sShapeId),
				sPath = oShapeInfo.shapeDataName,
				oNewDateTime = oEvent.getParameter("newDateTime"),
				oOldTimes = oDraggedShapeDates[sShapeId],
				iTimeDiff = oNewDateTime.getTime() - oOldTimes.time.getTime(),
				oTargetRow = oEvent.getParameter("targetRow"),
				oTargetShape = oEvent.getParameter("targetShape");
			oModel.setProperty(sPath + "/startTime", new Date(oOldTimes.time.getTime() + iTimeDiff));
			oModel.setProperty(sPath + "/endTime", new Date(oOldTimes.endTime.getTime() + iTimeDiff));

			let _changedObject = oModel.getProperty(sPath);
			let _patientInfo = that._extractPatientInfo(_changedObject.title)
			sap.m.MessageBox.information("Planned Transfer initiated for " + _patientInfo.patientName + " from " + moment(_changedObject.startTime).format("DD.MM.YYYY") + " to " +
				moment(_changedObject.endTime).format("DD.MM.YYYY"));
		},
		_onShapeResize: function (oEvent) {
			let that = this;
			var oShape = oEvent.getParameter("shape"),
				aOldTime = oEvent.getParameter("oldTime"),
				aNewTimes = oEvent.getParameter("newTime");
			var oModel = this.getView().getModel(),
				sShapeId = oEvent.getParameter("shapeUid"),
				oShapeInfo = sap.gantt.misc.Utility.parseUid(sShapeId),
				sPath = oShapeInfo.shapeDataName;
			oModel.setProperty(sPath + "/startTime", aNewTimes[0]);
			oModel.setProperty(sPath + "/endTime", aNewTimes[1]);
			let _changedObject = oModel.getProperty(sPath);
			let _patientInfo = that._extractPatientInfo(_changedObject.title)
			// oShape.setTime(aNewTimes[0]);
			// oShape.setEndTime(aNewTimes[1]);
			let _msg = "";
			if (aOldTime[0] !== aNewTimes[0]) {
				_msg = "Start Time Changed";
			}
			else if (aOldTime[1] !== aNewTimes[1]) {
				_msg = "End Time Changed";
			}
			sap.m.MessageToast.show(_msg);
		},
		_onClose: function (oEvent) {
			oEvent.getSource().getParent().getParent().getParent().close();
		},

		_onShowPatientDetails: function (oEvent) {
			let that = this;
			var oShape = oEvent.getParameter("shape");
			let _patientDetailsModel = new sap.ui.model.json.JSONModel();
			let _patientInfo = that._extractPatientInfo(oShape.getTitle());
			_patientDetailsModel.setProperty("/patientName", _patientInfo.patientName);
			_patientDetailsModel.setProperty("/bedStartTime", moment(oShape.getTime()).format("DD.MM.YYYY"));
			_patientDetailsModel.setProperty("/bedEndTime", moment(oShape.getEndTime()).format("DD.MM.YYYY"));
			_patientDetailsModel.setProperty("/gender", _patientInfo.gender);
			_patientDetailsModel.setProperty("/age", _patientInfo.age);
			_patientDetailsModel.setProperty("/dateOfBirth", moment(DataHelper._generateRandomDOB(Number(_patientInfo.age))).format("DD.MM.YYYY"));
			this._getPatientDetailsFragment(_patientDetailsModel).open();
		},
		_onCreateRecord: function (oEvent) {
			let that = this;
			that._getCreateNewRecordFragment().open();
		}
	});
});