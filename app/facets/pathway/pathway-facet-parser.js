angular.module('facets')

    .factory('pathwayFacetParser', ['$log', 'cttvDictionary', 'cttvConsts', function ($log, cttvDictionary, cttvConsts) {
        'use strict';


        var parser = {};

        /**
         * Parse function
         * Every FacetParser *must* expose a parse() function.
         * The function essentially maps and returns the filters (values) for a specific collection
         * (i.e. a facet, like the datatype facet or score distribution facet).
         *
         * Parser function must take the following parameters:
         *     config [Object] config object for the collection; contains key and options object
         *     data [Object] the data object for this facet (from the API)
         *     countsToUse [String] e.g. "unique_disease_count"
         *     isSelected [Function] this is the FiltersService.isSelected(). The problem is we cannot reference the FiltersService here (circular dependency)
         *
         * It returns an Array of filters.
         */
        parser.parse = function (config, data, countsToUse, isSelected) {

            // array of filters
            config.filters = data.buckets.map(function (obj) {
                var conf = {};
                conf.key = obj.key;
                conf.label = obj.label;
                conf.count = obj[countsToUse].value;
                conf.selected = isSelected(config.key, obj.key);
                conf.facet = config.key;
                conf.collection = null;
                if (obj.pathway) {
                    conf.collection = {
                        filters: parser.parse(/* cttvConsts.PATHWAY*/ {key: 'pathway'}, obj.pathway, countsToUse, isSelected).filters
                    };
                }
                return conf;
            });

            return config;
        };

        return parser;
    }]);

