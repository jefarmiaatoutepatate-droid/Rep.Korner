/** Config ESLint — base Expo (SDK 51). */
module.exports = {
  extends: 'expo',
  ignorePatterns: ['dist/', 'node_modules/', 'backend/', 'scripts/'],
  rules: {
    // Le projet utilise des styles inline centralisés sur la palette (voir README).
    'react-native/no-inline-styles': 'off',
  },
  overrides: [
    {
      // Fichiers de config exécutés par Node (CommonJS, __dirname…).
      files: ['*.config.js', '.eslintrc.js'],
      env: { node: true },
    },
    {
      // Service worker : globals dédiés (self, caches, Response…).
      files: ['public/sw.js'],
      env: { serviceworker: true, browser: true },
    },
  ],
};
