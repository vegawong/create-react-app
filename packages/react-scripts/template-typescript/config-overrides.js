const path = require('path')

module.exports = function override(config, env) {
    // do stuff with the webpack config...
    config.resolve.modules.push(path.join(__dirname, 'src'))
    return config
}

