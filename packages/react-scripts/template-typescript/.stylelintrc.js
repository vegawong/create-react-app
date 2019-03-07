// @ts-nocheck
module.exports = {
    ignoreFiles: ['**/*.md', '**/*.ts', '**/*.tsx', '**/*.js'],
    extends: ['stylelint-config-css-modules', 'stylelint-config-standard'],
    rules: {
        'property-no-unknown': [true, { ignoreProperties: ['composes'] }]
    }
}
