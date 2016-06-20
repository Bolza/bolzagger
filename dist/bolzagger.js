"use strict";
var SwaggerParser = require("swagger-parser");
var Bolzagger = (function () {
    function Bolzagger(ApiSpecs) {
        console.log('SwaggerParser', SwaggerParser);
        this.swaggerSpecs = ApiSpecs;
        this.endpointMatchers = {};
        var matcher = new RegExp('({.+})', 'gi');
        for (var path in ApiSpecs.paths) {
            var endpointMatch = path.replace(matcher, '({.+})');
            this.endpointMatchers[endpointMatch] = ApiSpecs.paths[path];
        }
    }
    Bolzagger.prototype.parseParamsString = function (paramsStr) {
        if (!paramsStr)
            return null;
        paramsStr = paramsStr.replace('?', '');
        return paramsStr.split('&').reduce(function (params, param) {
            var paramSplit = param.split('=').map(function (value) {
                return decodeURIComponent(value.replace('+', ' '));
            });
            params[paramSplit[0]] = paramSplit[1];
            return params;
        }, {});
    };
    Bolzagger.prototype.getEndpointFromUrl = function (url) {
        url = url.split('?')[0];
        url = url.split(';')[0];
        return url.replace(this.swaggerSpecs.basePath, '');
    };
    Bolzagger.prototype.validateMethod = function (rawMethod) {
        if (typeof rawMethod === "string")
            return rawMethod.toLowerCase();
        if (typeof rawMethod === "number")
            return ['get', 'post', 'put', 'delete', 'patch', 'head'][rawMethod];
        throw new Error('Bolzagger.getMethodFromEnum: method must be number or string');
    };
    Bolzagger.prototype.getParametersFromUrl = function (url) {
        url = url.split('?')[1];
        return this.parseParamsString(url);
    };
    Bolzagger.prototype.getEndpointSpecs = function (method, url) {
        method = this.validateMethod(method);
        url = this.getEndpointFromUrl(url);
        for (var match in this.endpointMatchers) {
            if (new RegExp(match).test(url)) {
                return this.endpointMatchers[match][method];
            }
        }
        return null;
    };
    Bolzagger.prototype.validateParameters = function (espec, testParams) {
        var validMap = {};
        var _loop_1 = function(testedName) {
            var found = espec.parameters.filter(function (specParamName) { return testedName === specParamName; });
            validMap[testedName] = !!found;
        };
        for (var testedName in testParams) {
            _loop_1(testedName);
        }
        return validMap;
    };
    Bolzagger.prototype.parametersAreOk = function (method, url) {
        var espec = this.getEndpointSpecs(method, url);
        var testParams = this.getParametersFromUrl(url);
        var validation = this.validateParameters(espec, testParams);
        for (var v in validation) {
            if (!validation[v])
                return false;
        }
        return true;
    };
    Bolzagger.prototype.requestIsOk = function (method, url) {
        var specs = this.getEndpointSpecs(method, url);
        return (specs);
    };
    Bolzagger.prototype.getResponseJSON = function (method, url, statusCode) {
        var specs = this.getEndpointSpecs(method, url);
        var success = specs.responses[statusCode || 'default'].examples['application/json'];
        return success.replace(/[\r\n]/g, '');
    };
    return Bolzagger;
}());
exports.Bolzagger = Bolzagger;
