/*************************************************************************   
* Copyright 2008-2012 Janssen Research & Development, LLC.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*     http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
******************************************************************/

/*function submitBoxPlotJob(form){
	var dependentVariableEle = Ext.get("divDependentVariable");
	var independentVariableEle = Ext.get("divIndependentVariable");
	
	var dependentVariableConceptCode = "";
	var independentVariableConceptCode = "";	
	
	//If we have multiple items in the Dependent variable box, or if we are binning on it, then we have to flip the graph image.
	var flipImage = false;
	
	if((dependentVariableEle.dom.childNodes.length > 1) || (GLOBAL.Binning && document.getElementById("selBinVariableSelection").value == "DEP"))
	{
		flipImage = true;
	}
	
	//If the category variable element has children, we need to parse them and concatenate their values.
	if(independentVariableEle.dom.childNodes[0])
	{
		//Loop through the category variables and add them to a comma seperated list.
		for(nodeIndex = 0; nodeIndex < independentVariableEle.dom.childNodes.length; nodeIndex++)
		{
			//If we already have a value, add the seperator.
			if(independentVariableConceptCode != '') independentVariableConceptCode += '|' 
			
			//Add the concept path to the string.
			independentVariableConceptCode += getQuerySummaryItem(independentVariableEle.dom.childNodes[nodeIndex]).trim()
		}
	}	
	
	//If the category variable element has children, we need to parse them and concatenate their values.
	if(dependentVariableEle.dom.childNodes[0])
	{
		//Loop through the category variables and add them to a comma seperated list.
		for(nodeIndex = 0; nodeIndex < dependentVariableEle.dom.childNodes.length; nodeIndex++)
		{
			//If we already have a value, add the seperator.
			if(dependentVariableConceptCode != '') dependentVariableConceptCode += '|' 
			
			//Add the concept path to the string.
				dependentVariableConceptCode += getQuerySummaryItem(dependentVariableEle.dom.childNodes[nodeIndex]).trim()
		}
	}	
	
	//Make sure the user entered some items into the variable selection boxes.
	if(dependentVariableConceptCode == '')
		{
			Ext.Msg.alert('Missing input!', 'Please drag at least one concept into the dependent variable box.');
			return;
		}
	
	if(independentVariableConceptCode == '')
		{
			Ext.Msg.alert('Missing input!', 'Please drag at least one concept into the independent variable box.');
			return;
		}
		
	
	var formParams = {
						dependentVariable:dependentVariableConceptCode,
						independentVariable:independentVariableConceptCode
					};
	
	loadHighDimensionalParameters(formParams);
	loadBinningParametersBoxPlot(formParams);
	
	//Pass in our flag that tells us whether to flip or not.
	formParams["flipImage"] = (flipImage) ? 'TRUE' : 'FALSE'
	
	submitJob(formParams);
}

function loadBoxPlotView(){
	registerBoxPlotDragAndDrop();
	clearHighDimDataSelections('divIndependentVariable');
	clearHighDimDataSelections('divDependentVariable');
}

function registerBoxPlotDragAndDrop()
{
	//Set up drag and drop for Dependent and Independent variables on the data association tab.
	//Get the Dependent DIV.
	var dependentDiv = Ext.get("divDependentVariable");
	//Get the Independent DIV
	var independentDiv = Ext.get("divIndependentVariable");
	
	//Add the drop targets and handler function.
	dtgD = new Ext.dd.DropTarget(dependentDiv,{ddGroup : 'makeQuery'});
	dtgD.notifyDrop =  dropOntoCategorySelection;
	
	dtgI = new Ext.dd.DropTarget(independentDiv,{ddGroup : 'makeQuery'});
	dtgI.notifyDrop =  dropOntoCategorySelection;
	
}

function clearGroupBox(divName)
{
	//Clear the drag and drop div.
	var qc = Ext.get(divName);
	
	for(var i=qc.dom.childNodes.length-1;i>=0;i--)
	{
		var child=qc.dom.childNodes[i];
		qc.dom.removeChild(child);
	}	
	
	clearHighDimDataSelections(divName);
	clearSummaryDisplay(divName);

}

function toggleBinning() {
	// Change the Binning flag.
	GLOBAL.Binning = !GLOBAL.Binning;

	// Toggle the div with the binning options.
	Ext.get('divBinning').toggle();

	// Change the toggle button text.
	if (GLOBAL.Binning) {
		document.getElementById('BinningToggle').value = "Disable"
	} else {
		document.getElementById('BinningToggle').value = "Enable"
	}
}

function updateManualBinning() {
	// Change the ManualBinning flag.
	GLOBAL.ManualBinning = document.getElementById('chkManualBin').checked;

	// Get the type of the variable we are dealing with.
	variableType = Ext.get('variableType').getValue();

	// Hide both DIVs.
	var divContinuous = Ext.get('divManualBinContinuous');
	var divCategorical = Ext.get('divManualBinCategorical');
	divContinuous.setVisibilityMode(Ext.Element.DISPLAY);
	divCategorical.setVisibilityMode(Ext.Element.DISPLAY);
	divContinuous.hide();
	divCategorical.hide();
	// Show the div with the binning options relevant to our variable type.
	if (document.getElementById('chkManualBin').checked) {
		if (variableType == "Continuous") {
			divContinuous.show();
			divCategorical.hide();
		} else {
			divContinuous.hide();
			divCategorical.show();
			setupCategoricalItemsList("divIndependentVariable","divCategoricalItems");
		}
	}
}
*/


