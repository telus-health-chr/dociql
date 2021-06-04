const yaml = require('js-yaml')
const url = require('url')
const fs = require("fs")

const fetchSchema = require("./fetch-schema")
const readSchema  = require("./read-schema-file")
const composePaths = require("./compose-paths")

const obtainSchema = (spec, graphUrl, schemaPath, headers) => {
    if (graphUrl) {
        return fetchSchema(graphUrl, headers)
    }

    return readSchema(schemaPath)
}

module.exports = function(specPath, headers, introspectionUrl, schemaFilePath) {
    // read spec file content
    const fileContent = fs.readFileSync(specPath, "utf8")
    // deserialise
    const spec = yaml.safeLoad(fileContent)
    // fetch graphQL Schema, if given an introspection url use that over the value in
    // the spec
    const graphUrl = introspectionUrl ? introspectionUrl : spec.introspection
    const schemaPath = schemaFilePath ? schemaFilePath : spec.schema_path

    const {graphQLSchema, jsonSchema} = obtainSchema(spec, graphUrl, schemaPath, headers)

    // generate specification
    const swaggerSpec = {
        openapi: '3.0.0',
        info: spec.info,
        servers: spec.servers,
        externalDocs: spec.externalDocs,
        tags: spec.domains.map(_ => ({ 
            name: _.name, 
            description: _.description,
            externalDocs: _.externalDocs
        })),
        paths: composePaths(spec.domains, graphQLSchema),
        securityDefinitions: spec.securityDefinitions,
        definitions: jsonSchema.definitions
    }

    if (graphUrl) {
        // parse URL
        const parsedUrl = url.parse(graphUrl)

        Object.assign(swaggerSpec, {
            host: parsedUrl.host,
            schemes: [ parsedUrl.protocol.slice(0, -1) ],
            basePath: parsedUrl.pathname,
        })
    }

    return swaggerSpec
}