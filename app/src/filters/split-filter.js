angular.module('cttvFilters')
    .filter('split', function () {
        'use strict';

        return function (input, splitChar, splitIndex) {
        // do some bounds checking here to ensure it has that index
            return input.split(splitChar)[splitIndex];
        };
    });
