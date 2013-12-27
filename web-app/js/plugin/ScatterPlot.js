/**
 * Register drag and drop.
 * Clear out all global variables and reset them to blank.
 */
function loadScatterPlotView(){
    scatterPlotView.clear_high_dimensional_input('divIndependentVariable');
    scatterPlotView.clear_high_dimensional_input('divDependentVariable');
    scatterPlotView.register_drag_drop();
}

// constructor
var ScatterPlotView = function () {
    RmodulesView.call(this);
}

// inherit RmodulesView
ScatterPlotView.prototype = new RmodulesView();

// correct the pointer
ScatterPlotView.prototype.constructor = ScatterPlotView;

// submit analysis job
ScatterPlotView.prototype.submit_job = function (form) {

    // get formParams
    var formParams = this.get_form_params(form);

    if (formParams) { // if formParams is not null
        submitJob(formParams);
    }

}

// get form params
ScatterPlotView.prototype.get_form_params = function (form) {
    var formParameters = {}; // init

    //Use a common function to load the High Dimensional Data params.
    loadHighDimensionalParameters(formParameters);

    // instantiate input elements object with their corresponding validations
    var inputArray = this.get_inputs(formParameters);

    // define the validator for this form
    var formValidator = new FormValidator(inputArray);

    if (formValidator.validateInputForm()) { // if input files satisfy the validations

        // get values
        var dependentVariableConceptCode = readConceptVariables("divDependentVariable");
        var independentVariableConceptCode = readConceptVariables("divIndependentVariable");
        var logX = form.logX.checked;
        var variablesConceptCode = dependentVariableConceptCode+"|"+independentVariableConceptCode;

        console.log("logX", logX)

        // assign values to form parameters
        formParameters['jobType'] = 'ScatterPlot';
        formParameters['logX'] = logX;
        formParameters['dependentVariable'] = dependentVariableConceptCode;
        formParameters['independentVariable'] = independentVariableConceptCode;
        formParameters['variablesConceptPaths'] = variablesConceptCode;


        // get analysis constraints
        formParameters['analysisConstraints'] = JSON.stringify(this.get_analysis_constraints('ScatterPlot'));

    } else { // something is not correct in the validation
        // empty form parameters
        formParameters = null;
        // display the error message
        formValidator.display_errors();
    }



    return formParameters;
}

ScatterPlotView.prototype.get_inputs = function (form_params) {

    /**
     * TODO : To add more validations:
     *
     * - input can only be continuous or high dimensional
     * - if type is "continuous", it can only be one node
     * - if type is "high dimensional" --> ? TBC
     * - can be one continuous, one high dimensional
     */


    return  [
        {
            "label" : "Independent Variable",
            "el" : Ext.get("divIndependentVariable"),
            "validations" : [
                {type:"REQUIRED"}
            ]
        },
        {
            "label" : "Dependent Variable",
            "el" : Ext.get("divDependentVariable"),
            "validations" : [
                {type:"REQUIRED"}
            ]
        }
    ];
}

// init heat map view instance
var scatterPlotView = new ScatterPlotView();

