import type { AstroIntegration } from 'astro';
import { buildInitScript } from './script';

export interface Options {
	containers: string[],
	animationClass: string,
	cache: boolean,
	debug: boolean,
	accessibility: boolean,
	preload: boolean,
	progress: boolean,
	routes: false | any[],
	smoothScrolling: boolean,
	reloadScripts: boolean,
	updateBodyClass: boolean,
	updateHead: boolean,
	theme: 'fade' | 'slide' | 'overlay' | false
};

export default function createPlugin(options?: Options): AstroIntegration {
	return {
		name: '@swup/astro',
		hooks: {
			'astro:config:setup': ({ injectScript }) => {
				const script = buildInitScript(options);
				injectScript('page', script);
			},
		},
	};
}
