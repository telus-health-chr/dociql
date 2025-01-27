var Handlebars = require('handlebars')

module.exports = function (value, options) {
    if (!options.data.root.servers) {
        return
    }

    const query = value.example;
    const variables = null 
        // value.schema 
        // ? JSON.stringify(Object.keys(value.schema.properties).reduce((cur, key) => {
        //     cur[key] = {}
        //     return cur
        // }, {})) 
        // : null

    const variablesQuery = variables ? `&variables=${encodeURIComponent(variables)}` : ""

    var url = `${options.data.root.servers[0].url}?query=${encodeURIComponent(query)}${variablesQuery}`;
    return new Handlebars.SafeString(`<a href="${url}" target="_blank">Try it now<a/>\n`);
}