// Safe Multi-Page Route Navigation Helper (SSR + renderToStaticMarkup + Next.js App Router compatible)

export function navigateToRoute(href: string): void {
  if (typeof window === 'undefined') return;
  if (typeof document !== 'undefined') {
    const nextLink = document.querySelector<HTMLAnchorElement>(`a[href="${href}"]`);
    if (nextLink && typeof nextLink.click === 'function') {
      nextLink.click();
      return;
    }
  }
  if (typeof window.location?.assign === 'function') {
    window.location.assign(href);
  }
}
