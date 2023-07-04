import { Options } from './index';

export function buildInitScript(options?: Options): string {
	// This gets injected into the user's page, so the import will pull
	// from the project's version of swup in their package.json.
	const {
		containers = ['main'],
		animationClass = 'transition-',
		cache = true,
		debug = false,
		accessibility = true,
		preload = true,
		progress = false,
		routes = false,
		smoothScrolling = false,
		reloadScripts = false,
		updateBodyClass = false,
		updateHead = true,
		theme = 'fade'
	} = options || {};

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
		theme === 'fade' ? `import SwupFadeTheme from '@swup/fade-theme';` : '',
		theme === 'slide' ? `import SwupSlideTheme from '@swup/slide-theme';` : '',
		theme === 'overlay' ? `import SwupOverlayTheme from '@swup/overlay-theme';` : '',
	].filter(Boolean).join('\n');

	const animationSelector = `[class*="${animationClass}"]`;

	const swupOptions = {
		animationSelector,
		containers,
		cache
	};

	const script = `
		${imports} const swup = new Swup(${JSON.stringify(swupOptions)});
	`;

	return script.trim();
}
