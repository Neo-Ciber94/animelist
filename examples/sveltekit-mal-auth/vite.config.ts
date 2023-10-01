import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';
//import { loadEnv } from 'vite';
import EnvironmentPlugin from 'vite-plugin-environment'

export default defineConfig({
	plugins: [
		sveltekit(),
		EnvironmentPlugin(['MY_ANIME_LIST_CLIENT_ID', 'MY_ANIME_LIST_CLIENT_SECRET'])
	],
	test: {
		include: ['src/**/*.{test,spec}.{js,ts}']
	}
});
