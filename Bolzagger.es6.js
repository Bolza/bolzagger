export class Bolzagger {
	constructor(ApiSpecs) {
		this.swaggerSpecs = ApiSpecs
		this.endpointMatchers = {}
		let matcher = new RegExp('({.+})', 'gi');
		for (let path in ApiSpecs.paths) {
			let endpointMatch = path.replace(matcher, '({.+})')
			this.endpointMatchers[endpointMatch] = ApiSpecs.paths[path]
		}
	}
	parseParamsString(str) {
		if (!str) return null
		str = str.replace('?', '')
		return str.split('&').reduce(function(params, param) {
			var paramSplit = param.split('=').map(function(value) {
				return decodeURIComponent(value.replace('+', ' '));
			});
			params[paramSplit[0]] = paramSplit[1];
			return params;
		}, {});
	}
	getEndpointFromUrl(url) {
		url = url.split('?')[0]
		url = url.split(';')[0]
		return url.replace(this.swaggerSpecs.basePath, '')
	}
	getParametersFromUrl(url) {
		url = url.split('?')[1]
		return this.parseParamsString(url)
	}
	getSpecsForRequest(method, url) {
		method = method.toLowerCase()
		url = this.getEndpointFromUrl(url)
		for (let match in this.endpointMatchers) {
			if (new RegExp(match).test(url)) {
				return this.endpointMatchers[match][method]
			}
		}
		return null
	}

	/**
	* @param endpointSpec:<object> single Swagger Spec for a specific METHOD of a specific ENDPOINT,
	*     can be obtained using `.getSpecsForRequest(<method>,<url>)`
	*
	* @param parameter:<object> parameters sent to the endpoint method in a `{key:value}` format
	*    can be obtained using `.getParametersFromUrl(<url>)`
	*
	* 
	*/ 
	validateParameters(espec, testParams) {
		let validMap = {}
		for (let testedName in testParams) {
			let found = espec.parameters.filter(specParamName => testedName === specParamName)
			validMap[testedName] = !!found
		}
		return validMap
	}
	parametersAreOk(espec, testParams) {
		let validation = this.validateParameters(espec, testParams)
		for (let v in validation) {
			if (!validation[v]) return false
		}
		return true
	}

	requestIsOk(method, url) {
		let specs = this.getSpecsForRequest(method, url)
		let params = this.getParametersFromUrl(url)
		let paramsOk = this.parametersAreOk(specs, params)
		return (specs && paramsOk)
	}
	getResponseJSON(method, url, statusCode) {
		let specs = this.getSpecsForRequest(method, url)
		let success = specs.responses[statusCode || 'default'].examples['application/json']
		return success.replace(/[\r\n]/g, '');
	}
}