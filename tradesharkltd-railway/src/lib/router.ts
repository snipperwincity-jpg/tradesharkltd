import { useEffect, useState } from 'react';

/** Minimal client-side router (History API). Internal <a href="/..."> clicks are intercepted globally. */

const EVT = 'app:navigate';

export function navigate(to: string, opts: { replace?: boolean } = {}) {
  const url = new URL(to, window.location.origin);
  const samePath = url.pathname === window.location.pathname && url.search === window.location.search;
  if (opts.replace) history.replaceState(null, '', url.pathname + url.search + url.hash);
  else history.pushState(null, '', url.pathname + url.search + url.hash);
  window.dispatchEvent(new Event(EVT));
  requestAnimationFrame(() => {
    if (url.hash) scrollToHash(url.hash);
    else if (!samePath) window.scrollTo({ top: 0 });
  });
}

export function scrollToHash(hash: string, attempt = 0) {
  const id = decodeURIComponent(hash.replace(/^#/, ''));
  if (!id) return;
  const el = document.getElementById(id);
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  } else if (attempt < 10) {
    setTimeout(() => scrollToHash(hash, attempt + 1), 80);
  }
}

export interface Location {
  path: string;
  search: URLSearchParams;
  hash: string;
}

const read = (): Location => ({
  path: window.location.pathname.replace(/\/+$/, '') || '/',
  search: new URLSearchParams(window.location.search),
  hash: window.location.hash,
});

export function useLocation(): Location {
  const [loc, setLoc] = useState<Location>(read);
  useEffect(() => {
    const update = () => setLoc(read());
    window.addEventListener('popstate', update);
    window.addEventListener('hashchange', update);
    window.addEventListener(EVT, update);
    return () => {
      window.removeEventListener('popstate', update);
      window.removeEventListener('hashchange', update);
      window.removeEventListener(EVT, update);
    };
  }, []);
  return loc;
}

/** Install once: turns same-origin anchor clicks into SPA navigations. */
export function installLinkInterceptor() {
  document.addEventListener('click', (e) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const a = (e.target as HTMLElement)?.closest?.('a');
    if (!a) return;
    const href = a.getAttribute('href');
    if (!href || a.target === '_blank' || a.hasAttribute('download') || a.dataset.native !== undefined) return;
    if (href.startsWith('#')) {
      // in-page anchor: when not on the home page, route home first
      if (window.location.pathname !== '/') {
        e.preventDefault();
        navigate('/' + href);
      }
      return;
    }
    if (!href.startsWith('/') || href.startsWith('//') || href.startsWith('/api/')) return;
    e.preventDefault();
    navigate(href);
  });
}
