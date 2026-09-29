import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { FlatCompat } from '@eslint/eslintrc'

const compat = new FlatCompat({ baseDirectory: dirname(fileURLToPath(import.meta.url)) })

const config = [
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
  {
    // `public/` only holds vendored, minified third-party code (the Draco decoder).
    ignores: [
      '.next/**',
      '.next-build/**',
      'node_modules/**',
      'next-env.d.ts',
      'public/**',
      'AETHR_ONE_FINAL_MASTER_PACKAGE/**',
      'graphify-out/**',
      'scripts/**',
    ],
  },
  {
    rules: {
      // R3F uses many lowercase intrinsic elements and mutation-in-frame patterns.
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
    },
  },
]

export default config
