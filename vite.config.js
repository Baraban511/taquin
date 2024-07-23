import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { version } from './package.json'

export default defineConfig({
	plugins: [sveltekit()],
	define: {
		'process.env.VERSION': JSON.stringify(version),
	  },
});