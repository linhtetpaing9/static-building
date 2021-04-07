import Head from 'next/head';
import React from 'react'
import config from '../../customize/config';

const MetaTags = () => {
  return (
    <Head>
      <title>{config.defaultTitle}</title>
      {/* https://favicon.io/ */}
      <link rel="apple-touch-icon" sizes="180x180" href={`${config.domain}/img/favicon_io/apple-touch-icon.png`} />
      <link rel="icon" type="image/png" sizes="32x32" href={`${config.domain}/img/favicon_io/favicon-32x32.png`} />
      <link rel="icon" type="image/png" sizes="16x16" href={`${config.domain}/img/favicon_io/favicon-16x16.png`} />
      {/* <link rel="manifest" href={`${config.domain}/img/favicon_io/site.webmanifest`} /> */}
      {/* https://megatags.co/ */}
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta charSet="utf-8" />
      {/* Search Engine */}
      <meta name="description" content={config.description} />
      <meta name="image" content={`${config.domain}/img/og/1200x630.jpg`} />
      {/* Schema.org for Google */}
      <meta itemProp="name" content={config.defaultTitle} />
      <meta itemProp="description" content={config.description} />
      <meta itemProp="image" content={`${config.domain}/img/og/1200x630.jpg`} />
      {/* Twitter */}
      <meta name="twitter:card" content="summary" />
      <meta name="twitter:title" content={config.defaultTitle} />
      <meta name="twitter:description" content={config.description} />
      <meta name="twitter:image:src" content={`${config.domain}/img/og/1024x512.jpg`} />
      {/* Open Graph general (Facebook, Pinterest & Google+) */}
      <meta name="og:title" content={config.defaultTitle} />
      <meta name="og:description" content={config.description} />
      <meta name="og:image" content={`${config.domain}/img/og/1200x630.jpg`} />
      <meta name="og:url" content={`http://${config.domain}`} />
      <meta name="og:site_name" content={config.defaultTitle} />
      <meta name="og:locale" content="en_US" />
      <meta name="og:type" content="website" />
      {/* facebook pixel code */}
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      {/* custom font */}
      <link rel="stylesheet" type="text/css" href="/fonts/style.css" />
    </Head>
  )
}

export default MetaTags;