import {mountSpecularServices} from '/m1-2-specular-button/index.js';
// The selected button appearance is now shared, with no comparison variants.
export function applyButtonTheme() {
  document.documentElement.dataset.m12Palette = 'hover-base';
  const css = document.createElement('link');
  css.rel = 'stylesheet';
  css.href = '/m1-2-button-palette.css';
  document.head.append(css);
  function removeLegacyChoice() {
    const url = new URL(location.href);
    if (url.searchParams.has('palette')) {
      url.searchParams.delete('palette');
      history.replaceState(null, '', url);
    }
  }
  mountSpecularServices();
  removeLegacyChoice();
  window.addEventListener('popstate', removeLegacyChoice);
}
