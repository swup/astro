import type { AstroIntegration } from 'astro';
import { buildInitScript } from './script';

export default function createPlugin(): AstroIntegration {
	return {
		name: '@swup/astro',
		hooks: {
			'astro:config:setup': ({ injectScript }) => {
				const script = buildInitScript();
				injectScript('page', script);
			},
		},
	};
}
