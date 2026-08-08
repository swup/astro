import { execFileSync } from 'node:child_process';
import { readFile, readdir, rm } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { beforeAll, describe, expect, it } from 'vitest';

import swup from '../src/index.js';

const root = new URL('./fixtures/basic/', import.meta.url);
const outDir = new URL('./dist/', root);

/**
 * Canary for Astro's integration contract: proves `injectScript('page', …)` still reaches
 * every built page. Config coverage lives in script.test.ts — keep this test shallow.
 */
describe('fixture build', () => {
	let pages: Record<string, string> = {};
	let entry = '';

	/** Asserts against the bundle without dumping ~100kB of minified output on failure. */
	const bundleMatches = (pattern: RegExp) => expect(pattern.test(entry), String(pattern));

	beforeAll(async () => {
		// The injected script imports @swup/astro/client/*, which resolves to dist/
		execFileSync('npm', ['run', 'build'], { cwd: fileURLToPath(new URL('../', import.meta.url)) });
		await rm(outDir, { recursive: true, force: true });

		const { build } = await import('astro');
		await build({
			root: fileURLToPath(root),
			outDir: fileURLToPath(outDir),
			integrations: [swup({ globalInstance: true })],
			logLevel: 'error'
		});

		pages = Object.fromEntries(
			await Promise.all(
				['index.html', 'about/index.html'].map(async (page) => [
					page,
					await readFile(new URL(page, outDir), 'utf-8')
				])
			)
		);
		entry = await readInitBundle();
	});

	it('emits a script tag on every page', () => {
		for (const [page, html] of Object.entries(pages)) {
			expect(html, page).toMatch(/<script type="module" src="[^"]+"><\/script>/);
		}
	});

	it('bundles the swup init code', () => {
		bundleMatches(/data-no-swup/).toBe(true);
		bundleMatches(/astro:before-swap/).toBe(true);
		bundleMatches(/astro:after-swap/).toBe(true);
		bundleMatches(/astro:page-load/).toBe(true);
	});

	it('applies the integration options', () => {
		bundleMatches(/window\.swup\s*=/).toBe(true);
	});

	it('code-splits each plugin into its own chunk', () => {
		bundleMatches(/import\(.\.\/SwupFadeTheme\..*?\.js.\)/).toBe(true);
	});

	it('leaves page markup untouched', () => {
		expect(pages['index.html']).toContain('<h1>Home</h1>');
		expect(pages['index.html']).toContain('data-no-swup');
	});
});

/** The bundle holding the injected init script, identified by our Astro lifecycle shim. */
async function readInitBundle(): Promise<string> {
	const dir = new URL('_astro/', outDir);
	const files = (await readdir(dir)).filter((file) => file.endsWith('.js'));
	const contents = await Promise.all(files.map((file) => readFile(new URL(file, dir), 'utf-8')));
	const entry = contents.find((source) => source.includes('astro:page-load'));
	if (!entry) throw new Error('Injected swup init script not found in build output');
	return entry;
}
