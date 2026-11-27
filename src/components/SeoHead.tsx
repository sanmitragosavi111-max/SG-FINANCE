import { useEffect } from 'react';
import { ASSETS } from '../config/defaults';

interface SeoHeadProps {
  title: string;
  description: string;
  path?: string;
  noIndex?: boolean;
  structuredData?: Record<string, unknown>;
}

function upsertMeta(attrName: 'name' | 'property', key: string, content: string): void {
  let el = document.querySelector<HTMLMetaElement>(`meta[${attrName}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attrName, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

export function SeoHead({
  title,
  description,
  path,
  noIndex = false,
  structuredData,
}: SeoHeadProps) {
  useEffect(() => {
    document.title = title;
    upsertMeta('name', 'description', description);
    upsertMeta('name', 'robots', noIndex ? 'noindex, nofollow' : 'index, follow');

    const canonicalUrl =
      window.location.origin + (path ? (path.startsWith('/') ? path : `/${path}`) : window.location.pathname);
    const absoluteOgImage = `${window.location.origin}${ASSETS.ogShareCard}`;

    let canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', canonicalUrl);

    upsertMeta('property', 'og:title', title);
    upsertMeta('property', 'og:description', description);
    upsertMeta('property', 'og:url', canonicalUrl);
    upsertMeta('property', 'og:image', absoluteOgImage);
    upsertMeta('name', 'twitter:title', title);
    upsertMeta('name', 'twitter:description', description);
    upsertMeta('name', 'twitter:image', absoluteOgImage);

    const scriptId = 'sgf-route-jsonld';
    const existingScript = document.getElementById(scriptId);
    if (structuredData) {
      const script = existingScript ?? document.createElement('script');
      script.id = scriptId;
      script.setAttribute('type', 'application/ld+json');
      script.textContent = JSON.stringify(structuredData);
      if (!existingScript) {
        document.head.appendChild(script);
      }
    } else if (existingScript) {
      existingScript.remove();
    }
  }, [title, description, path, noIndex, structuredData]);

  return null;
}
