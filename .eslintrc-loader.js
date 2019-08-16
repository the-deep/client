const eslintrc = require('./.eslintrc.js');

eslintrcLoader = {
    ...eslintrc,
    rules: {
        ...eslintrc.rules,
        // Disable on js build
        'css-modules/no-unused-class': 0,
        'css-modules/no-undef-class': 0,
    },
};

module.exports = eslintrcLoader;