/**
 * When we change the number of bins in the "Number of Bins" input, we have to
 * change the number of bins on the screen.
 */
/*
function manageBins(newNumberOfBins) {

	// This is the row template for a continousBinningRow.
	var tpl = new Ext.Template(
			'<tr id="binningContinousRow{0}">',
			'<td>Bin {0}</td><td><input type="text" id="txtBin{0}RangeLow" /> - <input type="text" id="txtBin{0}RangeHigh" /></td>',
			'</tr>');
	var tplcat = new Ext.Template(
			'<tr id="binningCategoricalRow{0}">',
			'<td><b>Bin {0}</b><div id="divCategoricalBin{0}" class="queryGroupIncludeSmall"></div></td>',
			'</tr>');

	// This is the table we add continuous variables to.
	continuousBinningTable = Ext.get('tblBinContinuous');
	categoricalBinningTable = Ext.get('tblBinCategorical');
	// Clear all old rows out of the table.

	// For each bin, we add a row to the binning table.
	for (i = 1; i <= newNumberOfBins; i++) {
		// If the object isn't already on the screen, add it.
		if (!(Ext.get("binningContinousRow" + i))) {
			tpl.append(continuousBinningTable, [ i ]);
		} else {
			Ext.get("binningContinousRow" + i).show()
		}

		// If the object isn't already on the screen, add it-Categorical
		if (!(Ext.get("binningCategoricalRow" + i))) {
			tplcat.append(categoricalBinningTable, [ i ]);
			// Add the drop targets and handler function.
			var bin = Ext.get("divCategoricalBin" + i);
			var dragZone = new Ext.dd.DragZone(bin, {
				ddGroup : 'makeBin',
				isTarget: true,
				ignoreSelf: false
			
			});
			var dropZone = new Ext.dd.DropTarget(bin, {
				ddGroup : 'makeBin',
				isTarget: true,
				ignoreSelf: false
			});
			// dropZone.notifyEnter = test;
			dropZone.notifyDrop = dropOntoBin; // dont forget to make each
			// dropped
			// node a drag target
		} else {
			Ext.get("binningCategoricalRow" + i).show()
		}
	}

	// If the new number of bins is less than the old, hide the old bins.
	if (newNumberOfBins < GLOBAL.NumberOfBins) {
		// For each bin, we add a row to the binning table.
		for (i = parseInt(newNumberOfBins) + 1; i <= GLOBAL.NumberOfBins; i++) {
			// If the object isn't already on the screen, add it.
			if (Ext.get("binningContinousRow" + i)) {
				Ext.get("binningContinousRow" + i).hide();
			}
			// If the object isn't already on the screen, add it.
			if (Ext.get("binningCategoricalRow" + i)) {
				Ext.get("binningCategoricalRow" + i).hide();
			}
		}
	}

	// Set the global variable to reflect the new bin count.
	GLOBAL.NumberOfBins = newNumberOfBins;
	updateManualBinning();
}


function dropOntoBin(source, e, data) {
	this.el.appendChild(data.ddel);
	// Ext.dd.Registry.register(data.ddel, {el : data.ddel});
	return true;
}

function loadHighDimensionalParameters(formParams)
{
	var mrnaData = false;
	var snpData = false;	
	var fullGEXGeneList = "";
	var fullSNPGeneList = "";
	var independentGeneList = window['divIndependentVariablepathway'];
	var dependentGeneList 	= window['divDependentVariablepathway'];
	var dependentPlatform 	= window['divDependentVariableplatforms1'];
	var independentPlatform = window['divIndependentVariableplatforms1'];
	var dependentType 		= window['divDependentVariablemarkerType'];
	var independentType		= window['divIndependentVariablemarkerType'];
	
	
	//If we are using High Dimensional data we need to create variables that represent genes from both independent and dependent selections (In the event they are both of a single high dimensional type).
	//Check to see if the user selected GEX in the independent input.
	if(independentType == "Gene Expression")
	{
		//The genes entered into the search box were GEX genes.
		fullGEXGeneList = independentGeneList;
		
		//This flag will tell us to write the GEX text file.
		mrnaData = true;
		
		//Fix the platform to be something the R script expects.
		independentType = "MRNA";		
	}
	
	if(dependentType == "Gene Expression")
	{
		//If the gene list already has items, add a comma.
		if(fullGEXGeneList != "") fullGEXGeneList += ","
		
		//Add the genes in the list to the full list of GEX genes.
		fullGEXGeneList += dependentGeneList
		
		//This flag will tell us to write the GEX text file.		
		mrnaData = true;
		
		//Fix the platform to be something the R script expects.
		dependentType = "MRNA";		
	}
	
	//Check to see if the user selected SNP in the independent input.
	if(independentType == "SNP")
	{
		//The genes entered into the search box were SNP genes.
		fullSNPGeneList = independentGeneList;
		
		//This flag will tell us to write the SNP text file.
		snpData = true;
	}
	
	if(dependentType == "SNP")
	{
		//If the gene list already has items, add a comma.
		if(fullSNPGeneList != "") fullGEXGeneList += ","
		
		//Add the genes in the list to the full list of SNP genes.
		fullSNPGeneList += dependentGeneList
		
		//This flag will tell us to write the SNP text file.		
		snpData = true;
	}	

	
	if((fullGEXGeneList == "") && (independentType == "MRNA" || dependentType == "MRNA"))
	{
		Ext.Msg.alert("No Genes Selected!", "Please specify Genes in the Gene/Pathway Search box.")
		return false;
	}
	
	if((fullSNPGeneList == "") && (independentType == "SNP" || dependentType == "SNP"))
	{
		Ext.Msg.alert("No Genes Selected!", "Please specify Genes in the Gene/Pathway Search box.")
		return false;
	}
		
	//If we don't have a platform, fill in Clinical.
	if(dependentPlatform == null || dependentPlatform == "") dependentType = "CLINICAL"
	if(independentPlatform == null || independentPlatform == "") independentType = "CLINICAL"
	
	formParams["divDependentVariabletimepoints"] 			= window['divDependentVariabletimepoints1'];
	formParams["divDependentVariablesamples"] 				= window['divDependentVariablesamples1'];
	formParams["divDependentVariablerbmPanels"]				= window['divDependentVariablerbmPanels1'];
	formParams["divDependentVariableplatforms"]				= dependentPlatform
	formParams["divDependentVariablegpls"]					= window['divDependentVariablegpls1'];
	formParams["divDependentVariabletissues"]				= window['divDependentVariabletissues1'];
	formParams["divDependentVariableprobesAggregation"]	 	= window['divDependentVariableprobesAggregation'];
	formParams["divDependentVariableSNPType"]				= window['divDependentVariableSNPType'];
	formParams["divDependentVariableType"]					= dependentType;
	formParams["divDependentVariablePathway"]				= dependentGeneList;
	formParams["divIndependentVariabletimepoints"]			= window['divIndependentVariabletimepoints1'];
	formParams["divIndependentVariablesamples"]				= window['divIndependentVariablesamples1'];
	formParams["divIndependentVariablerbmPanels"]			= window['divIndependentVariablerbmPanels1'];
	formParams["divIndependentVariableplatforms"]			= independentPlatform;
	formParams["divIndependentVariablegpls"]				= window['divIndependentVariablegpls1'];
	formParams["divIndependentVariabletissues"]				= window['divIndependentVariabletissues1'];
	formParams["divIndependentVariableprobesAggregation"]	= window['divIndependentVariableprobesAggregation'];
	formParams["divIndependentVariableSNPType"]				= window['divIndependentVariableSNPType'];
	formParams["divIndependentVariableType"]				= independentType;
	formParams["divIndependentVariablePathway"]				= independentGeneList;
	formParams["gexpathway"]								= fullGEXGeneList;
	formParams["snppathway"]								= fullSNPGeneList;
	formParams["divIndependentPathwayName"]					= window['divIndependentVariablepathwayName'];
	formParams["divDependentPathwayName"]					= window['divDependentVariablepathwayName'];
	formParams["mrnaData"]									= mrnaData;
	formParams["snpData"]									= snpData;
	
}

function loadBinningParametersBoxPlot(formParams)
{
	
	//These default to FALSE
	formParams["binning"] = "FALSE";
	formParams["manualBinning"] = "FALSE";
	
	// Gather the data from the optional binning items, if we had selected to
	// enable binning.
	if (GLOBAL.Binning) {
		// Get the number of bins the user entered.
		var numberOfBins = Ext.get("txtNumberOfBins").getValue()

		// Get the value from the dropdown that specifies the type of
		// binning.
		var binningType = Ext.get("selBinDistribution").getValue()

		//Get the value from the dropdown that tells us which variable to bin.
		var binningVariable = Ext.get("selBinVariableSelection").getValue()
		
		// Add these items to our form parameters.
		formParams["binning"] = "TRUE";
		formParams["numberOfBins"] = numberOfBins;
		formParams["binDistribution"] = binningType;
		formParams["binVariable"] = binningVariable;

		// If we are using Manual Binning we need to add the parameters
		// here.
		if (GLOBAL.ManualBinning) {

			// Get a bar separated list of bins and their ranges.
			var binRanges = ""

			// Loop over each row in the HTML table.
			var variableType = Ext.get('variableType').getValue();
			if (variableType == "Continuous") {
				for (i = 1; i <= GLOBAL.NumberOfBins; i++) {
					binRanges += "bin" + i + ","
					binRanges += Ext.get('txtBin' + i + 'RangeLow').getValue()
							+ ","
					binRanges += Ext.get('txtBin' + i + 'RangeHigh').getValue()
							+ "|"
				}
			} else {
				for (i = 1; i <= GLOBAL.NumberOfBins; i++) {
					binRanges += "bin" + i + "<>"
					var bin = Ext.get('divCategoricalBin' + i);
					for (x = 0; x < bin.dom.childNodes.length; x++) {
						binRanges+=bin.dom.childNodes[x].getAttribute('conceptdimcode') + "<>"
					}
					binRanges=binRanges.substring(0, binRanges.length - 2);
					binRanges=binRanges+"|";
				}
			}
			formParams["manualBinning"] = "TRUE";
			formParams["binRanges"] = binRanges.substring(0,binRanges.length - 1);
			formParams["variableType"] = Ext.get('variableType').getValue();
		}
	}

}


*/