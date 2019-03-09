const path = require('path')
const { override } = require('customize-cra')

// you can add any feature from custome-cra if you need
// like:
// module.exports = override(disableEsLint(), ...addBabelPlugins(
//     "polished",
//     "emotion",
//     "babel-plugin-transform-do-expressions"
//   ),(config, env) => {
//     // do stuff with the webpack config...
//     // additional here
//     config.resolve.modules.push(path.join(__dirname, 'src'))
//     return config
// })

module.exports = override((config, env) => {
    // do stuff with the webpack config...
    // additional here
    config.resolve.modules.push(path.join(__dirname, 'src'))
    return config
})

