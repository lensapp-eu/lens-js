import { config } from '@ultimatelemon-eu/eslint-config/base';
import globals from 'globals';

export default config({
  typeChecked: false,
  extra: [
    {
      files: ['lens.js'],
      languageOptions: {
        sourceType: 'script',
        globals: { ...globals.node, ...globals.browser }
      },
      rules: {
        // UMD file: http/https are required lazily so it also loads in browsers.
        '@typescript-eslint/no-require-imports': 'off'
      }
    }
  ]
});
