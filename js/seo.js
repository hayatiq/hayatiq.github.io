/* Search-engine helpers shared by the page (js/script.js) and the deploy tool
   (tools/product-pages.js, which loads this file the same way it loads products.js).
   Keep it plain: no DOM, no other globals, so it runs in both places.

   - CATEGORIES and their URL slugs: /category/hair-care, /category/salves-and-balms, ...
   - productJsonLd(): the schema.org Product "fact card" (name, photos, price, stock)
   - breadcrumbJsonLd(): Home › Category › Product, for search results
*/
const SEO_SITE = "https://hayatiq.netlify.app";
const SEO_BRAND = "HAYATIQ";

// Must match each product's `category` in js/products.js and the blocks in #view-categories.
const CATEGORIES = ["Hair Care", "Magnesium Oil Spray", "Oral Care", "Cleaning Supply", "Bath Bombs", "Footsoaks", "Salves & Balms"];

// Own title and description for the shop's fixed pages. js/script.js (setPageMeta) and
// tools/product-pages.js both read this, so a crawler without JavaScript gets the same
// words a browser shows. Titles about 60 characters, descriptions about 155 at most.
const STATIC_PAGES = {
  "/products": {
    title: "All Products — HAYATIQ Handmade Natural Wellness",
    description: "Shop all HAYATIQ products: magnesium oil spray, shampoo and conditioner bars, oral care, bath bombs and non-toxic cleaning. Cash on delivery in Bangladesh.",
  },
  "/categories": {
    title: "Shop by Category — HAYATIQ Bangladesh",
    description: "Browse HAYATIQ's hair care, magnesium oil spray, oral care, cleaning supply, bath bomb, footsoak and salve categories. Handmade in Bangladesh, cash on delivery.",
  },
  "/about": {
    title: "Our Story — HAYATIQ Handmade in Bangladesh",
    description: "HAYATIQ makes handmade natural wellness products with a minimal, elegant touch, inspired by nature and made to soothe both skin and mind.",
  },
  "/contact": {
    title: "Contact HAYATIQ — Questions and Orders",
    description: "Contact HAYATIQ with a question about our handmade natural wellness products, or message us on Facebook Messenger. Cash on delivery across Bangladesh.",
  },
};

// "Salves & Balms" -> "salves-and-balms". Part of a live URL: don't change for an existing category.
function categorySlug(name) {
  return String(name).toLowerCase().replace(/&/g, " and ").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}
function categoryFromSlug(slug) {
  return CATEGORIES.find((c) => categorySlug(c) === slug) || null;
}
function categoryPath(name) {
  return `/category/${categorySlug(name)}`;
}

// <title> for a product page: its `seoTitle`, else the name; when another product has the
// same name (e.g. two handwash packs), the subtitle too, so every page has its own title.
function productTitle(p, products) {
  if (p.seoTitle) return p.seoTitle;
  const shared = products.some((x) => x !== p && x.name === p.name);
  return `${p.name}${shared && p.subtitle ? ` · ${p.subtitle}` : ""} — Hayatiq`;
}

function absoluteUrl(src, site = SEO_SITE) {
  if (!src) return "";
  return /^https?:/.test(src) ? src : `${site}/${String(src).replace(/^\.?\//, "")}`;
}

const stripHtml = (html) => String(html || "").replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();

// The product as search engines should see it. `variantId` picks a variant (the page's
// current choice); without it, every variant's price counts (a price range).
function productJsonLd(p, site = SEO_SITE, variantId = null) {
  const variants = Array.isArray(p.variants) && p.variants.length ? p.variants : [p];
  const chosen = variantId ? variants.filter((v) => v.id === variantId) : variants;
  const shown = chosen[0] || variants[0];
  const prices = chosen.map((v) => v.price).filter((n) => typeof n === "number");
  const images = (shown.images || p.images || []).filter((src) => src && !src.includes("placeholder")).map((src) => absoluteUrl(src, site));
  const url = `${site}/product/${p.slug}`;
  const subtitle = shown.subtitle || p.subtitle || shown.label || "";
  const data = {
    "@context": "https://schema.org/",
    "@type": "Product",
    name: subtitle ? `${p.name} · ${subtitle}` : p.name,
    description: stripHtml(p.metaDescription || p.short),
    sku: variantId ? `${p.id}-${variantId}` : String(p.id),
    brand: { "@type": "Brand", name: SEO_BRAND },
    category: p.category,
    url,
  };
  if (images.length) data.image = images;
  // No number price (e.g. "Coming Soon"): no offer, since Google requires a price on one.
  if (prices.length) {
    const offer = {
      priceCurrency: "BDT",
      availability: "https://schema.org/InStock",
      itemCondition: "https://schema.org/NewCondition",
      url,
      seller: { "@type": "Organization", name: SEO_BRAND },
    };
    const low = Math.min(...prices);
    const high = Math.max(...prices);
    data.offers = low === high
      ? { "@type": "Offer", price: low, ...offer }
      : { "@type": "AggregateOffer", lowPrice: low, highPrice: high, offerCount: prices.length, ...offer };
  }
  const reviews = p.reviews || [];
  if (reviews.length) {
    const avg = reviews.reduce((sum, r) => sum + (Number(r.rating) || 0), 0) / reviews.length;
    data.aggregateRating = { "@type": "AggregateRating", ratingValue: avg.toFixed(1), reviewCount: reviews.length };
  }
  return data;
}

// items: [{ name, path }], the last one being the current page.
function breadcrumbJsonLd(items, site = SEO_SITE) {
  return {
    "@context": "https://schema.org/",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({ "@type": "ListItem", position: i + 1, name: it.name, item: `${site}${it.path}` })),
  };
}

// `</script>` inside JSON would end the <script> tag early.
const jsonForScript = (data) => JSON.stringify(data).replace(/</g, "\\u003c");
