# Bolzwagger

Small helper to test Frontend calls to an api against [Swagger](http://swagger.io/) specifications

- `npm install swagger-parser --save-dev`

I developed this helper with Angular2 in mind but it's completely library-agnostic.

It does require [Swagger Parser](https://github.com/swagger-api/swagger-parser) to parse the specs file (in JSON or YAML format) and resolve the references.

###Things you can do with this library

- Get the swagger definition for a certain endpoint from the urlp
- Check that a certain method exist for that endpoint
- Check that each param passed to the endpoint is valid and defined
- Return the example response for that endpoint if exists.

###Usage Example

```typescript
// provide the specs in your test config, here i'm using karma_fixtures
const API_SPECS = __fixtures__["/api.swagger"]
let bolzwagger, mockResponse
//Parsing happens asyncronously so keep this in mind during the setup
beforeEach( (done) => {
    let parser = new SwaggerParser();
    parser.dereference(API_SPECS).then(parsedSpecs => {
        bolzwagger = new Bolzwagger(parsedSpecs)
        done()
    });
})
let mockResponse = (resp) => {
    mockbackend.connections.subscribe(connection => {
        let url = connection.request.url
        let endpoint = bolzwagger.getEndpointFromUrl(url)
        let params = bolzwagger.getParametersFromUrl(url)
        let endpointSpecs = bolzwagger.getSpecsForRequest('GET', url)
        let allParamsOk = bolzwagger.parametersAreOk(endpointSpecs, params)
        let response = bolzwagger.getResponseJSON('GET', url, 200)

        if (!endpoint || !allParamsOk || !response) throw new Error(url, 'not Valid!');        
        let r = { _body: response }
        connection.mockRespond(r)
    });
}
```

###Methods

##### getEndpointFromUrl(`url`)

##### getParametersFromUrl(`url`)

##### getSpecsForRequest(`method`, `url`)

##### parametersAreOk(`endpointSpecs`, `params`)

##### getResponseJSON(`method`, `url`, `statusCode`)

