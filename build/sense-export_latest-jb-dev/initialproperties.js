/*!

* sense-export - Just a simple button to export data in your Qlik Sense application without displaying them in a table first.
* --
* @version v1.3.5
* @link https://github.com/dunhamdata/sense-export 
* @author Stefan Walther
* @license MIT
*/

/* global define */
define([], function() {
    "use strict";
    return {
        qHyperCubeDef: {
            qDimensions: [],
            qMeasures: [],
            qInitialDataFetch: [{
                qWidth: 20,
                qHeight: 500
            }]
        }
    }
});