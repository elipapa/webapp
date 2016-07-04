angular.module('plugins', [])
.directive ('pluginLoader', ['$compile', '$timeout', 'lazy', '$q', '$analytics', function ($compile, $timeout, lazy, $q, $analytics) {

    return {
        restrict: 'E',
        scope: {
            'visible': '@',
            'plugin': '=',
            'target': '=',
            'disease': '=',
            'dependencies': '=',
            'page': '=',
            'track': '=',
            'label': '='
        },
        link: function(scope, element, attrs) {

            scope.$watch('visible', function (val) {

                // Find the first ancestor element to get the width from
                var sectionWidth = 0;
                var e = element[0];
                while (true) {
                    var p = e.parentNode;
                    if (p.offsetWidth) {
                        sectionWidth = p.offsetWidth;
                        break;
                    }
                    if (e.parentNode) {
                        e = p;
                    } else {
                        break;
                    }
                }

                if (val === "true") {
                    if (scope.track) {
                        $analytics.eventTrack('profile', {"category": attrs.page, "label": scope.label});
                    }

                    // spinner
                    // TODO: substitute by spinner directive
                    var spinner = document.createElement("i");
                    spinner.id = "section-spinner-" + scope.label;
                    spinner.setAttribute("class", "fa fa-spinner fa-spin fa-2x");
                    element[0].appendChild(spinner);

                    // Lazy load the dependencies
                    var deps = scope.dependencies;
                    var loadedDeps = [];
                    for (var dep in deps) {
                        loadedDeps.push(lazy.import(dep));
                    }

                    // The component may not be able to display when the container is not visible, so we wait until it is
                    $q.all(loadedDeps)
                        .then (function () {
                            console.log("All deps have now been loaded...");
                            // remove the spinner
                            var spinner = document.getElementById("section-spinner-" + scope.label);
                            spinner.parentNode.removeChild(spinner);
                            $timeout (function () {
                                var template = '<' + scope.plugin + (scope.target ? (" target=target") : " ") + (scope.disease ? ("disease=disease") : "") + " width=" + sectionWidth + "></" + scope.plugin + ">";
                                var compiled = $compile(template)(scope);
                                element.append(compiled);
                            }, 0);
                        });
                } else {
                    while (element[0].firstChild) {
                        element[0].removeChild(element[0].firstChild);
                    }
                }
            });
        }
    };
}]);
