export interface RouteSeoMeta {
  title: string;
  description: string;
  canonicalPath: string;
  noIndex?: boolean;
}

export const OG_IMAGE_PATH = '/src/assets/images/og_sg_finance_share_1795591709430.jpg';

const ROUTE_SEO_MAP: Record<string, RouteSeoMeta> = {
  '/': {
    title: 'SG FINANCE | Secured Lending & Financial Services in Pune, Maharashtra',
    description:
      'Thoughtful secured financial solutions and loans against eligible pledged movable assets in Pune, Maharashtra — guided by transparency, confidentiality, and a professional approach.',
    canonicalPath: '/',
  },
  '/services': {
    title: 'Financial Services | SG FINANCE — Secured Lending in Pune',
    description:
      'Explore SG FINANCE secured lending solutions, loans against eligible pledged movable assets, short-term financial assistance, and confidential consultation in Pune, Maharashtra.',
    canonicalPath: '/services',
  },
  '/how-it-works': {
    title: 'How It Works | SG FINANCE — Transparent Enquiry & Evaluation Process',
    description:
      'Understand SG FINANCE’s structured four-step process in Pune: submit an enquiry, discuss requirements, transparent asset evaluation and documentation, and formal application review.',
    canonicalPath: '/how-it-works',
  },
  '/about': {
    title: 'About SG FINANCE | Trusted Financial Services Firm in Pune, Maharashtra',
    description:
      'Learn about SG FINANCE — a Pune-based secured lending and financial services firm built on clarity, confidentiality, and responsible financial practices.',
    canonicalPath: '/about',
  },
  '/contact': {
    title: 'Contact SG FINANCE Pune | Call +91 7038391002 or WhatsApp',
    description:
      'Contact SG FINANCE in Pune, Maharashtra by phone (+91 7038391002), WhatsApp, email (in.sg.infra@gmail.com), or online enquiry form for confidential financial assistance.',
    canonicalPath: '/contact',
  },
  '/faq': {
    title: 'Frequently Asked Questions | SG FINANCE Pune',
    description:
      'Answers to common questions about secured loans, pledged movable asset evaluation, required documentation, eligibility assessment, and how to enquire with SG FINANCE in Pune.',
    canonicalPath: '/faq',
  },
  '/enquire': {
    title: 'Enquire Now | SG FINANCE — Confidential Secured Loan Consultation',
    description:
      'Submit a confidential loan enquiry to the SG FINANCE team in Pune, Maharashtra. Receive an instant reference number and direct assistance via phone or WhatsApp.',
    canonicalPath: '/enquire',
  },
  '/campaign': {
    title: 'SG FINANCE Pune | Quick Secured Loan Enquiry Desk',
    description:
      'Official SG FINANCE Pune enquiry desk. Submit a confidential enquiry or connect on WhatsApp for secured lending solutions against eligible pledged movable assets.',
    canonicalPath: '/campaign',
  },
  '/connect': {
    title: 'SG FINANCE Pune | Quick Secured Loan Enquiry Desk',
    description:
      'Official SG FINANCE Pune enquiry desk. Submit a confidential enquiry or connect on WhatsApp for secured lending solutions against eligible pledged movable assets.',
    canonicalPath: '/campaign',
  },
  '/privacy-policy': {
    title: 'Privacy Policy | SG FINANCE Pune',
    description: 'Privacy Policy explaining how SG FINANCE handles customer enquiry data and confidentiality.',
    canonicalPath: '/privacy-policy',
  },
  '/terms-and-conditions': {
    title: 'Terms & Conditions | SG FINANCE Pune',
    description: 'Website Terms and Conditions governing use of the SG FINANCE public information platform.',
    canonicalPath: '/terms-and-conditions',
  },
  '/disclaimer': {
    title: 'Disclaimer | SG FINANCE Pune',
    description:
      'Important informational disclaimer regarding SG FINANCE services, eligibility assessments, and statutory approvals in Maharashtra, India.',
    canonicalPath: '/disclaimer',
  },
  '/loan-terms': {
    title: 'Loan Terms & Eligibility Overview | SG FINANCE Pune',
    description:
      'General overview of SG FINANCE secured facility considerations, asset evaluation, documentation, and formal sanction policy.',
    canonicalPath: '/loan-terms',
  },
  '/admin': {
    title: 'Admin Dashboard | SG FINANCE',
    description: 'Restricted SG FINANCE authorized staff dashboard.',
    canonicalPath: '/admin',
    noIndex: true,
  },
};

