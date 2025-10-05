module.exports = {
    env: {
        browser: true,
        es2021: true,
        node: true,
        mocha: true
    },
    extends: [
        'eslint:recommended'
    ],
    parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'script'
    },
    globals: {
        'CO2App': 'writable',
        'TableSort': 'writable', 
        'FilterManager': 'writable',
        'setDirection': 'writable',
        'bootstrap': 'readonly'
    },
    rules: {
        'no-eval': 'error',
        'no-implied-eval': 'error',
        'no-new-func': 'error',
        'no-script-url': 'error',
        
        'no-unused-vars': ['warn', { 'argsIgnorePattern': '^_' }],
        'no-console': 'off',
        'prefer-const': 'warn',
        'no-var': 'warn',
        
        'indent': ['warn', 4],
        'quotes': ['warn', 'single'],
        'semi': ['warn', 'always'],
        'comma-dangle': ['warn', 'never'],
        
        'eqeqeq': 'warn',
        'no-magic-numbers': 'off',
        'consistent-return': 'warn',
        'default-case': 'warn',
        'dot-notation': 'warn',
        'no-alert': 'warn',
        'no-caller': 'error',
        'no-else-return': 'warn',
        'no-empty-function': 'warn',
        'no-floating-decimal': 'warn',
        'no-implicit-globals': 'error',
        'no-loop-func': 'warn',
        'no-multi-spaces': 'warn',
        'no-new': 'warn',
        'no-param-reassign': 'warn',
        'no-return-assign': 'warn',
        'no-self-compare': 'error',
        'no-sequences': 'error',
        'no-throw-literal': 'error',
        'no-unused-expressions': 'warn',
        'no-useless-call': 'warn',
        'no-useless-concat': 'warn',
        'no-useless-return': 'warn',
        'prefer-arrow-callback': 'warn',
        'radix': 'warn',
        'wrap-iife': ['warn', 'outside'],
        'yoda': 'warn'
    },
    ignorePatterns: [
        'node_modules/',
        'dist/',
        'coverage/',
        '*.min.js'
    ]
}; 