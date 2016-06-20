interface Espec {
	parameters: Array<any>
	paths: Object
	basePath: string
	responses: Object
}

export class Bolzagger {
	private swaggerSpecs:Espec
	private endpointMatchers:Object

	constructor(ApiSpecs: Espec) {
		this.swaggerSpecs = ApiSpecs
		this.endpointMatchers = {}
		let matcher = new RegExp('({.+})', 'gi');
		for (let path in ApiSpecs.paths) {
			let endpointMatch = path.replace(matcher, '({.+})')
			this.endpointMatchers[endpointMatch] = ApiSpecs.paths[path]
		}
	}

	// Utility Methods
	/**
	* Takes a param string and parse it into an object of params
	* @param {string} str is the part of the url string containing params in the form `?p1=v1&p2=v2&...`
	* @return {object} this is the returned object containing `{p1: v1, p2: v2, ...}`
	*/
	parseParamsString(paramsStr:string) {
		if (!paramsStr) return null
		paramsStr = paramsStr.replace('?', '')
		return paramsStr.split('&').reduce(function(params, param) {
			var paramSplit = param.split('=').map(function(value) {
				return decodeURIComponent(value.replace('+', ' '));
			});
			params[paramSplit[0]] = paramSplit[1];
			return params;
		}, {});
	}

	getEndpointFromUrl(url:string) {
		url = url.split('?')[0]
		url = url.split(';')[0]
		return url.replace(this.swaggerSpecs.basePath, '')
	}

	validateMethod(rawMethod:any) {
		if (typeof rawMethod === `string`) return rawMethod.toLowerCase()
		if (typeof rawMethod === `number`) return ['get', 'post', 'put', 'delete', 'patch', 'head'][rawMethod]
		throw new Error('Bolzagger.getMethodFromEnum: method must be number or string')
	}

	/**
	* Takes the whole url and returns just the part containing the params 
	* @param {string} url is the url string in the form `http://domain.com/page?p1=v1&p2=v2&...`
	* @return {string} this is the returned string containing `p1=v1&p2=v2&...`
	*/
	getParametersFromUrl(url:string) {
		url = url.split('?')[1]
		return this.parseParamsString(url)
	}

	getEndpointSpecs(method:any, url:string) {
		method = this.validateMethod(method)
		url = this.getEndpointFromUrl(url)
		for (let match in this.endpointMatchers) {
			if (new RegExp(match).test(url)) {
				return this.endpointMatchers[match][method]
			}
		}
		return null
	}

	/**
	* Creates a validation-map for all passed parameters checked against a certain ESPEC
	*     { 
	*		paramName1: true, //valid param,
	*		paramName2: false //invalid param,
	*	 }
	*
	* @param {object} endpointSpecs single Swagger Spec for a specific METHOD of a specific ENDPOINT,
	*     can be obtained using `.getEndpointSpecs(<method>,<url>)`
	*
	* @param {object} parameter parameters sent to the endpoint method in a `{key:value}` format
	*    can be obtained using `.getParametersFromUrl(<url>)`
	* 
	*/
	validateParameters(espec:Espec, testParams:Object) {
		let validMap = {}
		for (let testedName in testParams) {
			let found = espec.parameters.filter(specParamName => testedName === specParamName)
			validMap[testedName] = !!found
		}
		return validMap
	}

	// Methods for the validation of a request 

	/**
	* Takes the request and returns `true` if all the parameters are valid in the Endpoint-SPECS
	* @param {string|int} method is the request method eg: `GET` or `1`
	* @param {string} url is the url string in the form `http://domain.com/page?p1=v1&p2=v2&...`
	* @return {boolean} this is true if all the parameters present in the url are valid in the Endpoint-SPECS
	*/
	parametersAreOk(method:any, url:string) {
		let espec:Espec = this.getEndpointSpecs(method, url)
		let testParams = this.getParametersFromUrl(url)
		let validation = this.validateParameters(espec, testParams)
		for (let v in validation) {
			if (!validation[v]) return false
		}
		return true
	}

	/**
	* Takes the request and returns `true` if method/endpoint is valid and exists in the Endpoint-SPECS
	* @param {string|int} method is the request method eg: `GET` or `1`
	* @param {string} url is the url string in the form `http://domain.com/page?p1=v1&p2=v2&...`
	* @return {boolean} this is true if all the request is valid in the Endpoint-SPECS
	*/
	requestIsOk(method:any, url:string) {
		let specs:Espec = this.getEndpointSpecs(method, url)
		return (specs)
	}


	getResponseJSON(method:any, url:string, statusCode:number) {
		let specs:Espec = this.getEndpointSpecs(method, url)
		let success = specs.responses[statusCode || 'default'].examples['application/json']
		return success.replace(/[\r\n]/g, '');
	}
}