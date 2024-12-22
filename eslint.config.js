import neostandard from 'neostandard'

export default [
  ...neostandard(),
  {
    rules: {
      'no-use-before-define': ['error', {
        functions: false,
        classes: false,
        variables: true,
        allowNamedExports: true
      }],
      'no-labels': 'off',
      'no-unused-vars': 'warn'
    }
  }
]
