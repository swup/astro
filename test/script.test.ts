import { describe, expect, it } from 'vitest';

import { buildInitScript } from '../src/script.js';
import type { Options } from '../src/index.js';
import { assertParses, normalise, option, pluginOptions, plugins } from './helpers.js';

/** Every config exercised below, so the syntax check can cover all of them. */
const configs: Record<string, Partial<Options>> = {
	defaults: {},
	everything: {
		accessibility: true,
		animationClass: 'swup-',
		cache: true,
		containers: ['#main', '#nav'],
		debug: true,
		forms: true,
		fragments: [{ from: '/users/', to: '/users/:id', containers: ['#user'] }],
		globalInstance: true,
		ignore: ['/admin', /\.pdf$/i, '[data-raw]'],
		loadOnIdle: false,
		morph: ['#sidebar'],
		native: true,
		parallel: ['#main'],
		preload: { hover: true, visible: true },
		progress: true,
		reloadScripts: true,
		routes: [{ name: 'user', path: '/users/:id' }],
		smoothScrolling: true,
		theme: ['overlay', { direction: 'to-right' }] as Options['theme'],
		updateBodyClass: true,
		updateHead: { awaitAssets: false, persistAssets: true, persistTags: 'style' }
	},
	minimal: {
		accessibility: false,
		animationClass: false,
		cache: false,
		debug: false,
		forms: false,
		loadOnIdle: false,
		preload: false,
		progress: false,
		reloadScripts: false,
		routes: false,
		smoothScrolling: false,
		theme: false,
		updateBodyClass: false,
		updateHead: false
	},
	fnIgnore: { ignore: (url: string) => url.startsWith('/api') }
};

describe('emitted script', () => {
	it('is valid ES module syntax for every config', () => {
		for (const [name, config] of Object.entries(configs)) {
			expect(() => assertParses(buildInitScript(config)), name).not.toThrow();
		}
	});

	it('matches the golden reference for default options', async () => {
		await expect(normalise(buildInitScript())).toMatchFileSnapshot(
			'./snapshots/defaults.js'
		);
	});

	it('matches the golden reference with every feature enabled', async () => {
		await expect(normalise(buildInitScript(configs.everything))).toMatchFileSnapshot(
			'./snapshots/everything.js'
		);
	});
});

describe('plugins', () => {
	it('enables the documented default set', () => {
		expect(plugins(buildInitScript())).toEqual([
			'SwupA11yPlugin',
			'SwupPreloadPlugin',
			'SwupScrollPlugin',
			'SwupBodyClassPlugin',
			'SwupHeadPlugin',
			'SwupScriptsPlugin',
			'SwupFadeTheme'
		]);
	});

	it('drops every optional plugin when features are disabled', () => {
		expect(plugins(buildInitScript(configs.minimal))).toEqual([]);
	});

	it('passes fragment rules through to the fragment plugin', () => {
		const rules = [{ from: '/users/', to: '/users/:id', containers: ['#user'] }];
		const script = buildInitScript({ fragments: rules });
		expect(pluginOptions(script, 'SwupFragmentPlugin')).toEqual({ rules });
	});
});

describe('containers', () => {
	it('defaults to main', () => {
		expect(option(buildInitScript(), 'containers')).toBe('["main"]');
	});

	it('is forwarded verbatim', () => {
		expect(option(buildInitScript({ containers: ['#a', '#b'] }), 'containers')).toBe(
			'["#a","#b"]'
		);
	});

	it('supplies the first container as the theme main element', () => {
		const script = buildInitScript({ containers: ['#a', '#b'] });
		expect(pluginOptions(script, 'SwupFadeTheme')).toEqual({ mainElement: '#a' });
	});
});

describe('animationClass', () => {
	it('becomes an attribute-contains selector', () => {
		expect(option(buildInitScript(), 'animationSelector')).toBe('"[class*=\\"transition-\\"]"');
	});

	it('disables the selector entirely when false', () => {
		expect(option(buildInitScript({ animationClass: false }), 'animationSelector')).toBe('false');
	});
});

describe('preload', () => {
	it('enables hover preloading only, by default', () => {
		expect(pluginOptions(buildInitScript(), 'SwupPreloadPlugin')).toEqual({
			preloadHoveredLinks: true,
			preloadVisibleLinks: false
		});
	});

	it('accepts per-feature configuration', () => {
		const script = buildInitScript({ preload: { hover: false, visible: true } });
		expect(pluginOptions(script, 'SwupPreloadPlugin')).toEqual({
			preloadHoveredLinks: false,
			preloadVisibleLinks: true
		});
	});

	it('is removed when both features are off', () => {
		const script = buildInitScript({ preload: { hover: false, visible: false } });
		expect(plugins(script)).not.toContain('SwupPreloadPlugin');
	});

	// Preloading writes to the cache, so it cannot outlive it
	it('is removed when the cache is disabled', () => {
		const script = buildInitScript({ cache: false, preload: true });
		expect(plugins(script)).not.toContain('SwupPreloadPlugin');
		expect(option(script, 'cache')).toBe('false');
	});
});

