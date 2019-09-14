
//Container for all the environment
var environments = {};

//Staging (default) env
environments.staging = {
    'port' : '3000',
    'envName' : 'staging'
};

//Production env
environments.production = {
    'port' : '5000',
    'envName' : 'production'
}

//determine whicch env was passed as cli argument
var currentEnvironment = typeof(process.env.NODE_ENV) == 'string' ? process.env.NODE_ENV.toLowerCase() : '';

//if env specified in cli defined as an object then pass it, else make staging the default env
var environmentToExport = typeof(environments[currentEnvironment]) == 'object' ? environments[currentEnvironment] : environments.staging;

///export onle the specified env
module.exports = environmentToExport;           //now improve the index.js accordingly