function escapeHtmlAttr(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

export function resolveRouteSeo(pathname: string): RouteSeoMeta {
  const cleanPath = pathname.split('?')[0].split('#')[0].replace(/\/+$/, '') || '/';
  return (
    ROUTE_SEO_MAP[cleanPath] ?? {
      title: 'SG FINANCE | Secured Lending & Financial Services in Pune, Maharashtra',
      description:
        'Thoughtful secured financial solutions and loans against eligible pledged movable assets in Pune, Maharashtra.',
      canonicalPath: cleanPath,
    }
  );
}

export function injectRouteSeoHtml(html: string, pathname: string, baseUrl: string): string {
  const normalizedBase = baseUrl.replace(/\/+$/, '');
  const meta = resolveRouteSeo(pathname);
  const canonicalUrl = `${normalizedBase}${meta.canonicalPath}`;
  const absoluteOgImage = `${normalizedBase}${OG_IMAGE_PATH}`;
  const robotsValue = meta.noIndex ? 'noindex, nofollow' : 'index, follow';

  const safeTitle = escapeHtmlAttr(meta.title);
  const safeDesc = escapeHtmlAttr(meta.description);
  const safeCanonical = escapeHtmlAttr(canonicalUrl);
  const safeOgImage = escapeHtmlAttr(absoluteOgImage);

  let updated = html;

  updated = updated.replace(/<title>[\s\S]*?<\/title>/i, `<title>${safeTitle}</title>`);
  updated = updated.replace(
    /<meta\s+name="description"\s+content="[^"]*"\s*\/?>/i,
    `<meta name="description" content="${safeDesc}" />`
  );
  updated = updated.replace(
    /<meta\s+name="robots"\s+content="[^"]*"\s*\/?>/i,
    `<meta name="robots" content="${robotsValue}" />`
  );
  updated = updated.replace(
    /<meta\s+property="og:title"\s+content="[^"]*"\s*\/?>/i,
    `<meta property="og:title" content="${safeTitle}" />`
  );
  updated = updated.replace(
    /<meta\s+property="og:description"\s+content="[^"]*"\s*\/?>/i,
    `<meta property="og:description" content="${safeDesc}" />`
  );
  updated = updated.replace(
    /<meta\s+property="og:image"\s+content="[^"]*"\s*\/?>/i,
    `<meta property="og:image" content="${safeOgImage}" />`
  );
  updated = updated.replace(
    /<meta\s+name="twitter:title"\s+content="[^"]*"\s*\/?>/i,
    `<meta name="twitter:title" content="${safeTitle}" />`
  );
  updated = updated.replace(
    /<meta\s+name="twitter:description"\s+content="[^"]*"\s*\/?>/i,
    `<meta name="twitter:description" content="${safeDesc}" />`
  );
  updated = updated.replace(
    /<meta\s+name="twitter:image"\s+content="[^"]*"\s*\/?>/i,
    `<meta name="twitter:image" content="${safeOgImage}" />`
  );

  // Replace or inject canonical link and og:url cleanly
  if (/<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/i.test(updated)) {
    updated = updated.replace(
      /<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/i,
      `<link rel="canonical" href="${safeCanonical}" />`
    );
  } else {
    updated = updated.replace(
      /<meta\s+property="og:type"/i,
      `<link rel="canonical" href="${safeCanonical}" />\n    <meta property="og:type"`
    );
  }

  if (/<meta\s+property="og:url"\s+content="[^"]*"\s*\/?>/i.test(updated)) {
    updated = updated.replace(
      /<meta\s+property="og:url"\s+content="[^"]*"\s*\/?>/i,
      `<meta property="og:url" content="${safeCanonical}" />`
    );
  } else {
    updated = updated.replace(
      /<meta\s+property="og:title"/i,
      `<meta property="og:url" content="${safeCanonical}" />\n    <meta property="og:title"`
    );
  }

  // Hydrate absolute URL & image placeholders inside JSON-LD if present
  updated = updated.replace(/__SITE_BASE_URL__/g, normalizedBase);
  updated = updated.replace(/__SITE_OG_IMAGE_URL__/g, absoluteOgImage);

  return updated;
}
