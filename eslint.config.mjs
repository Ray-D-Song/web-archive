import antfu from '@antfu/eslint-config'

export default antfu({
  react: true,
  ignores: [
    '**/lib',
    '**/extension',
    'packages/shared/components/*.tsx',
    'packages/web/src/router.ts',
  ],
  typescript: {
    parserOptions: {
      project: 'tsconfig.root.json',
    },
  },
}, {
  rules: {
    'no-console': 'off',
    'no-unused-vars': 'off',
    'react-hooks/rules-of-hooks': 'warn',
    'unused-imports/no-unused-vars': 'warn',
    'ts/consistent-type-definitions': 'off',
    'eslint-comments/no-unlimited-disable': 'off',
    'only-export-components': 'off',
    'react-refresh/only-export-components': 'off',
    'ts/ban-types': 'off',
    'react-dom/no-unsafe-iframe-sandbox': 'off',
    'no-alert': 'off',
  },
})
