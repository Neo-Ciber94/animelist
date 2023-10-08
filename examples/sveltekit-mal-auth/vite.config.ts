import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import dotenv from 'dotenv';
dotenv.config();

const defineProcessEnv = () => {
	const definedEnvs = Object.fromEntries(
		Object.entries(process.env || {}).map(([key, value]) => [
			`process.env.${key}`,
			JSON.stringify(value)
		])
	);

	return definedEnvs;
};

export default defineConfig({
	plugins: [sveltekit(), nodePolyfills()],
	server: {
		port: 3000
	},
	test: {
		include: ['src/**/*.{test,spec}.{js,ts}']
	},
	define: defineProcessEnv()
});
