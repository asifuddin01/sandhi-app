/**
 * Search results and related links carry website paths. Those the app has a
 * screen for open in the app; everything else opens the website in the
 * browser (returns null).
 */
const screens: [RegExp, (slug: string) => string][] = [
  [/^\/research\/areas\/([^/]+)$/, (slug) => `/area/${slug}`],
  [/^\/research\/([^/]+)$/, (slug) => `/theme/${slug}`],
  [/^\/projects\/([^/]+)$/, (slug) => `/project/${slug}`],
  [/^\/publications\/([^/]+)$/, (slug) => `/publication/${slug}`],
  [/^\/people\/([^/]+)$/, (slug) => `/person/${slug}`],
  [/^\/news\/([^/]+)$/, (slug) => `/news/${slug}`],
  [/^\/insights\/([^/]+)$/, (slug) => `/insight/${slug}`],
];

export function appRoute(websitePath: string): string | null {
  const path = websitePath.split(/[?#]/)[0];
  for (const [pattern, route] of screens) {
    const match = pattern.exec(path);
    if (match) return route(match[1]);
  }
  return null;
}
