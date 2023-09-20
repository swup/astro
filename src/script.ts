import { Theme, type ThemeOptions, type Options } from './index.js';
import { serialiseOptions as s } from './serialise.js';

export function buildInitScript(options: Partial<Options> = {}): string {
	let {
		accessibility = true,
		animationClass = 'transition-',
		cache = true,
		containers = ['main'],
		debug = false,
		forms = false,
		globalInstance = false,
		loadOnIdle = true,
		morph = false,
		parallel = false,
		preload = true,
		progress = false,
		reloadScripts = true,
		routes = false,
		smoothScrolling = true,
		theme = 'fade',
		updateBodyClass = true,
		updateHead = true,
	} = options;

	// Override main element for themes from first container
	let themeOptions: ThemeOptions = {
		mainElement: containers[0]
	};

	// Allow theme to be passed as an array with name + options
	// e.g. ['overlay', { direction: 'to-right' }]
	if (Array.isArray(theme)) {
		themeOptions = { ...themeOptions, ...theme[1] };
		theme = theme[0];
	}

	// Build animation selector from animation class
	const animationSelector = animationClass ? `[class*="${animationClass}"]` : false;

	// Disable preload if cache is disabled
	if (!cache) {
		preload = false;
	}

	// Allow preload boolean to enable per-feature configuration
	if (typeof preload === 'object') {
		preload = { hover: preload.hover ?? true, visible: preload.visible ?? false };
	} else {
		preload = { hover: preload, visible: false };
	}

	// Unset preload if all preload options are disabled
	if (Object.values(preload).filter(Boolean).length === 0) {
		preload = false;
	}

	// Allow routes boolean to enable path-name classes on body
	if (routes === true) {
		routes = [];
	}

	// Allow parallel boolean to enable parallel animations on all containers
	if (parallel === true) {
		parallel = [];
	}

	// Disable morph if no containers specified
	if (!morph || !morph?.length) {
		morph = false;
	}

	// Build plugins + options from requested features
	const plugins = {
		SwupDebugPlugin: debug,
		SwupA11yPlugin: accessibility,
		SwupFormsPlugin: forms ? { formSelector: 'form' } : false,
		SwupMorphPlugin: morph ? { containers: morph } : false,
		SwupPreloadPlugin: preload ? { preloadHoveredLinks: preload.hover, preloadVisibleLinks: preload.visible } : false,
		SwupProgressPlugin: progress,
		SwupRouteNamePlugin: routes ? { routes, paths: true } : false,
		SwupScrollPlugin: smoothScrolling,
		SwupParallelPlugin: parallel ? { containers: parallel } : false,
		SwupBodyClassPlugin: updateBodyClass,
		SwupHeadPlugin: updateHead ? { awaitAssets: true } : false,
		SwupScriptsPlugin: reloadScripts,
		SwupFadeTheme: theme === Theme.fade ? themeOptions : false,
		SwupSlideTheme: theme === Theme.slide ? themeOptions : false,
		SwupOverlayTheme: theme === Theme.overlay ? themeOptions : false,
	};

	// Only enable plugins that are requested
	const enabledPlugins = Object.fromEntries(Object.entries(plugins).filter(([, enabled]) => enabled).map(([plugin, options]) => [plugin, options === true ? {} : options]));

	// Create import statements for swup and enabled plugins
	// This gets injected into the user's page, so we need to re-export Swup and all plugins
	// from our own package so that package managers like pnpm can follow the imports correctly
	const modules = ['Swup', ...Object.keys(enabledPlugins)];
	const imports = modules.map(pckg => [pckg, `@swup/astro/client/${pckg}`]);
	const staticImports = imports.map(([pckg, path]) => `import ${pckg} from '${path}'`).join('; ');
	const dynamicImports = `
		const [${modules.join(', ')}] = await Promise.all([${imports.map(
			([, path]) => `import('${path}').then((m) => m.default)`
		).join(', ')}]);
	`;

	// Create swup init code from requested features

	return `
		import { deserialise } from '@swup/astro/serialise';
		${loadOnIdle ? `import { onIdleAfterLoad } from '@swup/astro/idle';` : ''}
		${!loadOnIdle ? staticImports : ''}

		async function initSwup() {
			${loadOnIdle ? dynamicImports : ''}

			const swup = new Swup({
				animationSelector: ${JSON.stringify(animationSelector)},
				containers: ${JSON.stringify(containers)},
				cache: ${JSON.stringify(cache)},
				plugins: [
					${Object.entries(enabledPlugins).map(([plugin, options]) => s`new ${plugin}(${options})`).join(', ')}
				]
			});

			${globalInstance ? 'window.swup = swup;' : ''}
		}

		${loadOnIdle ? 'onIdleAfterLoad(initSwup);' : 'initSwup();'}
	`;
}
