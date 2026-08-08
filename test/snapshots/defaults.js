import { deserialise } from '@swup/astro/serialise';
import { onIdleAfterLoad } from '@swup/astro/idle';
async function initSwup() {
const [Swup, SwupA11yPlugin, SwupPreloadPlugin, SwupScrollPlugin, SwupBodyClassPlugin, SwupHeadPlugin, SwupScriptsPlugin, SwupFadeTheme] = await Promise.all([import('@swup/astro/client/Swup').then((m) => m.default), import('@swup/astro/client/SwupA11yPlugin').then((m) => m.default), import('@swup/astro/client/SwupPreloadPlugin').then((m) => m.default), import('@swup/astro/client/SwupScrollPlugin').then((m) => m.default), import('@swup/astro/client/SwupBodyClassPlugin').then((m) => m.default), import('@swup/astro/client/SwupHeadPlugin').then((m) => m.default), import('@swup/astro/client/SwupScriptsPlugin').then((m) => m.default), import('@swup/astro/client/SwupFadeTheme').then((m) => m.default)]);
const swup = new Swup({
ignoreVisit: (url, { el, event } = {}) => el?.closest('[data-no-swup]'),
animationSelector: "[class*=\"transition-\"]",
containers: ["main"],
cache: true,
native: false,
plugins: [
new SwupA11yPlugin(deserialise("{}")), new SwupPreloadPlugin(deserialise("{\"preloadHoveredLinks\":true,\"preloadVisibleLinks\":false}")), new SwupScrollPlugin(deserialise("{}")), new SwupBodyClassPlugin(deserialise("{}")), new SwupHeadPlugin(deserialise("{\"awaitAssets\":true,\"persistAssets\":false,\"persistTags\":false}")), new SwupScriptsPlugin(deserialise("{}")), new SwupFadeTheme(deserialise("{\"mainElement\":\"main\"}"))
]
});
const dispatch = (name) => document.dispatchEvent(new Event(name));
// Trigger custom events to simulate Astro load lifecycle
swup.hooks.before('content:replace', () => dispatch('astro:before-swap'));
swup.hooks.on('content:replace', () => dispatch('astro:after-swap'));
swup.hooks.on('page:view', () => dispatch('astro:page-load'));
}
onIdleAfterLoad(initSwup);