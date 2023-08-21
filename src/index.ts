import { type AstroIntegration } from 'astro';

import { buildInitScript } from './script.js';

export interface Options {
	accessibility: boolean;
	animationClass: string | false;
	cache: boolean;
	containers: string[];
	debug: boolean;
	forms: boolean;
	globalInstance: boolean;
	loadOnIdle: boolean;
	parallel: boolean | string[];
	morph: string[] | false;
	preload: boolean | { hover: boolean; visible: boolean };
	progress: boolean;
	reloadScripts: boolean;
	routes: true | false | Route[];
	smoothScrolling: boolean;
	theme: Theme | [Theme, ThemeOptions] | false;
	updateBodyClass: boolean;
	updateHead: boolean;
}

export enum Theme {
	fade = 'fade',
	slide = 'slide',
	overlay = 'overlay'
}

export type ThemeOptions = Record<string, unknown>;

export interface Route {
	name: string;
	path: string | RegExp;
}

export default function createPlugin(options: Partial<Options> = {}): AstroIntegration {
	return {
		name: '@swup/astro',
		hooks: {
			'astro:config:setup': ({ injectScript }) => {
				const script = buildInitScript(options);
				injectScript('page', script);
			}
		}
	};
}
