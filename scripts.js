function inject_inputs(tagname, target) {
    var inputs = document.getElementsByTagName(tagname);
    console.log(inputs);
    for (var i=0; i < inputs.length; i++) {
        var input = inputs[i];
        target[input.id] = input.value;
    }
}

function scrape_inputs() {
    var result = {};
    inject_inputs('input', result);
    result['form_id'] = v4();
    inject_inputs('textarea', result);
    console.log(result);
    return result;
}

function download_file(obj,name){
    var form = document.getElementById("my_form");
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }
    
    var txt = JSON.stringify(obj);
    var a = window.document.createElement('a');
    a.href = 'data:application/json;encoding=UTF-8,'+txt;
    a.download =  name + '.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

function roundString(value, decimals)
{
    // adjusted from https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/round

    // convert to number
    value = +value;
    decimals = +decimals;

    // check
    if( isNaN(value) || !(typeof decimals === 'number' && decimals % 1 === 0) )
    {
        return NaN;
    }

    // check negative
    var isNegative = value < 0;
    if( isNegative )
    {
        value = -value;
    }

    if (typeof decimals === 'undefined' || decimals === 0)
    {
        value = Math.round(value);
    }
    else
    {
        value = +(Math.round(+(value + 'e+' + decimals)) + 'e-' + decimals);
    }

    // handle negative
    if( isNegative )
    {
        value = -value;
    }

    // convert to string
    value = value.toString();
    return value;
}

function updateTextAreaAndLabel( fromTextAreaId, toTextAreaID, labelID, qNumRows, qNumCols, decimals )
{
    // get txt
    var txtArea = document.getElementById( fromTextAreaId );
    var rawTxt = txtArea.value;

    // convert to csv format
    var lines = rawTxt.replace(/(\r\n)/g,';').replace(/[\r\n]/g,';').replace(/[ \t]/g,',');

    // split each line
    var arrayLines = lines.split(';');

    // detected dimension
    var numRows = arrayLines.length;
    var numCols = 1 + (arrayLines[0].match(/,/g)||[]).length;

    // init
    var success = true;
    var failIncorrectDimensions = ( numRows <= 0 ) || ( numRows != qNumRows ) || ( numCols <= 0 ) || ( numCols != qNumCols );
    var failInconsistentDimensions = false;
    var failValues = false;

    // parse including round
    var currentNumCols = 0;
    for( var i=0; i < arrayLines.length; i++ )
    {
        // check dimension
        currentNumCols = 1 + (arrayLines[i].match(/,/g)||[]).length;
        if( currentNumCols != numCols )
        {
            failInconsistentDimensions = true;
        }

        // insert 0's if needed
        if( arrayLines[i].length == 0 )
        {
            arrayLines[i] = '0';
        }
        else
        {
            arrayLines[i] = arrayLines[i].replace(/^,/g, '0,').replace(/,$/g, ',0').replace(/,(?=,)/g, ',0');
        }

        // convert each element to number and round, then convert back
        var arrayElems = arrayLines[i].split(',');
        for( var j=0; j < arrayElems.length; j++ )
        {
            arrayElems[j] = roundString( arrayElems[j], decimals );

            if( isNaN(arrayElems[j]) )
            {
                failValues = true;
            }
        }

        // combine and store new string
        arrayLines[i] = arrayElems.join(',');
    }

    // combine using newline instead of ; for readability
    lines = arrayLines.join('\n');

    // successful?
    success = (success && !failIncorrectDimensions && !failInconsistentDimensions && !failValues );

    // make new label
    var newLabel = '';
    if( success )
    {
        newLabel += '<font color="green"><b>Success! Detected a matrix of size ' + numRows + ' x ' + numCols + '.</b></font>';
    }
    else
    {
        newLabel += '<font color="red"><b>Failure!';
        if( failInconsistentDimensions )
        {
            newLabel += ' Inconsistent dimensions detected!';
        }
        else
        {
            if( failIncorrectDimensions )
            {
                newLabel += ' Incorrect dimensions detected (detected a matrix of size ' + numRows + ' x ' + numCols + ')!';
            }
        }
        if( failValues )
        {
            newLabel += ' Invalid values detected!';
        }
        newLabel += '</b></font>';
    }

    // set textarea
    var resultTxtArea = document.getElementById( toTextAreaID );
    resultTxtArea.value = lines;

    // set label
    var resultLabel = document.getElementById( labelID );
    resultLabel.innerHTML = newLabel;
}

function getFormElement()
{
    var elem = document.getElementById( 'util_functions_div_id' ).parentElement;
    return elem;
}
