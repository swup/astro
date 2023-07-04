# @swup/astro

Enable smooth page transitions, smart preloading and more with this
[Astro](https://docs.astro.build/en/guides/integrations-guide/) integration for [swup](https://swup.js.org/).

- [Installation](#installation)
- [Usage](#usage)
- [Configuration](#configuration)
- [Examples](#examples)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [Changelog](#changelog)

## What is swup?

Swup is a versatile and extensible **page transition library** for multi-page apps.
It manages the complete page load lifecycle and smoothly transitions between the current and next page.
Additionally, it provides lots of other quality-of-life improvements like **caching**,
**smart preloading**, native **browser history** and enhanced **accessibility**.
[Learn more about swup](https://swup.js.org/getting-started/) in the official docs.

## Installation

### Quick Install

The `astro add` command-line tool automates the installation for you. Run one of the following commands in a new terminal window. (If you aren't sure which package manager you're using, run the first command.) Then, follow the prompts, and type `y` in the terminal (meaning `yes`) for each one.

```sh
# Using NPM
npx astro add swup
# Using Yarn
yarn astro add swup
# Using PNPM
pnpm astro add swup
```

If you run into any issues, check out the [Troubleshooting](#troubleshooting) section or try
the manual installation steps below.

### Manual Install

First, install the `@swup/astro` package using your package manager. If you're using npm or aren't sure, run this in the terminal:

```sh
npm install @swup/astro
```

Most package managers will install associated peer dependencies as well. However, if you see a "Cannot find package 'swup'" (or similar) warning when you start up Astro, you'll need to manually install swup yourself:

```sh
npm install swup
```

Then, apply this integration to your `astro.config.*` file using the `integrations` property:

```js ins={3} "swup()"
// astro.config.mjs
import { defineConfig } from 'astro/config';
import swup from '@swup/astro';

export default defineConfig({
  // ...
  integrations: [swup()],
});
```

## Usage

Once the integration is installed, [swup](https://swup.js.org/) will handle the complete lifecycle
of page visits by intercepting link clicks, loading the new page in the background, replacing the
content and transitioning between the old and the new page.

The necessary script is automatically added and enabled on every page of your website. Try
navigating between different pages via links — you should no longer see browser refreshes and should
find page requests passing through swup under the Network tab in your browser dev tools.

Head to the [swup docs](https://swup.js.org) for all options and features available. You can also
check the [Astro Integration Documentation](https://docs.astro.build/en/guides/integrations-guide/)
for more on integrations.

## Limitations

The swup integration does not give you control over how the script is loaded or initialized. If you
require this control, consider [installing and using swup manually](https://swup.js.org/getting-started/installation/).

**It is not currently possible to add custom plugins or hooks when using this component.** If you
need this level of granularity, consider following [the manual swup setup](https://swup.js.org/getting-started/installation/) instead:

```js
<script>
  import Swup from 'swup';
  import SwupPreloadPlugin from '@swup/preload-plugin';
  const swup = new Swup({
    plugins: [new SwupPreloadPlugin()]
  });
</script>
```

## Configuration

The integration has its own options for enabling and fine-tuning swup features. Change these in the
`astro.config.*` file which is where your project’s integration settings live.

```js
import { defineConfig } from 'astro/config';
import swup from '@swup/astro';

export default defineConfig({
  integrations: [
    swup({
      containers: ['#swup'],
      animationClass: 'transition-',
      cache: true,
      debug: false,
      accessibility: true,
      preload: true,
      progress: false,
      routes: false,
      smoothScrolling: false,
      reloadScripts: false,
      updateBodyClass: false,
      updateHead: true,
      theme: 'fade'
    })
  ]
});
```

### config.containers

The content containers to be replaced on page visits. Usually the `<main>` element with the content
of the page, but can include any other elements that are present across all pages.
Defaults to a single container of id #swup.

**Note**: Only elements **inside** of the `body` tag are supported.

```js
{
  containers: ['#main', '#nav']
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
  preload: true
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
    { name: 'project', path: '/:lang/project/:slug' },
    { name: 'any', path: '(.*)' }
  ]
}
```

Navigating from `/en/` to `/en/project/some-project/`:

```html
<html class="is-animating from-route-home to-route-project">
```

### config.accessibility

Enhance accessibility for screen readers by announcing page visits and focussing the newly updated
content after page visits.

```js
{
  accessibility: true
}
```

### config.debug

Add debug output by swup and its plugins. Useful during development.

```js
{
  debug: false
}
```

### config.animationClass

The class prefix for detecting transition timing. Swup will wait for all CSS transitions and
keyframe animations to finish on these elements before swapping in the content of the new page.
The default option will select all elements with class names beginning in `transition-`.

```js
{
  animationClass: 'transition-'
}
```

### config.updateBodyClass

Update the body class after each page visit. Useful if you use tags on the body element for
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

### config.smoothScrolling

Enable acceleration-based smooth scrolling, animate scroll positions between page visits and
scrolling to anchors.

```js
{
  smoothScrolling: true
}
```

### config.theme

Use one of swup's predefined themes to get started with smooth page transitions.

Set to `false` if you want to define your own transition styles.

```js
{
  theme: 'fade' | 'slide' | 'overlay' | false
}
```

## Examples

TO-DO

## Troubleshooting

Having trouble implementing swup? Check out the [official docs](https://swup.js.org), look at
[past issues](https://github.com/swup/swup/issues) or create a
[new discussion](https://github.com/swup/swup/discussions/new).

You can also check the [Astro Integration Documentation](https://docs.astro.build/en/guides/integrations-guide/) for more on integrations.

## Contributing

This package is maintained by the swup core team. You're welcome to submit an issue or PR!

## Changelog

See [Changelog](CHANGELOG.md) for a history of changes to this integration.
