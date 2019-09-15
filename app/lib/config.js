
//Container for all the environment
var environments = {};

//Staging (default) env
environments.staging = {
    'httpPort' : '3000',
    'httpsPort' : '3001',
    'envName' : 'staging',
    'hashingSecret' : 'thisIsASecret'
};

//Production env
environments.production = {
    'httpPort' : '5000',
    'httpsPort' : '5001',
    'envName' : 'production',
    'hashingSecret' : 'thisIsAlsoASecret'
}

//determine which env was passed as cli argument
var currentEnvironment = typeof(process.env.NODE_ENV) == 'string' ? process.env.NODE_ENV.toLowerCase() : '';

//if env specified in cli defined as an object then pass it, else make staging the default env
var environmentToExport = typeof(environments[currentEnvironment]) == 'object' ? environments[currentEnvironment] : environments.staging;

///export onle the specified env
module.exports = environmentToExport;           //now improve the index.js accordingly