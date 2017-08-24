
/**
 * Module for all general/common facets directives
 */


angular.module('facets', [])


    /**
    * Top level container for all the facets.
    * This contains accordion etc
    */
    .directive('facetLoader', ['$compile', function ($compile) {
        'use strict';

        return {

            restrict: 'AE',

            scope: {
                'plugin': '@',
                'facet': '='
            },

            link: function (scope, elem) {
                var template = '<' + scope.plugin + ' facet=facet></' + scope.plugin + '>';
                var compiled = $compile(template)(scope);
                elem.append(compiled);
            }

        };
    }])


    /**
    * Top level container for all the facets.
    * This contains accordion etc
    */
    .directive('cttvFacets', ['cttvFiltersService', function (cttvFiltersService) {
        'use strict';

        return {

            restrict: 'AE',

            scope: {},

            templateUrl: 'src/components/facets/facets.html',

            link: function (scope) {
                // scope.dataDistribution =
                scope.filters = cttvFiltersService.getFilters();
                scope.selectedFilters = cttvFiltersService.getSelectedFilters();
                scope.deselectAll = cttvFiltersService.deselectAll;

                // scope.respStatus = 1; //cttvFiltersService.status(); // TODO: handle response status
                // scope.updateFilter = function(id){
                //    cttvFiltersService.getFilter(id).toggle();
                // }
            }

        };
    }])


    /**
     * The default "select all / clear all" controls for facets
     * @param facet the facet (i.e. instance of FilterCollection from the FilterService) we are rendering, e.g. datatypes, pathways, score , etc...
     */
    .directive('cttvDefaultFacetControls', [function () {
        'use strict';

        return {

            restrict: 'AE',

            scope: {
                facet: '='
            },

            template: '<div class="cttv-facets-controls">'
                      + '    <span ng-click="facet.selectAll(false)">Clear all <i class="fa fa-times"></i></span>'
                      + '    <span ng-click="facet.selectAll(true)">Select all <i class="fa fa-check"></i></span>'
                      + '</div>'
        };
    }])


    /**
     * A directive for plain Checkbox facets.
     * @param bucket the instance of Filter object from the FilterService; this is likely in an ng-repeat thing like ng-repeat="bucket in filters"
     */
    .directive('cttvCheckboxFacet', [function () {
        'use strict';

        return {

            restrict: 'AE',

            scope: {
                bucket: '=',
                // partial: '@',    // optional 'OK' status -- TODO: remove deprecated param
                multiline: '@?'  // optional multiline option
            },

            // playing with new templates that uses icons instead of inputs...
            templateUrl: 'directives/checkbox-facet.html'
        };
    }])


    /**
     * A directive for plain Checkbox facets.
     * @param bucket the instance of Filter object from the FilterService; this is likely in an ng-repeat thing like ng-repeat="bucket in filters"
     */
    .directive('cttvParentCheckboxFacet', [function () {
        'use strict';

        return {

            restrict: 'AE',

            scope: {
                bucket: '=',
                collapsed: '='// ,
                // partial: '@'
            },

            templateUrl: 'directives/parent-checkbox-facet.html'

        };
    }])


    /**
    * A directive for Checkbox facet with nested facets.
    */
    .directive('cttvUiIndeterminate', [function () {
        'use strict';

        return {

            restrict: 'AE',

            link: function (scope, elem, attrs) {
                if (!attrs.type || attrs.type.toLowerCase() !== 'checkbox') {
                    return angular.noop;
                }

                scope.$watch(attrs.cttvUiIndeterminate, function (newVal) {
                    elem[0].indeterminate = !!newVal;
                });
            }
        };
    }]);

