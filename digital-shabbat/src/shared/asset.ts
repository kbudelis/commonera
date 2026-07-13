/* Public-dir paths are written root-absolute ('/plates/…') throughout, which
   only holds when the site is served from the domain root. Runtime strings
   never pass through Vite's HTML/CSS rebasing, so anything reaching the DOM
   from JS goes through here to pick up the deploy's base path. */
export function asset(path: string): string {
  return import.meta.env.BASE_URL + path.replace(/^\//, '');
}
