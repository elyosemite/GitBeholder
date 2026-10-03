const cache = new Map<string, number>();

/**
 * A px design token from App.css (e.g. `--spacing-row`) as a number, for
 * layout math that can't live in CSS — virtualized list offsets, resize
 * handle positions. Reading the token keeps the value in one place instead
 * of duplicating it as a JS constant. Spacing tokens don't change with the
 * theme, so each one is read once.
 */
export function pxToken(name: `--${string}`): number {
  const cached = cache.get(name);
  if (cached !== undefined) return cached;

  const value = parseFloat(getComputedStyle(document.documentElement).getPropertyValue(name));
  if (Number.isNaN(value)) throw new Error(`Design token ${name} is not defined in App.css`);

  cache.set(name, value);
  return value;
}
