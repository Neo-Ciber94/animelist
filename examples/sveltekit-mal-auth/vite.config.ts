import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';
import { loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
	const env = loadEnv(mode, process.cwd(), '');

	return {
		plugins: [sveltekit()],
		test: {
			include: ['src/**/*.{test,spec}.{js,ts}']
		},
		define: {
			'process.env.MY_ANIME_LIST_CLIENT_ID': JSON.stringify(env.MY_ANIME_LIST_CLIENT_ID),
			'process.env.MY_ANIME_LIST_CLIENT_SECRET': JSON.stringify(env.MY_ANIME_LIST_CLIENT_SECRET),
		}
	}
});
