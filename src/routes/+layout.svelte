<script lang="ts">
  import './layout.css';
  import favicon from '$lib/assets/favicon.svg';

  const siteName = 'Sportsbook';
  const title = `${siteName} — Soccer odds, highlights & bet slip`;
  const description =
    'Browse soccer highlights with grouped competitions and dynamic markets, build a multi-selection bet slip with live totals, and review placed bets.';

  let { children, data } = $props();

  const canonicalUrl = $derived(data.canonicalUrl);
  const jsonLd = $derived(
    JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: siteName,
      description,
      url: canonicalUrl,
    }),
  );
</script>

<svelte:head>
  <title>{title}</title>
  <meta name="description" content={description} />

  <meta name="application-name" content={siteName} />
  <meta
    name="robots"
    content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"
  />
  <meta name="theme-color" content="#162a61" />
  <link rel="canonical" href={canonicalUrl} />

  <meta property="og:type" content="website" />
  <meta property="og:site_name" content={siteName} />
  <meta property="og:title" content={title} />
  <meta property="og:description" content={description} />
  <meta property="og:url" content={canonicalUrl} />
  <meta property="og:locale" content="en_US" />

  <meta name="twitter:card" content="summary" />
  <meta name="twitter:title" content={title} />
  <meta name="twitter:description" content={description} />

  {@html `<script type="application/ld+json">${jsonLd.replace(/</g, '\\u003c')}</script>`}

  <link rel="icon" href={favicon} />
</svelte:head>
{@render children()}
