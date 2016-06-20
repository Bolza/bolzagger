# Bolzagger

Small library to test frontend calls toward an API against a [Swagger](http://swagger.io/) specifications without ever call the real backend. If you use [Angular](http://angular.io/) you can use `mockBackend` and let this library intercept the actual request. 

I developed this helper with Angular1/Angular2 in mind but it's actually library-agnostic.

###Things you can do with this library

- Get the swagger definition for a certain endpoint from the url
- Check that a certain method exist for that endpoint
- Check that each param passed to the endpoint is valid and defined
- Return the example response for that endpoint if exists.

###Usage Example

```typescript
// provide the specs in your test config, here i'm using karma_fixtures
const API_SPECS = __fixtures__["/api.swagger"]
let bolzagger, mockResponse
//Parsing happens asyncronously so keep this in mind during the setup
beforeEach( (done) => {
    let parser = new SwaggerParser();
    parser.dereference(API_SPECS).then(parsedSpecs => {
        bolzagger = new Bolzagger(parsedSpecs)
        done()
    });
})
let mockResponse = (resp) => {
    mockbackend.connections.subscribe(connection => {
        let url = connection.request.url
        let endpoint = bolzagger.getEndpointFromUrl(url)
        let params = bolzagger.getParametersFromUrl(url)
        let endpointSpecs = bolzagger.getSpecsForRequest('GET', url)
        let allParamsOk = bolzagger.parametersAreOk(endpointSpecs, params)
        let response = bolzagger.getResponseJSON('GET', url, 200)

        if (!endpoint || !allParamsOk || !response) throw new Error(url, 'not Valid!');        
        let r = { _body: response }
        connection.mockRespond(r)
    });
}
```

### Api

#### Utility

##### parseParamsString(`url`)

##### getEndpointFromUrl(`url`)

##### validateMethod(`method` || `url`)

##### getParametersFromUrl(`url`)

##### getEndpointSpecs(`method`, `url`)

##### validateParameters(`espec`, `params`)

#### Request Validation

##### parametersAreOk(`method`, `url`)

##### requestIsOk(`method`, `url`)

#### Response Validation

##### getResponseJSON(`method`, `url`, `statusCode`)




