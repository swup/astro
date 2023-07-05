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

	// Validate options
	const mainElement = containers[0];
	const animationSelector = `[class*="${animationClass}"]`;
	const hasRoutes = Array.isArray(routes) && routes.length > 0;
	const hasTheme = theme && Object.values(SwupTheme).includes(theme);
	if (!cache) {
		preload = false;
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
		hasRoutes ? `import SwupRouteNamePlugin from '@swup/route-name-plugin';` : '',
		theme === SwupTheme.fade ? `import SwupFadeTheme from '@swup/fade-theme';` : '',
		theme === SwupTheme.slide ? `import SwupSlideTheme from '@swup/slide-theme';` : '',
		theme === SwupTheme.overlay ? `import SwupOverlayTheme from '@swup/overlay-theme';` : '',
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
				${smoothScrolling ? `new SwupScrollPlugin(),` : ''}
				${reloadScripts ? `new SwupScriptsPlugin(),` : ''}
				${updateBodyClass ? `new SwupBodyClassPlugin(),` : ''}
				${updateHead ? `new SwupHeadPlugin(),` : ''}
				${hasRoutes ? `new SwupRouteNamePlugin({ routes: ${JSON.stringify(routes)} }),` : ''}
				${theme === SwupTheme.fade ? `new SwupFadeTheme({ mainElement: ${JSON.stringify(mainElement)} }),` : ''}
				${theme === SwupTheme.slide ? `new SwupSlideTheme({ mainElement: ${JSON.stringify(mainElement)} }),` : ''}
				${theme === SwupTheme.overlay ? `new SwupOverlayTheme(),` : ''}
			]
		});
	`;

	return imports.trim() + init.trim();
}
