'use strict';

angular.module('chartmetricApp')
.constant("baseURL", "https://api.chartmetric.io/api/")
.factory('artistFactory', ['$resource', 'baseURL', function ($resource, baseURL) {
