const yaml = require('js-yaml')
const url = require('url')
const fs = require("fs")

const fetchSchema = require("./fetch-schema")
const readSchema  = require("./read-schema-file")
const composePaths = require("./compose-paths")

const obtainSchema = (spec, headers, graphUrl, schemaPath) => {
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

    const {graphQLSchema, jsonSchema} = obtainSchema(spec, headers, graphUrl, schemaPath)

    // generate specification
    const swaggerSpec = {
        openapi: '3.0.0',
        info: spec.info,
        servers: spec.servers,
        externalDocs: spec.externalDocs,
        securityDefinitions: spec.securityDefinitions,
        definitions: jsonSchema.definitions
    }

    if (spec.domains) {
        Object.assign(swaggerSpec, {
            tags: spec.domains.map(_ => ({
                name: _.name,
                description: _.description,
                externalDocs: _.externalDocs
            })),
            paths: composePaths(spec.domains, graphQLSchema),

        })
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