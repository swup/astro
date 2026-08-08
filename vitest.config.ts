import { defineConfig } from 'vitest/config';

export default defineConfig({
	test: {
		include: ['test/**/*.test.ts'],
		// Fixture builds shell out to Astro and are slow
		testTimeout: 60_000
	}
});
