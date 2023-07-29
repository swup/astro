import { Theme, type Options } from './index.js';

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

	// Get main element for themes from first container
	const mainElement = containers[0];

	// Build animation selector from animation class
	const animationSelector = animationClass ? `[class*="${animationClass}"]` : false;

	// Disable preload if cache is disabled
	if (!cache) {
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

	// Create import statements from requested features
	// This gets injected into the user's page, so we need to re-export Swup and all plugins
	// from our own package so that package managers like pnpm can follow the imports correctly
	const imports = [
		'Swup',
		debug ? 'SwupDebugPlugin' : null,
		accessibility ? 'SwupA11yPlugin' : null,
		forms ? 'SwupFormsPlugin' : null,
		preload ? 'SwupPreloadPlugin' : null,
		progress ? 'SwupProgressPlugin' : null,
		smoothScrolling ? 'SwupScrollPlugin' : null,
		parallel ? 'SwupParallelPlugin' : null,
		reloadScripts ? 'SwupScriptsPlugin' : null,
		updateBodyClass ? 'SwupBodyClassPlugin' : null,
		updateHead ? 'SwupHeadPlugin' : null,
		routes ? 'SwupRouteNamePlugin' : null,
		theme === Theme.fade ? 'SwupFadeTheme' : null,
		theme === Theme.slide ? 'SwupSlideTheme' : null,
		theme === Theme.overlay ? 'SwupOverlayTheme' : null,
	].filter(Boolean);

	// Create import statements

	const staticImports = imports.map(pckg => `import ${pckg} from '@swup/astro/client/${pckg}'`).join('; ');
	const dynamicImports = `
		const moduleImports = await Promise.all([${imports.map(pckg => `import('@swup/astro/client/${pckg}')`).join(',')}]);
		const [${imports.join(', ')}] = moduleImports.map((m) => m.default);
	`;

	// Create swup init code from requested features

	return `
		import { onIdleAfterLoad } from '@swup/astro/idle';
		${!loadOnIdle ? staticImports : ''}

		async function initSwup() {
			${loadOnIdle ? dynamicImports : ''}
			const swup = new Swup({
				animationSelector: ${JSON.stringify(animationSelector)},
				containers: ${JSON.stringify(containers)},
				cache: ${JSON.stringify(cache)},
				plugins: [
					${debug ? `new SwupDebugPlugin(),` : ''}
					${accessibility ? `new SwupA11yPlugin(),` : ''}
					${forms ? `new SwupFormsPlugin({ formSelector: 'form' }),` : ''}
					${preload ? `new SwupPreloadPlugin(),` : ''}
					${progress ? `new SwupProgressPlugin(),` : ''}
					${routes ? `new SwupRouteNamePlugin({ routes: ${JSON.stringify(routes)}, paths: true }),` : ''}
					${smoothScrolling ? `new SwupScrollPlugin(),` : ''}
					${parallel ? `new SwupParallelPlugin({ containers: ${JSON.stringify(parallel)} }),` : ''}
					${updateBodyClass ? `new SwupBodyClassPlugin(),` : ''}
					${updateHead ? `new SwupHeadPlugin({ awaitAssets: true }),` : ''}
					${reloadScripts ? `new SwupScriptsPlugin(),` : ''}
					${theme === Theme.fade ? `new SwupFadeTheme({ mainElement: ${JSON.stringify(mainElement)} }),` : ''}
					${theme === Theme.slide ? `new SwupSlideTheme({ mainElement: ${JSON.stringify(mainElement)} }),` : ''}
					${theme === Theme.overlay ? `new SwupOverlayTheme(),` : ''}
				]
			});
			${globalInstance ? 'window.swup = swup;' : ''}
		}

		${loadOnIdle ? 'onIdleAfterLoad(initSwup);' : 'initSwup();'}
	`;
}