/*

function submitScatterPlotJob(form){
	
	var dependentVariableConceptCode = "";
	var independentVariableConceptCode = "";	
	
	dependentVariableConceptCode = readConceptVariables("divDependentVariable");
	independentVariableConceptCode = readConceptVariables("divIndependentVariable");
	
	//------------------------------------
	//Validation
	//------------------------------------
	//Make sure the user entered some items into the variable selection boxes.
	if(dependentVariableConceptCode == '' && independentVariableConceptCode == '')
	{
		Ext.Msg.alert('Missing input', 'Please drag at least one concept into the independent variable and dependent variable boxes.');
		return;
	}
	if(dependentVariableConceptCode == '')
	{
		Ext.Msg.alert('Missing input', 'Please drag at least one concept into the dependent variable box.');
		return;
	}
	if(independentVariableConceptCode == '')
	{
		Ext.Msg.alert('Missing input', 'Please drag at least one concept into the independent variable box.');
		return;
	}
	
	//Loop through the dependent variable box and find the the of nodes in the box.
	var dependentVariableEle = Ext.get("divDependentVariable");
	var independentVariableEle = Ext.get("divIndependentVariable");
	
	var dependentNodeList = createNodeTypeArrayFromDiv(dependentVariableEle,"setnodetype")
	var independentNodeList = createNodeTypeArrayFromDiv(independentVariableEle,"setnodetype")
	
	//The comment section contains trial:TRIALNAME so that we can validate to make sure all the nodes are from the same study.
	var dependentNodeCommentList = createNodeTypeArrayFromDiv(dependentVariableEle,"conceptcomment")
	var independentNodeCommentList = createNodeTypeArrayFromDiv(independentVariableEle,"conceptcomment")
	
	//If the user dragged in multiple node types, throw an error.
	if(dependentNodeList.length > 1)
	{
		Ext.Msg.alert('Wrong input', 'You may only drag nodes of the same type (Continuous,Categorical,High Dimensional) into the input box. The Dependent input box has multiple types.');
		return;		
	}		

	if(independentNodeList.length > 1)
	{
		Ext.Msg.alert('Wrong input', 'You may only drag nodes of the same type (Continuous,Categorical,High Dimensional) into the input box. The Independent input box has multiple types.');
		return;		
	}		
	
	//For the valueicon and hleaficon nodes, you can only put one in a given input box.
	if((dependentNodeList[0] == 'valueicon' || dependentNodeList[0] == 'hleaficon') && (dependentVariableConceptCode.indexOf("|") != -1))
	{
		Ext.Msg.alert('Wrong input', 'For continuous and high dimensional data, you may only drag one node into the input boxes. The Dependent input box has multiple nodes.');
		return;		
	}		

	if((independentNodeList[0] == 'valueicon' || independentNodeList[0] == 'hleaficon') && (independentVariableConceptCode.indexOf("|") != -1))
	{
		Ext.Msg.alert('Wrong input', 'For continuous and high dimensional data, you may only drag one node into the input boxes. The Independent input box has multiple nodes.');
		return;		
	}		
	
	//Nodes will be either 'hleaficon' or 'valueicon'.
	//Scatter plot requires 2 continuous variables.
	var depVariableType = "";
	var indVariableType = "";	
	
	//If there is a categorical variable in either box (This means either of the lists are empty)
	if(!dependentNodeList[0] || dependentNodeList[0] == "null") depVariableType = "CAT";
	if(!independentNodeList[0] || independentNodeList[0] == "null") indVariableType = "CAT";	
	
	//If we have a value icon node, or a high dim that isn't SNP genotype, it is continuous.
	if((dependentNodeList[0] == 'valueicon' || (dependentNodeList[0] == 'hleaficon' && !(window['divDependentVariableSNPType'] == "Genotype" && window['divDependentVariablemarkerType'] == 'SNP')))) depVariableType = "CON";
	if((independentNodeList[0] == 'valueicon' || (independentNodeList[0] == 'hleaficon' && !(window['divIndependentVariableSNPType'] == "Genotype" && window['divIndependentVariablemarkerType'] == 'SNP')))) indVariableType = "CON";
	
	//If we don't have two continuous variables, throw an error.
	if(!(depVariableType=="CON"))
	{
		Ext.Msg.alert('Wrong input', 'Scatter plot requires 2 continuous variables and the dependent variable is not continuous.');
		return;		
	}
	
	if(!(indVariableType=="CON"))
	{
		Ext.Msg.alert('Wrong input', 'Scatter plot requires 2 continuous variables and the independent variable is not continuous.');
		return;		
	}
	
	//------------------------------------	
	
	var logX = form.logX.checked;
	
	var variablesConceptCode = dependentVariableConceptCode+"|"+independentVariableConceptCode;
	
	var formParams = {
			dependentVariable:						dependentVariableConceptCode,
			independentVariable:					independentVariableConceptCode,
			variablesConceptPaths:					variablesConceptCode,
			logX:									logX,
			jobType:								'ScatterPlot'			
	}
	
	if(!loadHighDimensionalParameters(formParams)) return false;
	
	
	//------------------------------------
	//More Validation
	//------------------------------------	
	//If the user dragged in a high dim node, but didn't enter the High Dim Screen, throw an error.
	if(dependentNodeList[0] == 'hleaficon' && formParams["divDependentVariableType"] == "CLINICAL")
	{
		Ext.Msg.alert('Wrong input', 'You dragged a High Dimensional Data node into the dependent variable box but did not select any filters. Please click the "High Dimensional Data" button and select filters. Apply the filters by clicking "Apply Selections".');
		return;			
	}
	if(independentNodeList[0] == 'hleaficon' && formParams["divIndependentVariableType"] == "CLINICAL")
	{
		Ext.Msg.alert('Wrong input', 'You dragged a High Dimensional Data node into the independent variable box but did not select any filters. Please click the "High Dimensional Data" button and select filters. Apply the filters by clicking "Apply Selections".');
		return;			
	}	
	//------------------------------------
	
	submitJob(formParams);
}
*/