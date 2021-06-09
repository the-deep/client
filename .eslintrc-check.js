const eslintrc = require('./.eslintrc.js');

eslintrcLoader = {
    ...eslintrc,
    rules: {
        ...eslintrc.rules,
        // Disable on check
        'import/no-unresolved': 0,
        'import/no-extraneous-dependencies': 0,
    },
};

module.exports = eslintrcLoader;
