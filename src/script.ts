import { Options, Theme } from './index';

export function buildInitScript(options: Partial<Options> = {}): string {
	let {
		accessibility = true,
		animationClass = 'transition-',
		cache = true,
		containers = ['main'],
		debug = false,
		preload = true,
		progress = false,
		reloadScripts = false,
		routes = false,
		smoothScrolling = false,
		theme = 'fade',
		updateBodyClass = true,
		updateHead = true
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

	// Create import statements from requested features
	const imports = [
		`import Swup from 'swup';`,
		debug ? `import SwupDebugPlugin from '@swup/debug-plugin';` : '',
		accessibility ? `import SwupA11yPlugin from '@swup/a11y-plugin';` : '',
		preload ? `import SwupPreloadPlugin from '@swup/preload-plugin';` : '',
		progress ? `import SwupProgressPlugin from '@swup/progress-plugin';` : '',
		smoothScrolling ? `import SwupScrollPlugin from '@swup/scroll-plugin';` : '',
		reloadScripts ? `import SwupScriptsPlugin from '@swup/scripts-plugin';` : '',
		updateBodyClass ? `import SwupBodyClassPlugin from '@swup/body-class-plugin';` : '',
		updateHead ? `import SwupHeadPlugin from '@swup/head-plugin';` : '',
		routes ? `import SwupRouteNamePlugin from '@swup/route-name-plugin';` : '',
		theme === Theme.fade ? `import SwupFadeTheme from '@swup/fade-theme';` : '',
		theme === Theme.slide ? `import SwupSlideTheme from '@swup/slide-theme';` : '',
		theme === Theme.overlay ? `import SwupOverlayTheme from '@swup/overlay-theme';` : '',
	].filter(Boolean).join('\n');

	// Create swup init code from requested features
	const init = `
		const swup = new Swup({
			animationSelector: ${JSON.stringify(animationSelector)},
			containers: ${JSON.stringify(containers)},
			cache: ${JSON.stringify(cache)},
			plugins: [
				${debug ? `new SwupDebugPlugin(),` : ''}
				${accessibility ? `new SwupA11yPlugin(),` : ''}
				${preload ? `new SwupPreloadPlugin(),` : ''}
				${progress ? `new SwupProgressPlugin(),` : ''}
				${routes ? `new SwupRouteNamePlugin({ routes: ${JSON.stringify(routes)}, paths: true }),` : ''}
				${smoothScrolling ? `new SwupScrollPlugin(),` : ''}
				${updateBodyClass ? `new SwupBodyClassPlugin(),` : ''}
				${updateHead ? `new SwupHeadPlugin({ awaitAssets: true }),` : ''}
				${reloadScripts && updateHead ? `new SwupScriptsPlugin({ head: false }),` : ''}
				${reloadScripts && !updateHead ? `new SwupScriptsPlugin(),` : ''}
				${theme === Theme.fade ? `new SwupFadeTheme({ mainElement: ${JSON.stringify(mainElement)} }),` : ''}
				${theme === Theme.slide ? `new SwupSlideTheme({ mainElement: ${JSON.stringify(mainElement)} }),` : ''}
				${theme === Theme.overlay ? `new SwupOverlayTheme(),` : ''}
			]
		});
	`;

	return imports.trim() + init.trim();
}
