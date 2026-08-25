module.exports = {
  preset: '@react-native/jest-preset',
  // The default preset only transforms `react-native` + `@react-native/*`.
  // A few of this app's dependencies ship ES module builds that Jest (via
  // Babel/CommonJS) can't `require()` as-is, so they need transforming too —
  // otherwise any test that imports something which transitively pulls in
  // `@react-navigation/*` fails with a bare "Unexpected token 'export'"/
  // "Cannot use import statement outside a module" before a single
  // assertion runs.
  transformIgnorePatterns: [
    'node_modules/(?!(' +
      ['react-native', '@react-native(-community)?', '@react-navigation', 'react-native-.*'].join('|') +
      ')/)',
  ],
};
