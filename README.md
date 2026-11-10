# Senddora website

Static, dependency-free website for Senddora: cashback up to 60% on selected offers and TRAI DLT registration services.

## Structure

```
senddora/
├── index.html               Home
├── offers.html              Explore Offers (filter: ?cat=cashback | ?cat=dlt)
├── how-it-works.html        Eligibility, tracking, approval, withdrawal + DLT process
├── about.html               About Senddora
├── contact.html             Contact form (prefill: ?topic=cashback|withdrawal|dlt|general|privacy&service=entity|header|template|consent|all)
├── privacy-policy.html      Privacy Policy (#data-deletion anchor for data deletion requests)
├── terms.html               Terms & Conditions
├── cashback-policy.html     Cashback Policy
├── refund-policy.html       Refund & Cancellation Policy
├── 404.html                 Not-found page
├── favicon.ico, site.webmanifest, robots.txt, sitemap.xml
├── _headers                 Security headers (Netlify / Cloudflare Pages)
├── .htaccess                Security headers, HTTPS, 404 (Apache / cPanel / Hostinger)
└── assets/
    ├── css/styles.css
    ├── js/main.js           Mobile menu, offer filters, contact form
    ├── img/                 Logo, favicon, app icons, social sharing image
    └── fonts/               Self-hosted Lora + Inter (SIL OFL 1.1)
```

## Deploy

Upload the contents of this folder to the web root of `senddora.in` (any static host:
Netlify, Cloudflare Pages, GitHub Pages, Vercel, or cPanel/Hostinger `public_html`).
No build step, database or server code is needed. Serve over HTTPS.

The canonical URLs, sitemap and social-sharing tags use `https://senddora.in`.
If the site lives on another domain, search-and-replace `https://senddora.in` across the files.

## Contact form

The form validates input, then opens the visitor's email app with a message to
support@senddora.in ready to send (with copy-to-clipboard as a fallback).
No data is stored on a server, so there is nothing to secure on the back end.

## Editing offers

Offers are plain HTML in `offers.html` (and the featured cashback offer on the home page).
Each card carries `data-category="cashback"` or `data-category="dlt"`, which the filter uses.
Copy an existing `<article class="offer-card">` block to add a new offer with its conditions.
