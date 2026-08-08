import { deserialise } from '@swup/astro/serialise';
import Swup from '@swup/astro/client/Swup'; import SwupDebugPlugin from '@swup/astro/client/SwupDebugPlugin'; import SwupA11yPlugin from '@swup/astro/client/SwupA11yPlugin'; import SwupFormsPlugin from '@swup/astro/client/SwupFormsPlugin'; import SwupFragmentPlugin from '@swup/astro/client/SwupFragmentPlugin'; import SwupMorphPlugin from '@swup/astro/client/SwupMorphPlugin'; import SwupPreloadPlugin from '@swup/astro/client/SwupPreloadPlugin'; import SwupProgressPlugin from '@swup/astro/client/SwupProgressPlugin'; import SwupRouteNamePlugin from '@swup/astro/client/SwupRouteNamePlugin'; import SwupScrollPlugin from '@swup/astro/client/SwupScrollPlugin'; import SwupParallelPlugin from '@swup/astro/client/SwupParallelPlugin'; import SwupBodyClassPlugin from '@swup/astro/client/SwupBodyClassPlugin'; import SwupHeadPlugin from '@swup/astro/client/SwupHeadPlugin'; import SwupScriptsPlugin from '@swup/astro/client/SwupScriptsPlugin'; import SwupOverlayTheme from '@swup/astro/client/SwupOverlayTheme'
async function initSwup() {
const ignoreOption = deserialise("[\"/admin\",[\":regex:\",\"/\\\\.pdf$/i\"],\"[data-raw]\"]");
const shouldIgnore = (ignore, url, { el, event }) => {
if (typeof ignore === 'string' && ignore.startsWith('/')) {
return url.startsWith(ignore);
}
if (typeof ignore === 'string') {
return el?.matches(ignore) ?? false;
}
if (ignore instanceof RegExp) {
return ignore.test(url);
}
if (typeof ignore === 'function') {
return ignore(url, { el, event });
}
if (Array.isArray(ignore)) {
return ignore.some((i) => shouldIgnore(i, url, { el, event }));
}
return false;
};
const swup = new Swup({
ignoreVisit: (url, { el, event } = {}) => el?.closest('[data-no-swup]') || shouldIgnore(ignoreOption, url, { el, event }),
animationSelector: "[class*=\"swup-\"]",
containers: ["#main","#nav"],
cache: true,
native: true,
plugins: [
new SwupDebugPlugin(deserialise("{}")), new SwupA11yPlugin(deserialise("{}")), new SwupFormsPlugin(deserialise("{\"formSelector\":\"form\"}")), new SwupFragmentPlugin(deserialise("{\"rules\":[{\"from\":\"/users/\",\"to\":\"/users/:id\",\"containers\":[\"#user\"]}]}")), new SwupMorphPlugin(deserialise("{\"containers\":[\"#sidebar\"]}")), new SwupPreloadPlugin(deserialise("{\"preloadHoveredLinks\":true,\"preloadVisibleLinks\":true}")), new SwupProgressPlugin(deserialise("{}")), new SwupRouteNamePlugin(deserialise("{\"routes\":[{\"name\":\"user\",\"path\":\"/users/:id\"}],\"paths\":true}")), new SwupScrollPlugin(deserialise("{}")), new SwupParallelPlugin(deserialise("{\"containers\":[\"#main\"]}")), new SwupBodyClassPlugin(deserialise("{}")), new SwupHeadPlugin(deserialise("{\"awaitAssets\":false,\"persistAssets\":true,\"persistTags\":\"style\"}")), new SwupScriptsPlugin(deserialise("{}")), new SwupOverlayTheme(deserialise("{\"mainElement\":\"#main\",\"direction\":\"to-right\"}"))
]
});
const dispatch = (name) => document.dispatchEvent(new Event(name));
// Trigger custom events to simulate Astro load lifecycle
swup.hooks.before('content:replace', () => dispatch('astro:before-swap'));
swup.hooks.on('content:replace', () => dispatch('astro:after-swap'));
swup.hooks.on('page:view', () => dispatch('astro:page-load'));
window.swup = swup;
}
initSwup();