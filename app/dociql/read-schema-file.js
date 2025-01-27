const { getIntrospectionQuery, buildSchema, graphqlSync } = require('graphql')
const fs = require('fs')
const converter = require('graphql-2-json-schema');

module.exports = function (schemaPath) {
    if (!schemaPath) return {}

    const schemaSDL = fs.readFileSync(schemaPath, 'utf8')
    const graphQLSchema = buildSchema(schemaSDL);
    const introspectionResponse = graphqlSync(graphQLSchema, getIntrospectionQuery())
    const jsonSchema = converter.fromIntrospectionQuery(introspectionResponse.data);

    return {
        jsonSchema,
        graphQLSchema
    }
}
