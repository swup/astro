# @swup/astro

**Make your site feel like a snappy single-page app — without any of the complexity.**

Enable smooth page transitions, smart preloading and more with this
[Astro](https://docs.astro.build/en/guides/integrations-guide/) integration for [swup](https://swup.js.org/).

- [Installation](#installation)
- [Usage](#usage)
- [Configuration](#configuration)
- [Examples](#examples)
- [Troubleshooting](#troubleshooting)

## What is swup?

[Swup](https://swup.js.org/) is a versatile and extensible **page transition library** for multi-page apps.
It manages the complete page load lifecycle and smoothly transitions between the current and next page.
In addition, it offers many other quality-of-life improvements like **caching**, **smart preloading**,
native browser history and enhanced **accessibility**.

[Learn more about swup](https://swup.js.org/getting-started/) in the official docs.

## Installation

First, install the `@swup/astro` package using your package manager.

```sh
npm install @swup/astro
```

Then, apply the integration to your `astro.config.*` file using the `integrations` property:

```js ins={3} "swup()"
import { defineConfig } from 'astro/config';
import swup from '@swup/astro';

export default defineConfig({
  integrations: [swup()]
});
```

## Usage

Once the integration is installed, swup will handle and animate page visits.
The necessary script is automatically added on every page of your website. Try navigating between
different pages via links — you should no longer see browser refreshes and find page requests
passing through swup under the Network tab in your browser dev tools.

The next step: fine-tune your setup by reading up on available [configuration](#configuration) flags.

### Content containers

If you're using semantic markup and your main content area is wrapped in a `main` tag, swup will
work without modifications to your site. Should you wish to replace other content containers instead
of or in addition to that, edit the [containers](#configcontainers) options.

### Animations

This integration enables swup's 'fade' theme for animated page transitions out of the box.

### Custom animations

If you want to write your own animation styles, disable the [theme](#configtheme) option. You then
need to add an animation class to your animated elements and write the animation styles in CSS.
See below for an example fade transition.
Refer to the swup docs for a full [example setup](https://swup.js.org/getting-started/example/).

```js
export default defineConfig({
  integrations: [
    swup({ theme: false })
  ]
});
```

```html
<main class="transition-fade">
  <h1>Welcome</h1>
</main>
```

```css
.transition-fade {
  transition: 0.4s;
  opacity: 1;
}
html.is-animating .transition-fade {
  opacity: 0;
}
```

### Usage without animations

If you don't need animated page transitions and just want to use swup for its preloading and caching
features, that's fine too! In that case, disable the [theme](#configtheme) option and pass in a
boolean `false` for the [animationClass](#configanimationclass) option as well.

```js
export default defineConfig({
  integrations: [
    swup({ theme: false, animationClass: false })
  ]
});
```

## Configuration

The integration has its own options for enabling and fine-tuning swup features. Change these in the
`astro.config.*` file which is where your project’s integration settings live. These are the defaults:

```js
import { defineConfig } from 'astro/config';
import swup from '@swup/astro';

export default defineConfig({
  integrations: [
    swup({
      theme: 'fade',
      animationClass: 'transition-',
      containers: ['main'],
      cache: true,
      preload: true,
      accessibility: true,
      progress: false,
      routes: false,
      smoothScrolling: false,
      updateBodyClass: false,
      updateHead: true,
      reloadScripts: false,
      debug: false,
      globalInstance: false,
    })
  ]
});
```

### config.theme

Use one of swup's predefined themes to get started with smooth page transitions.

Set to `false` if you want to define your own transition styles.

```js
{
  theme: 'fade' | 'slide' | 'overlay' | false
}
```

### config.animationClass

If you're not using one of the provided themes, you will need this class for defining your own
transition styles.

The class prefix for detecting transition timing. Swup will wait for all CSS transitions and
keyframe animations to finish on these elements before swapping in the content of the new page.
The default option will select all elements with class names beginning in `transition-`.

```js
{
  animationClass: 'transition-'
}
```

### config.containers

The content containers to be replaced on page visits. Usually the `<main>` element with the content
of the page, but can include any other elements that are present across all pages.
Defaults to the first `main` tag of the page.

**Note**: Only elements **inside** of the `body` tag are supported.

```js
{
  containers: ['#content', '#nav']
}
```

### config.cache

The built-in cache keeps previously loaded pages in memory. This improves speed but can be disabled
for highly dynamic sites that need up-to-date responses on each request.

```js
{
  cache: false
}
```

### config.preload

Enable smart preloading. Will fetch a page in the background when hovering a link. Also prefetches
all pages with a `[data-swup-preload]` attribute. Useful for main navigations to ensure all menu
items load instantly.

```js
{
  preload: false
}
```

### config.accessibility

Enhance accessibility for screen readers by announcing page visits and focussing the newly updated
content after page visits.

```js
{
  accessibility: true
}
```

### config.progress

Display a progress bar for all requests taking longer than ~300ms.

```js
{
  progress: true
}
```

The progress bar has a class name of `swup-progress-bar` you can use for styling.

```css
.swup-progress-bar {
  height: 4px;
  background-color: blue;
}
```

### config.routes

Use path and route names to allow choosing between animations. Given a list of URL patterns,
uses [path-to-regexp](https://www.npmjs.com/package/path-to-regexp) to identify named routes and
adds them as classnames to use for styling transitions, e.g. `from-route-home` or `to-route-project`.

```js
{
  routes: [
    { name: 'home', path: '/:lang?' },
    { name: 'projects', path: '/:lang/projects' },
    { name: 'project', path: '/:lang/project/:slug' }
  ]
}
```

Navigating from `/en/` to `/en/project/some-project/` will add these classes:

```html
<html class="is-animating from-route-home to-route-project">
```

### config.smoothScrolling

Enable acceleration-based smooth scrolling, animated scroll positions between page visits and for
anchor jump links.

```js
{
  smoothScrolling: true
}
```

### config.updateBodyClass

Update the body class after each page visit. Useful if you use classes on the body element for
styling site sections.

```js
{
  updateBodyClass: true
}
```

### config.updateHead

Update the contents of the `head` tag after each page visit. Useful if you have differing
stylesheets per section of your site.

```js
{
  updateHead: true
}
```

### config.reloadScripts

Re-run any `script` tags inside the `head` and `body` on every page view. Helpful as a last resort
for sites with limited control over the included scripts. Beware: Running scripts without destroying
previous ones can cause memory leaks and potentially break your page.

```js
{
  reloadScripts: true
}
```

### config.debug

Add debug output by swup and its plugins to the browser console. Useful during development.

```js
{
  debug: true
}
```

### config.globalInstance

Store the initialized swup instance in `window.swup`. Useful if you need to add custom hooks or
plugins.

```js
{
  globalInstance: true
}
```

## Advanced usage

### Access to the swup instance

For more advanced usage like registering hook handlers or installing custom plugins, you need access
to the swup instance itself. Enable the `globalInstance` option to have the swup instance available
at `window.swup`. You can then use swup's API directly.

```html
<script>
  window.swup.use(new MyCustomSwupPlugin())
</script>
```

### Control over the initialization

If you need more granularity during the initilization process itself, consider following
[the manual swup setup](https://swup.js.org/getting-started/installation/) instead:

```html
<script>
  import Swup from 'swup';
  import SwupPreloadPlugin from '@swup/preload-plugin';
  const swup = new Swup({
    plugins: [new SwupPreloadPlugin()]
  });
</script>
```

## Troubleshooting

Having trouble implementing swup? Check out the [official docs](https://swup.js.org), look at
[past issues](https://github.com/swup/swup/issues) or create a
[new discussion](https://github.com/swup/swup/discussions/new).

You can also check the [Astro Integration Documentation](https://docs.astro.build/en/guides/integrations-guide/) for more on integrations.

## Contributing

This package is maintained by the swup core team. You're welcome to submit an issue or PR.

## Changelog

See [Changelog](CHANGELOG.md) for a history of changes to this integration.
