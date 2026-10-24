import { defineConfig, globalIgnores } from 'eslint/config'
import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTs from 'eslint-config-next/typescript'

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  // `public/` only holds vendored, minified third-party code (the Draco decoder).
  globalIgnores([
    '.next/**',
    '.next-build/**',
    'node_modules/**',
    'next-env.d.ts',
    'public/**',
    'AETHR_ONE_FINAL_MASTER_PACKAGE/**',
    'graphify-out/**',
    'scripts/**',
  ]),
  {
    rules: {
      // R3F uses many lowercase intrinsic elements and mutation-in-frame patterns.
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      // React Compiler diagnostics, enabled by eslint-config-next 16. This app does
      // not use the compiler, and the scene deliberately mutates three.js objects and
      // writes scroll-driven styles straight to the DOM outside React's render cycle.
      'react-hooks/immutability': 'off',
      'react-hooks/refs': 'off',
      'react-hooks/purity': 'off',
      'react-hooks/use-memo': 'off',
      'react-hooks/set-state-in-effect': 'off',
    },
  },
])
