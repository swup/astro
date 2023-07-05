import Swup from 'swup';
import SwupDebugPlugin from '@swup/debug-plugin';
import SwupA11yPlugin from '@swup/a11y-plugin';
import SwupPreloadPlugin from '@swup/preload-plugin';
import SwupProgressPlugin from '@swup/progress-plugin';
import SwupScrollPlugin from '@swup/scroll-plugin';
import SwupScriptsPlugin from '@swup/scripts-plugin';
import SwupBodyClassPlugin from '@swup/body-class-plugin';
import SwupHeadPlugin from '@swup/head-plugin';
import SwupRouteNamePlugin from '@swup/route-name-plugin';
import SwupFadeTheme from '@swup/fade-theme';
import SwupSlideTheme from '@swup/slide-theme';
import SwupOverlayTheme from '@swup/overlay-theme';

/**
 * This would be great as a client script for dynamic importing.
 * However, it seems Astro will always bundle the whole script. Hence, we're creating a single
 * client package for each plugin and theme in the client/ subfolder for now.
 * It works, but it's not pretty :(
 */
export {
  Swup,
  SwupDebugPlugin,
  SwupA11yPlugin,
  SwupPreloadPlugin,
  SwupProgressPlugin,
  SwupScrollPlugin,
  SwupScriptsPlugin,
  SwupBodyClassPlugin,
  SwupHeadPlugin,
  SwupRouteNamePlugin,
  SwupFadeTheme,
  SwupSlideTheme,
  SwupOverlayTheme
}
