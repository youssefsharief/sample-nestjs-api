const path = require('path');
const wallabyWebpack = require('wallaby-webpack');

module.exports = function(wallaby) {
    const dotenv = require('dotenv');
    dotenv.config();

    let webpackPostprocessor = wallabyWebpack({
        resolve: {
            modules: [path.join(wallaby.projectCacheDir, 'src')],
        },
    });

    return {
        files: ['src/**/*.ts'],

        tests: ['test/unit-tests/**/*.spec.ts'],
        compilers: {
            '**/*.ts': wallaby.compilers.typeScript({
                module: 'commonjs',
                useStandardDefaults: true,
                isolatedModules: true,
            }),
        },
        postprocessor: webpackPostprocessor,
        env: {
            type: 'node',
        },
        testFramework: 'jest',
        setup: () => {
            require('dotenv').config();
        },
    };
};
