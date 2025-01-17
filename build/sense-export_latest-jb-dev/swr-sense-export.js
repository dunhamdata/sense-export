/*!

* UPDATED TO RESOLVE BUG IN CLIENT SIDE EXPORT FUNCTIONALITY 
* 
* 
* sense-export - Just a simple button to export data in your Qlik Sense application without displaying them in a table first.
* --
* @version v1.3.6
* @link https://github.com/dunhamdata/sense-export 
* @author Stefan Walther
* @license MIT
*/

/* global define, saveAs */
define(["angular", "qlik", "./properties", "./initialproperties", "text!./lib/css/main.min.css", "text!./template.ng.html", "./lib/external/sense-extension-utils/general-utils", "./lib/external/file-saver/FileSaver.min", "./lib/components/eui-button/eui-button", "./lib/components/eui-overlay/eui-overlay", "./lib/components/eui-simple-table/eui-simple-table"], function(angular, qlik, props, initProps, cssContent, ngTemplate, generalUtils) {
    "use strict";
    var $injector = angular.injector(["ng"]),
        $q = $injector.get("$q");
    generalUtils.addStyleToHeader(cssContent);
    var faUrl = "/extensions/swr-sense-export/lib/external/fontawesome/css/font-awesome.min.css";
    return generalUtils.addStyleLinkToHeader(faUrl, "swr_sense_export__fontawesome"), {
        definition: props,
        initialProperties: initProps,
        snapshot: {
            canTakeSnapshot: !1
        },
        template: ngTemplate,
        controller: ["$scope", function($scope) {
            $scope.DEBUG = $scope.layout.props.isDebugOutput || !0, $scope.exporting = !1, $scope.$watchCollection("layout.props", function(newVals, oldVals) {
                Object.keys(newVals).forEach(function(key) {
                    newVals[key] !== oldVals[key] && ($scope[key] = newVals[key])
                })
            }), $scope.showUnsupportedOverlay = function() {
                return void 0 === qlik.table
            }, $scope.debug = function() {
                return $scope.layout.props.isDebug === !0 && qlik.navigation && "edit" === qlik.navigation.getMode()
            }, $scope.export = function() {
                switch ($scope.exporting = !0, $scope.layout.props.exportFormat) {
                    case "OOXML":
                    case "CSV_C":
                    case "CSV_T":
                        var exportOpts = {
                            format: $scope.layout.props.exportFormat,
                            state: $scope.layout.props.exportState,
                            filename: $scope.layout.props.exportFileName,
                            download: !0
                        };
                        $scope.ext.model.exportData(exportOpts.format, "/qHyperCubeDef", exportOpts.filename, exportOpts.download).then(function(retVal) {
                            if (exportOpts.download) {
                                var qUrl = retVal.result ? retVal.result.qUrl : retVal.qUrl,
                                    link = $scope.getBasePath() + qUrl;
                                window.open(link)
                            }
                        }).catch(function(err) {}).finally(function() {
                            $scope.exporting = !1
                        });
                        break;
                    case "CSV_C__CLIENT":
                        $scope.getAllData().then(function(data) {
                            var dataArray = $scope.dataToArray($scope.layout.qHyperCube.qDimensionInfo, $scope.layout.qHyperCube.qMeasureInfo, data);
                            $scope.arrayToCSVDownload(dataArray, $scope.layout.props.exportFileName || "export.csv")
                        }).catch(function(err) {}).finally(function() {
                            $scope.exporting = !1
                        });
                        break;
                    default:
                        return $scope.exporting = !1, !1
                }
            }, $scope.getBasePath = function() {
                var prefix = window.location.pathname.substr(0, window.location.pathname.toLowerCase().lastIndexOf("/sense") + 1),
                    url = window.location.href;
                return url = url.split("/"), url[0] + "//" + url[2] + ("/" === prefix[prefix.length - 1] ? prefix.substr(0, prefix.length - 1) : prefix)
            }, $scope.getAllData = function() {
                var qTotalData = [],
                    model = $scope.ext.model,
                    deferred = $q.defer();
                return model.getHyperCubeData("/qHyperCubeDef", [{
                    qTop: 0,
                    qWidth: 20,
                    qLeft: 0,
                    qHeight: 500
                }]).then(function(data) {
                    var columns = model.layout.qHyperCube.qSize.qcx,
                        totalHeight = model.layout.qHyperCube.qSize.qcy,
                        pageHeight = 500,
                        numberOfPages = Math.ceil(totalHeight / pageHeight);
                    if ($scope.log("Number of recs/page", 500), $scope.log("Recs", totalHeight), $scope.log("Number of pages: ", numberOfPages), 1 === numberOfPages) data.qDataPages ? deferred.resolve(data.qDataPages[0].qMatrix) : deferred.resolve(data[0].qMatrix);
                    else {
                        $scope.log("Started to export data on ", new Date);
                        var Promise = $q,
                            promises = Array.apply(null, new Array(numberOfPages)).map(function(data, index) {
                                var page = {
                                    // removed + index from script to resolve bug with client side export
                                    qTop: pageHeight * index,
                                    qLeft: 0,
                                    qWidth: columns,
                                    qHeight: pageHeight,
                                    index: index
                                };
                                return $scope.log("page ", index + 1 + "/" + numberOfPages), model.getHyperCubeData("/qHyperCubeDef", [page])
                            }, this);
                        Promise.all(promises).then(function(data) {
                            for (var j = 0; j < data.length; j++)
                                if (data[j].qDataPages)
                                    for (var k1 = 0; k1 < data[j].qDataPages[0].qMatrix.length; k1++) qTotalData.push(data[j].qDataPages[0].qMatrix[k1]);
                                else
                                    for (var k2 = 0; k2 < data[j][0].qMatrix.length; k2++) qTotalData.push(data[j][0].qMatrix[k2]);
                            $scope.log("Finished exporting data on ", new Date), deferred.resolve(qTotalData)
                        })
                    }
                }), deferred.promise
            }, $scope.dataToArray = function(dimensionInfo, measureInfo, data) {
                var headers = [],
                    table = [];
                return dimensionInfo.forEach(function(dimension) {
                    headers.push(dimension.qFallbackTitle)
                }), measureInfo.forEach(function(measure) {
                    headers.push(measure.qFallbackTitle)
                }), table.push(headers), data.forEach(function(item) {
                    var row = [];
                    item.forEach(function(itemElem) {
                        row.push(itemElem.qText)
                    }), table.push(row)
                }), table
            }, $scope.arrayToCSVDownload = function(arr, fileName) {
                var dataString = "";
                arr.forEach(function(infoArray) {
                    dataString += infoArray.join(",") + "\n"
                });
                var BOM = "\ufeff",
                    data = BOM + dataString,
                    blob = new Blob([data], {
                        type: "text/csv;charset=utf-8"
                    });
                saveAs(blob, fileName)
            }, $scope.log = function(msg, arg) {
                $scope.DEBUG
            }
        }]
    }
});