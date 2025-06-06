module.exports = {
	extends: [
		'eslint:recommended',
		'@typescript-eslint/recommended',
		'airbnb-base',
		'plugin:react/recommended',
		'plugin:react-hooks/recommended',
		'plugin:jsx-a11y/recommended',
		'plugin:import/recommended',
		'plugin:import/typescript',
		'plugin:promise/recommended',
		'plugin:compat/recommended'
	],
	plugins: ['@typescript-eslint', 'react', 'react-hooks', 'jsx-a11y', 'import', 'promise', 'compat'],
	// Ignore shadcn/ui components
	ignorePatterns: ['**/components/ui/**', '**/renderer/lib/**'],
	rules: {
		// A temporary hack related to IDE not resolving correct package.json
		// 'import/no-extraneous-dependencies': 'off',
		'react/react-in-jsx-scope': 'off',
		'react/jsx-filename-extension': 'off',
		'import/extensions': 'off',
		'import/no-unresolved': 'off',
		'import/no-import-module-exports': 'off',
		'no-shadow': 'off',
		'@typescript-eslint/no-shadow': 'error',
		'no-unused-vars': 'off',

		// Added in Electron-Hotplate
		'@typescript-eslint/no-unused-vars': [
			'warn',
			{
				vars: 'all',
				varsIgnorePattern: '^_',
				args: 'after-used',
				argsIgnorePattern: '^_',
			},
		],
		'consistent-return': 'off',
		'import/prefer-default-export': 'off',
		'promise/always-return': 'off',
		'react/jsx-props-no-spreading': 'off',
		'react/jsx-no-useless-fragment': 'off',
		'react/prop-types': 'off',
		'react/require-default-props': 'off',
	},
	parserOptions: {
		ecmaVersion: 2022,
		sourceType: 'module',
		ecmaFeatures: {
			jsx: true,
		},
	},
	env: {
		browser: true,
		node: true,
		es2022: true,
	},
	settings: {
		react: {
			version: 'detect',
		},
		'import/resolver': {
			// See https://github.com/benmosher/eslint-plugin-import/issues/1396#issuecomment-575727774 for line below
			node: {
				extensions: ['.js', '.jsx', '.ts', '.tsx'],
				moduleDirectory: ['node_modules', 'src/'],
			},
			webpack: {
				config: require.resolve('./config/webpack.config.eslint.ts'),
			},
			typescript: {},
		},
		'import/parsers': {
			'@typescript-eslint/parser': ['.ts', '.tsx'],
		},
	},
};
