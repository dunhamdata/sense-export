/*!

* sense-export - Just a simple button to export data in your Qlik Sense application without displaying them in a table first.
* --
* @version v1.3.5
* @link https://github.com/stefanwalther/sense-export
* @author Stefan Walther
* @license MIT
*/

/*!

* sense-angular-directives - AngularJS directives ready to be used in Qlik Sense visualization extensions.
* --
* @version v0.4.2
* @link https://github.com/stefanwalther/sense-angular-directives
* @author Stefan Walther
* @license MIT
*/
define(["jquery", "angular", "qvangular", "text!./eui-overlay.css"], function($, angular, qvangular, cssContent) {
    "use strict";

    function addStyleToHeader(cssContent, id) {
        id && "string" == typeof id ? $("#" + id).length || $("<style>").attr("id", id).html(cssContent).appendTo("head") : $("<style>").html(cssContent).appendTo("head")
    }
    addStyleToHeader(cssContent, "eui-overlay"), qvangular.directive("euiOverlay", function() {
        return {
            restrict: "A",
            replace: !1,
            scope: {
                overlayEnabled: "=",
                overlayTitle: "@",
                overlayText: "@"
            },
            link: function($scope, $element, $attrs) {
                if ($scope.enabled = !!angular.isDefined($attrs.overlayEnabled) && $scope.$parent.$eval($attrs.overlayEnabled), $scope.enabled === !0) {
                    var $overLay = $(document.createElement("div"));
                    $overLay.addClass("eui-overlay-container");
                    var $content = $(document.createElement("div"));
                    $content.addClass("content");
                    var $title = $(document.createElement("div"));
                    $title.addClass("title"), $title.html($scope.overlayTitle), $content.append($title);
                    var $text = $(document.createElement("div"));
                    $text.addClass("text"), $text.html($scope.overlayText), $content.append($text), $overLay.append($content), $element.parent().replaceWith($overLay)
                }
            }
        }
    })
});