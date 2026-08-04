import js from '@eslint/js'
import globals from 'globals'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs['recommended-latest'],
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    rules: {
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }],
    },
  },
  {
    // Sem jsx-uses-vars, o no-unused-vars do ESLint core não entende JSX: um
    // import minúsculo usado apenas como <motion.div> é reportado como não
    // usado. Era a causa de TODOS os 8 erros de baseline do projeto — todos em
    // arquivos que importam `motion` de 'motion/react'.
    // Habilitada só essa regra, não o preset recomendado do plugin, que
    // acrescentaria uma leva de erros novos em código legado.
    files: ['**/*.jsx'],
    plugins: { react },
    rules: {
      'react/jsx-uses-vars': 'error',
    },
  },
  {
    // Arquivos de contexto exportam o Provider (componente) e o hook de
    // consumo juntos — padrão que o projeto já usava no LanguageContext e que
    // o NoiseOS repete no WindowManagerContext e no ThemeContext.
    // O custo dessa co-localização é só de fast-refresh (editar o arquivo faz
    // reload completo em vez de hot-swap), não de correção. Manter a regra
    // ligada aqui só ensinaria a ignorar a saída do lint.
    files: ['**/*Context.jsx'],
    rules: {
      'react-refresh/only-export-components': 'off',
    },
  },
])
