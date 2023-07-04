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

```js title="src/pages/index.astro"
<script>
  import Swup from 'swup';
  import SwupFormsPlugin from '@swup/forms-plugin';

  const swup = new Swup({
    plugins: [new SwupFormsPlugin()]
  });

  swup.hooks.on('transitionStart', () => {});
</script>
```

## Configuration

TO-DO

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
