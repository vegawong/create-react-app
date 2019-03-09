// @ts-nocheck
module.exports = {
    ignoreFiles: ['**/*.md', '**/*.ts', '**/*.tsx', '**/*.js'],
    extends: ['stylelint-config-css-modules', 'stylelint-config-standard', 'stylelint-config-prettier'],
    rules: {
        'indentation': [4],
        'property-no-unknown': [true, { ignoreProperties: ['composes'] }]
    }
}

