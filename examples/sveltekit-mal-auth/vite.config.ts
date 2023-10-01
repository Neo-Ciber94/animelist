import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';
import dotenv from 'dotenv';

const defineProcessEnv = () => {
	dotenv.config();
	const definedEnvs = Object.fromEntries(
		Object
			.entries(process.env || {})
			.map(([key, value]) => ([`process.env.${key}`, JSON.stringify(value)]))
	);

	return definedEnvs;
}

export default defineConfig({
	plugins: [sveltekit()],
	test: {
		include: ['src/**/*.{test,spec}.{js,ts}']
	},
	define: defineProcessEnv()
});
