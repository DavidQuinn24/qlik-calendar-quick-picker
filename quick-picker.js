// Quick Picker Extension 
// ----------------------
// Note that only works for Contiguous Date Ranges: it sets min/max values based on the flag supplied
// (because my plan is to integrate with the Qlik Dashboard Bundle Date Range Selector which works in this way)
// If you need to use non-contiguous ranges, it would be better to use a p() function.
//
// Dave Quinn 9/3/2020. Borrows some code from Erik Wetterberg's qsVariable

define( [ "qlik" ], function ( qlik ) {
	'use strict';
	var variableList, variableListPromise;

	var minDate = '';
	var maxDate = '';
	
// Erik Wetterberg : reads the dynamicValue array and splits it into Labels and Values
	function getAlternatives(text) { 
		if (text == ''){
			return;
		}
		return text.split('|').map(function (item) {
			var arr = item.split('~');
			return {
				value: arr[0],
				label: arr.length > 1 ? arr[1] : arr[0]
			};
		});
	}
	// Takes a mastercalendar type flag and sets the min/max dates related
	function setMinMaxDates(app,qix, flag, targetDimension) { 
		// create a promise chain which 1. sets the min date, 2. sets the max date, 3. makes a date selection using min & max.
		// being in a chain ensures that the selection only happens after min and max have been set
		
		// first clear previous selections, or the results can get wierd
		app.field(targetDimension).clear()
		.then ( function(setMinDate){
			return qix.evaluateEx("min({< " + flag + "={1}>}"+ targetDimension +")"); 
		})
		.then( function(setMinDate){
			minDate=setMinDate.qText;
			//console.log('min =',minDate);
			return qix.evaluateEx("max({< " + flag + "={1}>}"+ targetDimension +")");
		})
		.then(	function(setMaxDate){ 
				maxDate=setMaxDate.qText;
				//console.log('max =',maxDate);
				return app.field(targetDimension).selectMatch('>=' + minDate + '<=' + maxDate, true);
		})
	}
	// parse the alternatives array, creating a button for each item and adding it to the div 'wrapper' 
	function addButtons(app,qix, alternatives, targetDimension) {
		alternatives.forEach(function (alt) {
			var btn = document.createElement("BUTTON");
			btn.innerHTML = alt.label;
			btn.className = 'lui-button';
			btn.style= 'margin: 1px';

			btn.dataset.value = alt.value;
				btn.onclick = function () {
					setMinMaxDates(app, qix, alt.value, targetDimension);
				};	
			document.getElementById('wrapper').appendChild(btn);
		});
	}
	
	function createDropdown(app,qix, alternatives, targetDimension){
		var selectList = document.createElement("select");
		selectList.id = "quick-pick";
		selectList.onchange = function () { 
					setMinMaxDates(app, qix, selectList.value, targetDimension);
				};	
		document.getElementById('wrapper').appendChild(selectList);
		// add a blank element at top of list
		selectList.appendChild(new Option());

		//Create and append the options
		alternatives.forEach(function (alt) {
			var opt = new Option(alt.label,alt.value);
			opt.className = "lui-list__text";
			selectList.appendChild(opt);
		});
	}

        return {
		initialProperties: {
			alternatives: []
		},
            definition: {
                type: "items",
                component: "accordion",
			items: {
				dimensions: {
                	uses : "dimensions",
					min : 1,
					max : 1
				},
				settings: {
					uses: 'settings',
					items: {
						displayAs: {
							type: 'string',
							label: 'Display As',
							ref: 'displayAs',
							component: "radiobuttons",
							options : [{
								value: "buttons",
								label: "Buttons"
							}, {
								value: "dropdown",
								label: "Dropdown Menu"
							}],
							defaultValue: "buttons"
						},
						values: {
							type: 'items',
							label: 'Custom (Master Calendar) Flags',
							show: function (data) {
								return true;
							},
							items: {
								dynamicvalues: {
									type: 'string',
									ref: 'dynamicvalues',
									label: 'Dynamic values',
									expression: 'optional',
									show: function (data) {
										return true;
									}
								},
								dynamictext: {
									component: 'text',
									label: 'Use | to separate values and ~ to separate value and label, like this: value1|value2 or value1~label1|value2~label2)',
									show: function (data) {
										return true;
									}
								}
							}
						} // settings:items: values
					} // settings: items
				} // settings
			} // items
            },
            snapshot: {
                canTakeSnapshot: true
            },
		paint: function ($element ) {
			var app = qlik.currApp(this);
			var layout = this.$scope.layout;
			var qix = this.backendApi.model.enigmaModel.session.app;
			var alternatives = getAlternatives(layout.dynamicvalues) ;	
			var htm='';	
				// Create html element containing a single div called wrapper, 
				// which will be the target container for buttons when they are created

				htm += "<div id='wrapper' style='  text-align: center;'><i class='lui-icon lui-icon--star' style='margin:1px;'> </i></div>"
				$element.html( htm  );
			
			if (layout.displayAs == 'buttons') {
				//Dynamically create buttons for each value in the alternatives array

				addButtons(app,qix,alternatives,layout.qHyperCube.qDimensionInfo[0].qFallbackTitle);
			}
			else {
				//Create and append select list
				createDropdown(app,qix,alternatives,layout.qHyperCube.qDimensionInfo[0].qFallbackTitle);
			}

			

		
		//needed for export
			return qlik.Promise.resolve();
		}
	};

} );