describe('themes', () => {
	it.each([
		['fade', 'SwupFadeTheme'],
		['slide', 'SwupSlideTheme'],
		['overlay', 'SwupOverlayTheme']
	] as const)('mounts %s as %s', (theme, plugin) => {
		expect(plugins(buildInitScript({ theme }))).toContain(plugin);
	});

	it('merges options from the tuple form', () => {
		const script = buildInitScript({ theme: ['overlay', { direction: 'to-right' }] });
		expect(pluginOptions(script, 'SwupOverlayTheme')).toEqual({
			mainElement: 'main',
			direction: 'to-right'
		});
	});

	it('mounts no theme when false', () => {
		expect(plugins(buildInitScript({ theme: false })).filter((p) => p.endsWith('Theme'))).toEqual(
			[]
		);
	});
});

describe('routes', () => {
	it('enables path classes with an empty route list when true', () => {
		expect(pluginOptions(buildInitScript({ routes: true }), 'SwupRouteNamePlugin')).toEqual({
			routes: [],
			paths: true
		});
	});

	it('forwards named routes', () => {
		const routes = [{ name: 'user', path: '/users/:id' }];
		expect(pluginOptions(buildInitScript({ routes }), 'SwupRouteNamePlugin')).toEqual({
			routes,
			paths: true
		});
	});
});

describe('parallel and morph', () => {
	it('applies parallel animations to all containers when true', () => {
		expect(pluginOptions(buildInitScript({ parallel: true }), 'SwupParallelPlugin')).toEqual({
			containers: []
		});
	});

	it('scopes parallel animations to the given containers', () => {
		const script = buildInitScript({ parallel: ['#main'] });
		expect(pluginOptions(script, 'SwupParallelPlugin')).toEqual({ containers: ['#main'] });
	});

	it('ignores an empty morph container list', () => {
		expect(plugins(buildInitScript({ morph: [] }))).not.toContain('SwupMorphPlugin');
	});
});

describe('updateHead', () => {
	it('awaits assets by default', () => {
		expect(pluginOptions(buildInitScript(), 'SwupHeadPlugin')).toEqual({
			awaitAssets: true,
			persistAssets: false,
			persistTags: false
		});
	});

	it('fills in defaults for a partial object', () => {
		const script = buildInitScript({ updateHead: { persistTags: 'style' } });
		expect(pluginOptions(script, 'SwupHeadPlugin')).toEqual({
			awaitAssets: true,
			persistAssets: false,
			persistTags: 'style'
		});
	});
});

describe('loadOnIdle', () => {
	it('imports swup dynamically and defers init', () => {
		const script = buildInitScript({ loadOnIdle: true });
		expect(script).toContain(`import { onIdleAfterLoad } from '@swup/astro/idle'`);
		expect(script).toContain(`import('@swup/astro/client/Swup')`);
		expect(script).toContain('onIdleAfterLoad(initSwup)');
	});

	it('imports swup statically and inits immediately', () => {
		const script = buildInitScript({ loadOnIdle: false });
		expect(script).toContain(`import Swup from '@swup/astro/client/Swup'`);
		expect(script).not.toContain('onIdleAfterLoad');
		expect(normalise(script)).toContain('initSwup();');
	});

	// Bundlers must resolve every plugin through our own package, not the user's tree
	it('imports plugins from @swup/astro/client, never from their own packages', () => {
		for (const config of Object.values(configs)) {
			const script = buildInitScript(config);
			const sources = [...script.matchAll(/from '(.*?)'|import\('(.*?)'\)/g)].map(
				(m) => m[1] ?? m[2]
			);
			expect(sources.every((s) => s.startsWith('@swup/astro/'))).toBe(true);
		}
	});
});

describe('ignore', () => {
	it('emits no ignore logic by default', () => {
		expect(buildInitScript()).not.toContain('shouldIgnore');
	});

	it('serialises regexes and functions', () => {
		const script = buildInitScript({ ignore: ['/admin', /\.pdf$/i] });
		expect(script).toContain('shouldIgnore');
		const match = script.match(/const ignoreOption = (deserialise\(".*"\));/)!;
		expect(match).not.toBeNull();
	});
});

describe('miscellaneous flags', () => {
	it('exposes the instance on window only when requested', () => {
		expect(buildInitScript()).not.toContain('window.swup = swup');
		expect(buildInitScript({ globalInstance: true })).toContain('window.swup = swup');
	});

	it('forwards the native view transitions flag', () => {
		expect(option(buildInitScript({ native: true }), 'native')).toBe('true');
		expect(option(buildInitScript(), 'native')).toBe('false');
	});

	// The shim that lets Astro's own lifecycle listeners keep working under swup
	it('always dispatches the Astro lifecycle events', () => {
		const script = buildInitScript();
		for (const event of ['astro:before-swap', 'astro:after-swap', 'astro:page-load']) {
			expect(script).toContain(`dispatch('${event}')`);
		}
	});

	it('always opts out of links marked data-no-swup', () => {
		expect(buildInitScript()).toContain(`el?.closest('[data-no-swup]')`);
	});
});
