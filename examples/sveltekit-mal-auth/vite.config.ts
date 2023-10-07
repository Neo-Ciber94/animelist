import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import dotenv from 'dotenv';
dotenv.config();

export default defineConfig({
	plugins: [sveltekit(), nodePolyfills()],
	server: {
		port: 3000
	},
	test: {
		include: ['src/**/*.{test,spec}.{js,ts}']
	},
	define: {
		'process.versions': JSON.stringify(process.versions)
	}
});
